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

// Obtener invitación específica
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

    // Verificar que la invitación existe y pertenece al evento
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

    // Verificar permisos
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

// Actualizar invitación (enviar, reenviar, cancelar, generar ticket)
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

    // Verificar que la invitación existe
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

    // Verificar permisos
    const isOwner = invitation.event.organizerId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    let updatedInvitation;

    switch (action) {
      case 'SEND':
      case 'RESEND':
        // Generar ticket si no existe
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
              ticket: true,
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
              ticket: true,
            },
          });
        }

        // Enviar email con QR
        try {
          await sendCourtesyInvitationEmail({
            invitation: updatedInvitation,
            event: updatedInvitation.event,
            ticket: updatedInvitation.ticket!,
          });
        } catch (emailError) {
          console.error('Error sending invitation email:', emailError);
          // No fallar la respuesta por error de email
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
            ticket: true,
          },
        });
        break;

      case 'CANCEL':
        // Cancelar invitación
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

// Eliminar invitación
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

    // Verificar que la invitación existe
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

    // Verificar permisos
    const isOwner = invitation.event.organizerId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // No permitir eliminar si ya tiene ticket generado y fue usado
    if (invitation.ticket?.isUsed) {
      return NextResponse.json(
        { error: 'No se puede eliminar una invitación cuyo ticket ya fue usado' },
        { status: 400 }
      );
    }

    // Eliminar invitación (el ticket se eliminará en cascada si no fue usado)
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

// Función auxiliar para generar ticket de cortesía
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
  // Buscar o crear usuario para la invitación
  let invitedUser = await prisma.user.findUnique({
    where: { email: invitation.invitedEmail },
  });

  if (!invitedUser) {
    // Crear usuario temporal para la cortesía
    invitedUser = await prisma.user.create({
      data: {
        email: invitation.invitedEmail,
        firstName: invitation.invitedName || 'Invitado',
        clerkId: `courtesy_${crypto.randomBytes(16).toString('hex')}`,
        role: 'CLIENT',
      },
    });
  }

  // Crear orden gratuita
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

  // Crear ticket
  const ticket = await prisma.ticket.create({
    data: {
      qrCode: generateQRCode(),
      eventId: invitation.eventId,
      userId: invitedUser.id,
      orderId: order.id,
      status: 'ACTIVE',
    },
  });

  return ticket;
}

// Generar código QR único
function generateQRCode(): string {
  return crypto.randomBytes(16).toString('hex').toUpperCase();
}
