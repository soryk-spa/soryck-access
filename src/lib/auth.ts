import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { hasRole, canOrganizeEvents, canAccessAdmin } from '@/lib/roles'
import { syncUserFromClerk } from '@/lib/sync-user'

export async function getCurrentUser() {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  try {
    let user = await prisma.user.findUnique({
      where: {
        clerkId: userId
      }
    })

    if (!user) {
      console.log(`Usuario ${userId} no encontrado en BD, sincronizando desde Clerk...`)
      user = await syncUserFromClerk(userId)
    }

    return user
  } catch (error) {
    console.error('Error fetching user:', error)
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