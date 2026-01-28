import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Endpoint de Cron Job para limpiar reservas de asientos expiradas
 * 
 * Este endpoint debe ser configurado en vercel.json para ejecutarse periódicamente.
 * Elimina todas las reservas cuya fecha de expiración ya pasó.
 * 
 * Seguridad: Verifica que la petición venga de Vercel Cron usando el header de autorización
 */
export async function GET(request: NextRequest) {
  console.log('[CRON-CLEANUP] Iniciando limpieza de reservas expiradas...')

  // Verificar que la petición viene de Vercel Cron
  const authHeader = request.headers.get('authorization')
  
  if (process.env.CRON_SECRET) {
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      console.error('[CRON-CLEANUP] Intento de acceso no autorizado')
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }
  } else {
    console.warn('[CRON-CLEANUP] CRON_SECRET no está configurado. El endpoint está desprotegido.')
  }

  try {
    const now = new Date()
    
    // Eliminar reservas expiradas
    const result = await prisma.seatReservation.deleteMany({
      where: {
        expiresAt: {
          lt: now,
        },
      },
    })

    console.log(`[CRON-CLEANUP] Eliminadas ${result.count} reservas expiradas`)

    // Opcional: También limpiar órdenes pendientes muy antiguas (más de 24 horas)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    
    const oldOrders = await prisma.order.updateMany({
      where: {
        status: 'PENDING',
        createdAt: {
          lt: oneDayAgo,
        },
      },
      data: {
        status: 'CANCELLED',
      },
    })

    console.log(`[CRON-CLEANUP] Canceladas ${oldOrders.count} órdenes pendientes antiguas`)

    return NextResponse.json({
      success: true,
      deletedReservations: result.count,
      cancelledOrders: oldOrders.count,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error('[CRON-CLEANUP] Error al limpiar reservas:', error)
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
