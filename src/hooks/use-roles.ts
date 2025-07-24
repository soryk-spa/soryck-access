'use client'

import { useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'
import { UserRole } from '@prisma/client'
import { getRolePermissions, canOrganizeEvents, canAccessAdmin, isAdmin } from '@/lib/roles'

interface UserWithRole {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: UserRole
}

export function useRoles() {
  const { user: clerkUser, isLoaded } = useUser()
  const [dbUser, setDbUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchUserRole() {
      if (!isLoaded || !clerkUser) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/user/profile')
        if (!response.ok) {
          throw new Error('Error al obtener perfil de usuario')
        }
        
        const userData = await response.json()
        setDbUser(userData.user)
        setError(null)
      } catch (err) {
        console.error('Error fetching user role:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchUserRole()
  }, [clerkUser, isLoaded])

  const permissions = dbUser ? getRolePermissions(dbUser.role) : null

  return {
    user: dbUser,
    loading: loading || !isLoaded,
    error,
    permissions,
    // Funciones de utilidad
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