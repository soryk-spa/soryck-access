import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UserRole } from '@prisma/client'

export async function GET() {
  try {
    await requireAdmin()

    const now = new Date()
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    const [
      totalRequests,
      pendingRequests,
      approvedRequests,
      rejectedRequests,
      thisMonthRequests,
      lastMonthRequests,
      requestsByRole,
      responseTimeData
    ] = await Promise.all([
      prisma.roleRequest.count(),
      
      prisma.roleRequest.count({
        where: { status: 'PENDING' }
      }),
      
      prisma.roleRequest.count({
        where: { status: 'APPROVED' }
      }),
      
      prisma.roleRequest.count({
        where: { status: 'REJECTED' }
      }),

      Promise.all([
        prisma.roleRequest.count({
          where: {
            createdAt: { gte: thisMonthStart }
          }
        }),
        prisma.roleRequest.count({
          where: {
            createdAt: { gte: thisMonthStart },
            status: 'APPROVED'
          }
        }),
        prisma.roleRequest.count({
          where: {
            createdAt: { gte: thisMonthStart },
            status: 'REJECTED'
          }
        })
      ]),

      Promise.all([
        prisma.roleRequest.count({
          where: {
            createdAt: {
              gte: lastMonthStart,
              lte: lastMonthEnd
            }
          }
        }),
        prisma.roleRequest.count({
          where: {
            createdAt: {
              gte: lastMonthStart,
              lte: lastMonthEnd
            },
            status: 'APPROVED'
          }
        }),
        prisma.roleRequest.count({
          where: {
            createdAt: {
              gte: lastMonthStart,
              lte: lastMonthEnd
            },
            status: 'REJECTED'
          }
        })
      ]),

      prisma.roleRequest.groupBy({
        by: ['requestedRole'],
        _count: { requestedRole: true },
        where: {
          createdAt: {
            gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
          }
        }
      }),

      prisma.roleRequest.findMany({
        where: {
          status: { in: ['APPROVED', 'REJECTED'] },
          reviewedAt: { not: null },
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        select: {
          createdAt: true,
          reviewedAt: true
        }
      })
    ])

    const roleStatsMap = new Map()
    
    Object.values(UserRole).forEach(role => {
      roleStatsMap.set(role, { count: 0, approved: 0, rejected: 0 })
    })
    
    for (const roleData of requestsByRole) {
      const [approved, rejected] = await Promise.all([
        prisma.roleRequest.count({
          where: {
            requestedRole: roleData.requestedRole,
            status: 'APPROVED',
            createdAt: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
            }
          }
        }),
        prisma.roleRequest.count({
          where: {
            requestedRole: roleData.requestedRole,
            status: 'REJECTED',
            createdAt: {
              gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ])
      
      roleStatsMap.set(roleData.requestedRole, {
        count: roleData._count.requestedRole,
        approved,
        rejected
      })
    }

    const responseTimesInHours = responseTimeData.map(request => {
      const createdAt = new Date(request.createdAt)
      const reviewedAt = new Date(request.reviewedAt!)
      return (reviewedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
    })

    const averageResponseTime = responseTimesInHours.length > 0
      ? responseTimesInHours.reduce((sum, time) => sum + time, 0) / responseTimesInHours.length
      : 0

    const medianResponseTime = responseTimesInHours.length > 0
      ? (() => {
          const sorted = responseTimesInHours.sort((a, b) => a - b)
          const mid = Math.floor(sorted.length / 2)
          return sorted.length % 2 === 0
            ? (sorted[mid - 1] + sorted[mid]) / 2
            : sorted[mid]
        })()
      : 0

    const stats = {
      total: totalRequests,
      pending: pendingRequests,
      approved: approvedRequests,
      rejected: rejectedRequests,
      thisMonth: {
        total: thisMonthRequests[0],
        approved: thisMonthRequests[1],
        rejected: thisMonthRequests[2]
      },
      lastMonth: {
        total: lastMonthRequests[0],
        approved: lastMonthRequests[1],
        rejected: lastMonthRequests[2]
      },
      byRole: Array.from(roleStatsMap.entries()).map(([role, data]) => ({
        role,
        count: data.count,
        approved: data.approved,
        rejected: data.rejected
      })),
      responseTime: {
        average: Math.round(averageResponseTime * 10) / 10,
        median: Math.round(medianResponseTime * 10) / 10
      }
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Error fetching role request stats:', error)
    
    if (error instanceof Error && error.message.includes('Acceso denegado')) {
      return NextResponse.json(
        { error: 'Solo administradores pueden ver estadísticas de solicitudes de rol' },
        { status: 403 }
      )
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}