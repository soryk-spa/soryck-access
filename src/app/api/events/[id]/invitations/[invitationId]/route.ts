import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendCourtesyInvitationEmail } from '@/lib/email';
import { z } from 'zod';
import crypto from 'crypto';

const updateInvitationSchema = z.object({
  action: z.enum(['SEND', 'RESEND', 'CANCEL', 'GENERATE_TICKET']),
});

interface RouteParams {
  params: Promise<{
    id: string;
    invitationId: string;
  }>;
}


export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: eventId, invitationId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    
    const invitation = await prisma.courtesyInvitation.findUnique({
      where: { id: invitationId },
      include: {
        event: true,
        ticket: {
          select: {
            id: true,
            qrCode: true,
            isUsed: true,
            usedAt: true,
          },
        },
        creator: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitación no encontrada' }, { status: 404 });
    }

    if (invitation.eventId !== eventId) {
      return NextResponse.json({ error: 'Invitación no pertenece a este evento' }, { status: 400 });
    }

    
    const isOwner = invitation.event.organizerId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    return NextResponse.json(invitation);

  } catch (error) {
    console.error('Error fetching courtesy invitation:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: eventId, invitationId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = updateInvitationSchema.parse(body);

    
    const invitation = await prisma.courtesyInvitation.findUnique({
      where: { id: invitationId },
      include: {
        event: true,
        ticket: true,
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitación no encontrada' }, { status: 404 });
    }

    if (invitation.eventId !== eventId) {
      return NextResponse.json({ error: 'Invitación no pertenece a este evento' }, { status: 400 });
    }

    
    const isOwner = invitation.event.organizerId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    let updatedInvitation;

    switch (action) {
      case 'SEND':
      case 'RESEND':
        
        if (!invitation.ticket) {
          const ticket = await generateCourtesyTicket(invitation);
          updatedInvitation = await prisma.courtesyInvitation.update({
            where: { id: invitationId },
            data: {
              ticketId: ticket.id,
              status: 'SENT',
              sentAt: new Date(),
            },
            include: {
              event: true,
              ticket: {
                include: {
                  ticketType: true,
                },
              },
            },
          });
        } else {
          updatedInvitation = await prisma.courtesyInvitation.update({
            where: { id: invitationId },
            data: {
              status: 'SENT',
              sentAt: new Date(),
            },
            include: {
              event: true,
              ticket: {
                include: {
                  ticketType: true,
                },
              },
            },
          });
        }

        
        try {
          await sendCourtesyInvitationEmail({
            invitation: updatedInvitation,
            event: updatedInvitation.event,
            ticket: updatedInvitation.ticket!,
          });
        } catch (emailError) {
          console.error('Error sending invitation email:', emailError);
          
        }
        break;

      case 'GENERATE_TICKET':
        if (invitation.ticket) {
          return NextResponse.json({ error: 'El ticket ya existe para esta invitación' }, { status: 400 });
        }

        const ticket = await generateCourtesyTicket(invitation);
        updatedInvitation = await prisma.courtesyInvitation.update({
          where: { id: invitationId },
          data: {
            ticketId: ticket.id,
            status: 'ACCEPTED',
            acceptedAt: new Date(),
          },
          include: {
            event: true,
            ticket: {
              include: {
                ticketType: true,
              },
            },
          },
        });
        break;

      case 'CANCEL':
        
        updatedInvitation = await prisma.courtesyInvitation.update({
          where: { id: invitationId },
          data: {
            status: 'EXPIRED',
          },
          include: {
            event: true,
            ticket: true,
          },
        });
        break;

      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }

    return NextResponse.json(updatedInvitation);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating courtesy invitation:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: eventId, invitationId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    
    const invitation = await prisma.courtesyInvitation.findUnique({
      where: { id: invitationId },
      include: {
        event: true,
        ticket: true,
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: 'Invitación no encontrada' }, { status: 404 });
    }

    if (invitation.eventId !== eventId) {
      return NextResponse.json({ error: 'Invitación no pertenece a este evento' }, { status: 400 });
    }

    
    const isOwner = invitation.event.organizerId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    
    if (invitation.ticket?.isUsed) {
      return NextResponse.json(
        { error: 'No se puede eliminar una invitación cuyo ticket ya fue usado' },
        { status: 400 }
      );
    }

    
    await prisma.courtesyInvitation.delete({
      where: { id: invitationId },
    });

    return NextResponse.json({ message: 'Invitación eliminada exitosamente' });

  } catch (error) {
    console.error('Error deleting courtesy invitation:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}


async function generateCourtesyTicket(invitation: {
  id: string;
  eventId: string;
  invitedEmail: string;
  invitedName?: string | null;
  message?: string | null;
  status: string;
  invitationCode?: string | null;
  sentAt?: Date | null;
  acceptedAt?: Date | null;
  expiresAt?: Date | null;
  ticketId?: string | null;
  ticketTypeId?: string | null;
  priceTierId?: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  event: {
    id: string;
    title: string;
    organizerId: string;
    currency: string;
    [key: string]: unknown;
  };
  ticket?: {
    id: string;
    qrCode: string;
    isUsed: boolean;
    [key: string]: unknown;
  } | null;
}) {
  
  let invitedUser = await prisma.user.findUnique({
    where: { email: invitation.invitedEmail },
  });

  if (!invitedUser) {
    
    invitedUser = await prisma.user.create({
      data: {
        email: invitation.invitedEmail,
        firstName: invitation.invitedName || 'Invitado',
        clerkId: `courtesy_${crypto.randomBytes(16).toString('hex')}`,
        role: 'CLIENT',
      },
    });
  }

  
  const order = await prisma.order.create({
    data: {
      orderNumber: `CORT-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      totalAmount: 0,
      baseAmount: 0,
      commissionAmount: 0,
      currency: invitation.event.currency,
      quantity: 1,
      status: 'PAID',
      userId: invitedUser.id,
      eventId: invitation.eventId,
    },
  });

  
  const ticket = await prisma.ticket.create({
    data: {
      qrCode: generateQRCode(),
      eventId: invitation.eventId,
      userId: invitedUser.id,
      orderId: order.id,
      status: 'ACTIVE',
      ticketTypeId: invitation.ticketTypeId,
    },
  });

  return ticket;
}


function generateQRCode(): string {
  return crypto.randomBytes(16).toString('hex').toUpperCase();
}
