"use client"
import { useUser } from '@clerk/nextjs'
import { useEffect, useState, useCallback, useRef } from 'react'
import { UserRole } from '@prisma/client'
import { getRolePermissions, canOrganizeEvents, canAccessAdmin, isAdmin } from '@/lib/roles'

interface UserWithRole {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: UserRole
}

// Cache en memoria para evitar múltiples llamadas
const userCache = new Map<string, { data: UserWithRole; timestamp: number; ttl: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

function getCachedUser(userId: string): UserWithRole | null {
  const cached = userCache.get(userId)
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data
  }
  userCache.delete(userId)
  return null
}

function setCachedUser(userId: string, userData: UserWithRole, ttl = CACHE_TTL): void {
  userCache.set(userId, {
    data: userData,
    timestamp: Date.now(),
    ttl
  })
}

export function useRoles() {
  const { user: clerkUser, isLoaded } = useUser()
  const [dbUser, setDbUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchAttempted = useRef(false)

  const fetchUserRole = useCallback(async () => {
    if (!isLoaded || !clerkUser || fetchAttempted.current) {
      setLoading(false)
      return
    }

    fetchAttempted.current = true

    try {
      // Verificar caché primero
      const cachedUser = getCachedUser(clerkUser.id)
      if (cachedUser) {
        setDbUser(cachedUser)
        setError(null)
        setLoading(false)
        return
      }

      const response = await fetch('/api/user/profile')
      if (!response.ok) {
        throw new Error('Error al obtener perfil de usuario')
      }
      
      const userData = await response.json()
      const user = userData.user

      // Guardar en caché
      setCachedUser(clerkUser.id, user)
      
      setDbUser(user)
      setError(null)
    } catch (err) {
      console.error('Error fetching user role:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [clerkUser, isLoaded])

  useEffect(() => {
    fetchUserRole()
  }, [fetchUserRole])

  // Función para invalidar caché manualmente
  const invalidateCache = useCallback(() => {
    if (clerkUser) {
      userCache.delete(clerkUser.id)
      fetchAttempted.current = false
      setLoading(true)
      fetchUserRole()
    }
  }, [clerkUser, fetchUserRole])

  const permissions = dbUser ? getRolePermissions(dbUser.role) : null

  return {
    user: dbUser,
    loading: loading || !isLoaded,
    error,
    permissions,
    invalidateCache,
    hasRole: (role: UserRole) => dbUser ? dbUser.role === role : false,
    canOrganizeEvents: dbUser ? canOrganizeEvents(dbUser.role) : false,
    canAccessAdmin: dbUser ? canAccessAdmin(dbUser.role) : false,
    isAdmin: dbUser ? isAdmin(dbUser.role) : false,
    isClient: dbUser ? dbUser.role === UserRole.CLIENT : false,
    isOrganizer: dbUser ? dbUser.role === UserRole.ORGANIZER : false,
  }
}

export function useRequireRole(requiredRole: UserRole) {
  const { user, loading, hasRole } = useRoles()
  
  const hasRequiredRole = user ? hasRole(requiredRole) : false
  const shouldRedirect = !loading && user && !hasRequiredRole

  return {
    hasAccess: hasRequiredRole,
    loading,
    shouldRedirect,
    user
  }
}