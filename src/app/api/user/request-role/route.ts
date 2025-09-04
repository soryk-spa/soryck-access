import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

const roleRequestSchema = z.object({
  requestedRole: z.nativeEnum(UserRole),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres').max(1000, 'El mensaje es demasiado largo')
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    
    const validation = roleRequestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }

    const { requestedRole, message } = validation.data

    if (user.role === requestedRole) {
      return NextResponse.json(
        { error: 'Ya tienes este rol' },
        { status: 400 }
      )
    }

    const roleHierarchy = {
      [UserRole.CLIENT]: 1,
      [UserRole.ORGANIZER]: 2,
      [UserRole.SCANNER]: 3,
      [UserRole.ADMIN]: 4
    }

    if (roleHierarchy[requestedRole] <= roleHierarchy[user.role]) {
      return NextResponse.json(
        { error: 'No puedes solicitar un rol de menor jerarquía' },
        { status: 400 }
      )
    }

    const existingRequest = await prisma.roleRequest.findFirst({
      where: {
        userId: user.id,
        status: 'PENDING'
      }
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: 'Ya tienes una solicitud pendiente' },
        { status: 400 }
      )
    }

    const roleRequest = await prisma.roleRequest.create({
      data: {
        userId: user.id,
        currentRole: user.role,
        requestedRole,
        message,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    

    return NextResponse.json({
      message: 'Solicitud de rol enviada exitosamente',
      requestId: roleRequest.id
    })

  } catch (error) {
    console.error('Error creating role request:', error)
    
    if (error instanceof Error && error.message.includes('no autenticado')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
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
    const user = await requireAuth()
    
    const requests = await prisma.roleRequest.findMany({
      where: {
        userId: user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ requests })

  } catch (error) {
    console.error('Error fetching role requests:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}