import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    await requireAdmin()
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')
    const requestedRole = searchParams.get('requestedRole')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    const whereClause: Record<string, unknown> = {}
    
    if (status && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
      whereClause.status = status
    }
    
    if (userId) {
      whereClause.userId = userId
    }
    
    if (requestedRole && Object.values(UserRole).includes(requestedRole as UserRole)) {
      whereClause.requestedRole = requestedRole
    }

    const [requests, totalCount] = await Promise.all([
      prisma.roleRequest.findMany({
        where: whereClause,
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
        },
        orderBy: [
          { status: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.roleRequest.count({ where: whereClause })
    ])

    const stats = await prisma.roleRequest.groupBy({
      by: ['status'],
      _count: { status: true }
    })

    const statusStats = stats.reduce((acc, item) => {
      acc[item.status] = item._count.status
      return acc
    }, {} as Record<string, number>)

    const serializedRequests = requests.map(request => ({
      ...request,
      createdAt: request.createdAt.toISOString(),
      updatedAt: request.updatedAt.toISOString(),
      reviewedAt: request.reviewedAt?.toISOString() || null,
      user: {
        ...request.user,
        createdAt: request.user.createdAt.toISOString(),
      }
    }))

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      requests: serializedRequests,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
        limit
      },
      stats: {
        total: totalCount,
        pending: statusStats.PENDING || 0,
        approved: statusStats.APPROVED || 0,
        rejected: statusStats.REJECTED || 0,
      },
      filters: {
        status,
        userId,
        requestedRole,
        page,
        limit
      }
    })

  } catch (error) {
    console.error('Error fetching role requests:', error)
    
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

export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await requireAdmin()
    const body = await request.json()
    
    const { action, requestIds, message } = body
    
    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Acción inválida. Debe ser "approve" o "reject"' },
        { status: 400 }
      )
    }
    
    if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
      return NextResponse.json(
        { error: 'Debe proporcionar al menos una solicitud para procesar' },
        { status: 400 }
      )
    }

    const requests = await prisma.roleRequest.findMany({
      where: {
        id: { in: requestIds },
        status: 'PENDING'
      },
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

    if (requests.length !== requestIds.length) {
      return NextResponse.json(
        { error: 'Algunas solicitudes no existen o ya han sido procesadas' },
        { status: 400 }
      )
    }

    if (action === 'approve') {
      const ownRequest = requests.find(req => req.userId === currentUser.id)
      if (ownRequest) {
        return NextResponse.json(
          { error: 'No puedes aprobar tu propia solicitud' },
          { status: 400 }
        )
      }

      const adminRequests = requests.filter(req => req.requestedRole === UserRole.ADMIN)
      if (adminRequests.length > 0 && currentUser.role !== UserRole.ADMIN) {
        return NextResponse.json(
          { error: 'Solo administradores pueden asignar rol de administrador' },
          { status: 403 }
        )
      }
    }

    const results = await prisma.$transaction(async (tx) => {
      const updatedRequests = []
      
      for (const request of requests) {
        const updatedRequest = await tx.roleRequest.update({
          where: { id: request.id },
          data: {
            status: action === 'approve' ? 'APPROVED' : 'REJECTED',
            reviewedBy: currentUser.id,
            reviewedAt: new Date(),
          }
        })
        
        if (action === 'approve') {
          await tx.user.update({
            where: { id: request.userId },
            data: {
              role: request.requestedRole
            }
          })
        }
        
        updatedRequests.push({
          ...updatedRequest,
          user: request.user
        })
      }
      
      return updatedRequests
    })

    results.forEach(result => {
      console.log(`Batch role request ${action}d:`, {
        requestId: result.id,
        userId: result.userId,
        userEmail: result.user.email,
        fromRole: result.currentRole,
        toRole: result.requestedRole,
        reviewedBy: currentUser.email,
        action,
        message
      })
    })

    const actionText = action === 'approve' ? 'aprobadas' : 'rechazadas'

    return NextResponse.json({
      message: `${results.length} solicitud${results.length > 1 ? 'es' : ''} ${actionText} exitosamente`,
      processedCount: results.length,
      results: results.map(result => ({
        id: result.id,
        userId: result.userId,
        userEmail: result.user.email,
        status: result.status,
        newRole: action === 'approve' ? result.requestedRole : result.user.role
      }))
    })

  } catch (error) {
    console.error('Error processing batch role requests:', error)
    
    if (error instanceof Error && error.message.includes('Acceso denegado')) {
      return NextResponse.json(
        { error: 'Solo administradores pueden procesar solicitudes de rol' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}