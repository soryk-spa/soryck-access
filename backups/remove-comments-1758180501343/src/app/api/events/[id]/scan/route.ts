import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// Ensure this API route runs dynamically so server-side auth can access the request
export const dynamic = 'force-dynamic'
import { z } from 'zod';

const scanTicketSchema = z.object({
  qrCode: z.string(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}


export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: eventId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { qrCode } = scanTicketSchema.parse(body);

    
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        scanners: {
          where: { scannerId: user.id },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    const isOrganizer = event.organizerId === user.id;
    const isScanner = event.scanners.length > 0;
    const isAdmin = user.role === 'ADMIN';

    if (!isOrganizer && !isScanner && !isAdmin) {
      return NextResponse.json(
        { error: 'No tienes permisos para escanear tickets de este evento' },
        { status: 403 }
      );
    }

    
    const ticket = await prisma.ticket.findUnique({
      where: { qrCode },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
          },
        },
        courtesyInvitation: {
          select: {
            id: true,
            invitedName: true,
            invitedEmail: true,
            status: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
    }

    
    if (ticket.eventId !== eventId) {
      return NextResponse.json(
        { error: 'Este ticket no pertenece a este evento' },
        { status: 400 }
      );
    }

    
    if (ticket.isUsed) {
      return NextResponse.json({
        error: 'Ticket ya utilizado',
        ticket: {
          id: ticket.id,
          qrCode: ticket.qrCode,
          isUsed: true,
          usedAt: ticket.usedAt,
          user: ticket.user,
          order: ticket.order,
          courtesyInvitation: ticket.courtesyInvitation,
        },
        event: ticket.event,
        status: 'ALREADY_USED',
      }, { status: 400 });
    }

    
    if (ticket.status !== 'ACTIVE') {
      return NextResponse.json({
        error: 'Ticket no está activo',
        ticket: {
          id: ticket.id,
          qrCode: ticket.qrCode,
          status: ticket.status,
          user: ticket.user,
          order: ticket.order,
          courtesyInvitation: ticket.courtesyInvitation,
        },
        event: ticket.event,
        status: 'INACTIVE',
      }, { status: 400 });
    }

    
    const now = new Date();
    if (ticket.event.endDate && now > ticket.event.endDate) {
      return NextResponse.json({
        error: 'El evento ya ha terminado',
        ticket: {
          id: ticket.id,
          qrCode: ticket.qrCode,
          user: ticket.user,
          order: ticket.order,
          courtesyInvitation: ticket.courtesyInvitation,
        },
        event: ticket.event,
        status: 'EVENT_ENDED',
      }, { status: 400 });
    }

    
    const updatedTicket = await prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        isUsed: true,
        usedAt: now,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
          },
        },
        courtesyInvitation: {
          select: {
            id: true,
            invitedName: true,
            invitedEmail: true,
            status: true,
          },
        },
      },
    });

    
    if (ticket.courtesyInvitation) {
      await prisma.courtesyInvitation.update({
        where: { id: ticket.courtesyInvitation.id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: now,
        },
      });
    }

    return NextResponse.json({
      message: 'Ticket validado exitosamente',
      ticket: {
        id: updatedTicket.id,
        qrCode: updatedTicket.qrCode,
        isUsed: true,
        usedAt: updatedTicket.usedAt,
        user: updatedTicket.user,
        order: updatedTicket.order,
        courtesyInvitation: updatedTicket.courtesyInvitation,
      },
      event: ticket.event,
      scannedBy: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
      },
      status: 'SUCCESS',
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error scanning ticket:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: eventId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        scanners: {
          where: { scannerId: user.id },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    const isOrganizer = event.organizerId === user.id;
    const isScanner = event.scanners.length > 0;
    const isAdmin = user.role === 'ADMIN';

    if (!isOrganizer && !isScanner && !isAdmin) {
      return NextResponse.json(
        { error: 'No tienes permisos para ver las estadísticas de este evento' },
        { status: 403 }
      );
    }

    
    const stats = await prisma.ticket.groupBy({
      by: ['isUsed'],
      where: { eventId },
      _count: {
        id: true,
      },
    });

    const totalTickets = stats.reduce((total, stat) => total + stat._count.id, 0);
    const usedTickets = stats.find(stat => stat.isUsed)?._count.id || 0;
    const unusedTickets = totalTickets - usedTickets;

    
    const courtesyStats = await prisma.courtesyInvitation.groupBy({
      by: ['status'],
      where: { eventId },
      _count: {
        id: true,
      },
    });

    const courtesyBreakdown = {
      total: courtesyStats.reduce((total, stat) => total + stat._count.id, 0),
      pending: courtesyStats.find(stat => stat.status === 'PENDING')?._count.id || 0,
      sent: courtesyStats.find(stat => stat.status === 'SENT')?._count.id || 0,
      accepted: courtesyStats.find(stat => stat.status === 'ACCEPTED')?._count.id || 0,
      expired: courtesyStats.find(stat => stat.status === 'EXPIRED')?._count.id || 0,
    };

    return NextResponse.json({
      eventId,
      eventTitle: event.title,
      tickets: {
        total: totalTickets,
        used: usedTickets,
        unused: unusedTickets,
        usagePercentage: totalTickets > 0 ? Math.round((usedTickets / totalTickets) * 100) : 0,
      },
      courtesy: courtesyBreakdown,
      lastUpdated: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error fetching scan statistics:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
