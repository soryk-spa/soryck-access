// src/app/api/wallet/apple-pass/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateAppleWalletPass, WalletPassData } from '@/lib/wallet-pass'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const ticketId = searchParams.get('ticketId')
    
    if (!ticketId) {
      return NextResponse.json({ error: 'Ticket ID requerido' }, { status: 400 })
    }

    const user = await requireAuth()
    
    // Obtener información del ticket
    const ticket = await prisma.ticket.findFirst({
      where: {
        id: ticketId,
        userId: user.id
      },
      include: {
        event: {
          include: {
            organizer: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        order: {
          select: {
            orderNumber: true,
            totalAmount: true,
            currency: true
          }
        }
      }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 })
    }

    // Preparar datos para el pase
    const organizerName = ticket.event.organizer.firstName 
      ? `${ticket.event.organizer.firstName} ${ticket.event.organizer.lastName || ''}`.trim()
      : ticket.event.organizer.email

    const passData: WalletPassData = {
      ticketId: ticket.id,
      eventId: ticket.event.id,
      userId: user.id,
      eventTitle: ticket.event.title,
      attendeeName: user.firstName 
        ? `${user.firstName} ${user.lastName || ''}`.trim()
        : user.email,
      attendeeEmail: user.email,
      eventDate: ticket.event.startDate.toISOString(),
      eventLocation: ticket.event.location,
      qrCode: ticket.qrCode,
      timestamp: ticket.createdAt.toISOString(),
      organizerName,
      organizerEmail: ticket.event.organizer.email,
      venue: ticket.event.location,
      price: ticket.order.totalAmount,
      currency: ticket.order.currency,
      orderNumber: ticket.order.orderNumber
    }

    // Generar el JSON del pase
    const passJson = generateAppleWalletPass(passData)
    
    // En un entorno de producción, aquí deberías:
    // 1. Crear un archivo .pkpass completo con certificados
    // 2. Firmarlo con el certificado de Apple
    // 3. Comprimirlo en formato ZIP
    
    // Por ahora, devolvemos el JSON para desarrollo
    return NextResponse.json(passJson, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="ticket-${ticket.qrCode}.json"`
      }
    })

    // TODO: Implementación completa para producción
    /*
    const pkpassBuffer = await generatePKPassFile(passJson)
    
    return new NextResponse(pkpassBuffer, {
      headers: {
        'Content-Type': 'application/vnd.apple.pkpass',
        'Content-Disposition': `attachment; filename="ticket-${ticket.qrCode}.pkpass"`
      }
    })
    */

  } catch (error) {
    console.error('Error generating Apple Wallet pass:', error)
    return NextResponse.json(
      { error: 'Error generando pase de Apple Wallet' },
      { status: 500 }
    )
  }
}

