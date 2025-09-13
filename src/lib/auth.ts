import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { hasRole, canOrganizeEvents, canAccessAdmin } from '@/lib/roles'
import { syncUserFromClerk } from '@/lib/sync-user'
import { CacheService } from '@/lib/redis'

export async function getCurrentUser() {
  try {
    console.log('🔵 [AUTH] Iniciando getCurrentUser...')
    const { userId } = await auth()
    console.log('🔵 [AUTH] UserId obtenido de Clerk:', userId)
    
    if (!userId) {
      console.log('❌ [AUTH] No userId encontrado en Clerk auth()')
      return null
    }

    try {
      const cache = CacheService.getInstance()
      console.log('🔵 [AUTH] Cache service obtenido')

      // Try to get user from cache first
      const cachedUser = await cache.getUserFullData(userId)
      if (cachedUser) {
        console.log('✅ [AUTH] Usuario encontrado en cache')
        // Double check if user still exists in database
        const user = await prisma.user.findUnique({
          where: {
            clerkId: userId
          }
        })
        
        if (user) {
          console.log('✅ [AUTH] Usuario verificado en BD:', { id: user.id, email: user.email, role: user.role })
          return user
        }
        console.log('⚠️ [AUTH] Usuario en cache pero no en BD, continuando con flujo normal')
      }

      console.log('🔵 [AUTH] Buscando usuario en BD con clerkId:', userId)
      let user = await prisma.user.findUnique({
        where: {
          clerkId: userId
        }
      })

      if (!user) {
        console.log(`⚠️ [AUTH] Usuario ${userId} no encontrado en BD, sincronizando desde Clerk...`)
        try {
          user = await syncUserFromClerk(userId)
          console.log('✅ [AUTH] Usuario sincronizado desde Clerk:', user ? { id: user.id, email: user.email } : 'null')
        } catch (syncError) {
          console.error('❌ [AUTH] Error al sincronizar usuario desde Clerk:', syncError)
          return null
        }
      } else {
        console.log('✅ [AUTH] Usuario encontrado en BD:', { id: user.id, email: user.email, role: user.role })
      }

      // Cache user data if found
      if (user) {
        const userData = {
          id: user.id,
          clerkId: user.clerkId,
          email: user.email,
          firstName: user.firstName || undefined,
          lastName: user.lastName || undefined,
          role: user.role,
        }
        
        // Set user data in cache
        await cache.setUserBatch(userId, userData)
        console.log('✅ [AUTH] Datos de usuario guardados en cache')
      }

      console.log('🔵 [AUTH] getCurrentUser completado, retornando:', user ? 'Usuario válido' : 'null')
      return user
    } catch (error) {
      console.error('❌ [AUTH] Error fetching user:', error)
      return null
    }
  } catch (outerError) {
    console.error('❌ [AUTH] Error en getCurrentUser (outer):', outerError)
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
  console.log('🔵 [AUTH] Iniciando requireAuth...')
  const user = await getCurrentUser()
  console.log('🔵 [AUTH] Resultado de getCurrentUser:', user ? `Usuario válido (${user.email})` : 'null')
  
  if (!user) {
    console.log('❌ [AUTH] requireAuth fallando: Usuario no autenticado')
    throw new Error('Usuario no autenticado')
  }

  console.log('✅ [AUTH] requireAuth exitoso para usuario:', { id: user.id, email: user.email, role: user.role })
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