
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

    
    const passJson = generateAppleWalletPass(passData)
    
    
    
    
    
    
    
    return NextResponse.json(passJson, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="ticket-${ticket.qrCode}.json"`
      }
    })

    
    

  } catch (error) {
    console.error('Error generating Apple Wallet pass:', error)
    return NextResponse.json(
      { error: 'Error generando pase de Apple Wallet' },
      { status: 500 }
    )
  }
}

