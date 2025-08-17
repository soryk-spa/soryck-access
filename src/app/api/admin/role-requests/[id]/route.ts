import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

const reviewRequestSchema = z.object({
  action: z.enum(['approve', 'reject']),
  message: z.string().optional()
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAdmin()
    const { id } = await params
    
    const body = await request.json()
    const validation = reviewRequestSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Datos inválidos',
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }

    const { action, message } = validation.data

    const roleRequest = await prisma.roleRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true
          }
        }
      }
    })

    if (!roleRequest) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }

    if (roleRequest.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Esta solicitud ya ha sido procesada' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      if (roleRequest.userId === currentUser.id) {
        return NextResponse.json(
          { error: 'No puedes aprobar tu propia solicitud' },
          { status: 400 }
        )
      }

      if (!Object.values(UserRole).includes(roleRequest.requestedRole)) {
        return NextResponse.json(
          { error: 'Rol solicitado inválido' },
          { status: 400 }
        )
      }

      if (roleRequest.requestedRole === UserRole.ADMIN && currentUser.role !== UserRole.ADMIN) {
        return NextResponse.json(
          { error: 'Solo administradores pueden asignar rol de administrador' },
          { status: 403 }
        )
      }
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedRequest = await tx.roleRequest.update({
        where: { id },
        data: {
          status: action === 'approve' ? 'APPROVED' : 'REJECTED',
          reviewedBy: currentUser.id,
          reviewedAt: new Date(),
        }
      })

      if (action === 'approve') {
        await tx.user.update({
          where: { id: roleRequest.userId },
          data: {
            role: roleRequest.requestedRole
          }
        })
      }

      return updatedRequest
    })

    console.log(`Role request ${action}d:`, {
      requestId: id,
      userId: roleRequest.userId,
      userEmail: roleRequest.user.email,
      fromRole: roleRequest.currentRole,
      toRole: roleRequest.requestedRole,
      reviewedBy: currentUser.email,
      action,
      message
    })

    const actionText = action === 'approve' ? 'aprobada' : 'rechazada'
    const userName = roleRequest.user.firstName 
      ? `${roleRequest.user.firstName} ${roleRequest.user.lastName || ''}`.trim()
      : roleRequest.user.email

    return NextResponse.json({
      message: `Solicitud ${actionText} exitosamente`,
      request: result,
      user: {
        name: userName,
        email: roleRequest.user.email,
        newRole: action === 'approve' ? roleRequest.requestedRole : roleRequest.user.role
      }
    })

  } catch (error) {
    console.error('Error reviewing role request:', error)
    
    if (error instanceof Error && error.message.includes('Acceso denegado')) {
      return NextResponse.json(
        { error: 'Solo administradores pueden revisar solicitudes de rol' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id } = await params
    
    const roleRequest = await prisma.roleRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            role: true,
            createdAt: true
          }
        }
      }
    })

    if (!roleRequest) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }

    const serializedRequest = {
      ...roleRequest,
      createdAt: roleRequest.createdAt.toISOString(),
      updatedAt: roleRequest.updatedAt.toISOString(),
      reviewedAt: roleRequest.reviewedAt?.toISOString() || null,
      user: {
        ...roleRequest.user,
        createdAt: roleRequest.user.createdAt.toISOString(),
      }
    }

    return NextResponse.json({ request: serializedRequest })

  } catch (error) {
    console.error('Error fetching role request:', error)
    
    if (error instanceof Error && error.message.includes('Acceso denegado')) {
      return NextResponse.json(
        { error: 'Solo administradores pueden ver solicitudes de rol' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await requireAdmin()
    const { id } = await params
    
    const roleRequest = await prisma.roleRequest.findUnique({
      where: { id },
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

    if (!roleRequest) {
      return NextResponse.json(
        { error: 'Solicitud no encontrada' },
        { status: 404 }
      )
    }

    if (roleRequest.status === 'PENDING') {
      return NextResponse.json(
        { error: 'No se pueden eliminar solicitudes pendientes. Primero debe aprobarlas o rechazarlas.' },
        { status: 400 }
      )
    }

    await prisma.roleRequest.delete({
      where: { id }
    })

    console.log(`Role request deleted:`, {
      requestId: id,
      userEmail: roleRequest.user.email,
      deletedBy: currentUser.email,
      originalStatus: roleRequest.status
    })

    return NextResponse.json({
      message: 'Solicitud eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error deleting role request:', error)
    
    if (error instanceof Error && error.message.includes('Acceso denegado')) {
      return NextResponse.json(
        { error: 'Solo administradores pueden eliminar solicitudes de rol' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}