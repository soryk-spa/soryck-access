import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { CacheService } from '@/lib/redis'
import { auth } from '@clerk/nextjs/server'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Usuario no autenticado' },
        { status: 401 }
      )
    }

    const cache = CacheService.getInstance()

    // Intentar obtener desde caché primero
    const cachedUser = await cache.getUserFullData(userId)
    if (cachedUser) {
      return NextResponse.json({
        user: {
          id: cachedUser.id,
          email: cachedUser.email,
          firstName: cachedUser.firstName,
          lastName: cachedUser.lastName,
          role: cachedUser.role,
        }
      })
    }

    // Si no está en caché, obtener de la base de datos
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    // Preparar datos para caché
    const userData = {
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      firstName: user.firstName || undefined,
      lastName: user.lastName || undefined,
      role: user.role,
    }

    // Guardar en caché con batch operation
    await cache.setUserBatch(userId, userData)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        imageUrl: user.imageUrl,
        createdAt: user.createdAt
      }
    })

  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}