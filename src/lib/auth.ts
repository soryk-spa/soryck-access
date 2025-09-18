import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { hasRole, canOrganizeEvents, canAccessAdmin } from '@/lib/roles'
import { syncUserFromClerk } from '@/lib/sync-user'
import { CacheService } from '@/lib/redis'

export async function getCurrentUser() {
  const requestId = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const { userId } = await auth()

  if (!userId) {
    console.warn(`[auth:${requestId}] auth() returned no userId`)
    return null
  }

  try {
    const cache = CacheService.getInstance()

    const cachedUser = await cache.getUserFullData(userId)
    if (cachedUser) {
      console.log(`[auth:${requestId}] found cached user for ${userId}`)
      const user = await prisma.user.findUnique({
        where: {
          clerkId: userId
        }
      })
      
      if (user) {
        return user
      }
    }

    let user = await prisma.user.findUnique({
      where: {
        clerkId: userId
      }
    })

    if (!user) {
      console.log(`[auth:${requestId}] Usuario ${userId} no encontrado en BD, sincronizando desde Clerk...`)
      try {
        user = await syncUserFromClerk(userId)
        console.log(`[auth:${requestId}] syncUserFromClerk succeeded for ${userId}`)
      } catch (syncError) {
        console.error(`[auth:${requestId}] Error al sincronizar usuario desde Clerk:`, syncError)
        return null
      }
    }

    
    if (user) {
      const userData = {
        id: user.id,
        clerkId: user.clerkId,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        role: user.role,
      }
      
      
      await cache.setUserBatch(userId, userData)
      console.log(`[auth:${requestId}] cached user data for ${userId}`)
    }

    return user
  } catch (error) {
    console.error('Error fetching user:', error)
    return null
  }
}


export async function getCurrentUserRole() {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  try {
    const cache = CacheService.getInstance()

    
    const cachedRole = await cache.getUserRole(userId)
    if (cachedRole) {
      return cachedRole as UserRole
    }

    
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { role: true, id: true }
    })

    if (user) {
      
      await cache.setUserRole(userId, user.role)
      return user.role
    }

    return null
  } catch (error) {
    console.error('Error fetching user role:', error)
    return null
  }
}

export async function requireAuth() {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error('Usuario no autenticado')
  }

  return user
}

export async function requireRole(requiredRole: UserRole) {
  const user = await requireAuth()
  
  if (!hasRole(user.role, requiredRole)) {
    throw new Error(`Acceso denegado. Se requiere rol: ${requiredRole}`)
  }

  return user
}

export async function requireOrganizer() {
  const user = await requireAuth()
  
  if (!canOrganizeEvents(user.role)) {
    throw new Error('Acceso denegado. Solo organizadores y administradores pueden realizar esta acción')
  }

  return user
}

export async function requireAdmin() {
  const user = await requireAuth()
  
  if (!canAccessAdmin(user.role)) {
    throw new Error('Acceso denegado. Solo administradores pueden realizar esta acción')
  }

  return user
}

export async function canAccessEvent(eventId: string) {
  const user = await requireAuth()
  
  if (canAccessAdmin(user.role)) {
    return { user, canAccess: true, isOwner: false, isAdmin: true }
  }

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { organizerId: true }
  })

  if (!event) {
    throw new Error('Evento no encontrado')
  }

  const isOwner = event.organizerId === user.id
  const canAccess = isOwner || canAccessAdmin(user.role)

  return { user, canAccess, isOwner, isAdmin: false }
}

export async function checkRoutePermissions(route: string) {
  const user = await getCurrentUser()

  if (!user) {
    return { hasAccess: false, redirectTo: '/sign-in' }
  }

  const organizerRoutes = ['/events/create', '/events/manage', '/dashboard/events', '/dashboard/events/new']
  if (organizerRoutes.some(r => route.startsWith(r))) {
    if (!canOrganizeEvents(user.role)) {
      return { hasAccess: false, redirectTo: '/unauthorized' }
    }
  }

  const adminRoutes = ['/admin']
  if (adminRoutes.some(r => route.startsWith(r))) {
    if (!canAccessAdmin(user.role)) {
      return { hasAccess: false, redirectTo: '/unauthorized' }
    }
  }

  return { hasAccess: true }
}