import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

const updateRoleSchema = z.object({
  userId: z.string().min(1, 'User ID es requerido'),
  role: z.nativeEnum(UserRole)
})

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await requireAdmin()
    
    const body = await request.json()
    const validation = updateRoleSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }

    const { userId, role } = validation.data

    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      )
    }

    if (
      targetUser.id === currentUser.id && 
      targetUser.role === UserRole.ADMIN && 
      role !== UserRole.ADMIN
    ) {
      const adminCount = await prisma.user.count({
        where: { role: UserRole.ADMIN }
      })

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'No puedes quitarte el rol de administrador siendo el único admin del sistema' },
          { status: 400 }
        )
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      message: 'Rol actualizado exitosamente',
      user: updatedUser
    })

  } catch (error) {
    console.error('Error updating user role:', error)
    
    if (error instanceof Error && error.message.includes('no autenticado')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message.includes('Acceso denegado')) {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    await requireAdmin()
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: [
        { role: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json({ users })

  } catch (error) {
    console.error('Error fetching users:', error)
    
    if (error instanceof Error && error.message.includes('no autenticado')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    if (error instanceof Error && error.message.includes('Acceso denegado')) {
      return NextResponse.json(
        { error: 'Acceso denegado. Se requieren permisos de administrador' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}