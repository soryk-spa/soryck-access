import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const editInvitationSchema = z.object({
  invitedName: z.string().optional(),
  message: z.string().optional(),
  ticketTypeId: z.string().optional(),
  priceTierId: z.string().optional(),
});

interface RouteParams {
  params: Promise<{
    id: string;
    invitationId: string;
  }>;
}

export async function PUT(
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
    const validatedData = editInvitationSchema.parse(body);

    // Verificar que la cortesía existe y pertenece al evento
    const originalInvitation = await prisma.courtesyInvitation.findUnique({
      where: { id: invitationId },
      include: {
        event: true,
        ticket: true,
        ticketType: true,
        priceTier: true,
      },
    });

    if (!originalInvitation) {
      return NextResponse.json({ error: 'Invitación no encontrada' }, { status: 404 });
    }

    if (originalInvitation.eventId !== eventId) {
      return NextResponse.json({ error: 'La invitación no pertenece a este evento' }, { status: 400 });
    }

    // Verificar que el usuario es el organizador del evento
    if (originalInvitation.event.organizerId !== user.id) {
      return NextResponse.json({ error: 'Solo el organizador puede editar invitaciones' }, { status: 403 });
    }

    // Solo se pueden editar cortesías que han sido enviadas o aceptadas
    if (!['SENT', 'ACCEPTED'].includes(originalInvitation.status)) {
      return NextResponse.json({ 
        error: 'Solo se pueden editar cortesías que han sido enviadas o aceptadas' 
      }, { status: 400 });
    }

    // Validar ticket type si se proporciona
    if (validatedData.ticketTypeId) {
      const ticketType = await prisma.ticketType.findUnique({
        where: { id: validatedData.ticketTypeId },
      });

      if (!ticketType || ticketType.eventId !== eventId) {
        return NextResponse.json({ 
          error: 'Tipo de ticket no válido para este evento' 
        }, { status: 400 });
      }

      // Validar price tier si se proporciona
      if (validatedData.priceTierId) {
        const priceTier = await prisma.priceTier.findUnique({
          where: { id: validatedData.priceTierId },
        });

        if (!priceTier || priceTier.ticketTypeId !== validatedData.ticketTypeId) {
          return NextResponse.json({ 
            error: 'Nivel de precio no válido para este tipo de ticket' 
          }, { status: 400 });
        }
      }
    } else if (validatedData.priceTierId) {
      return NextResponse.json({ 
        error: 'No se puede especificar un nivel de precio sin un tipo de ticket' 
      }, { status: 400 });
    }

    // Verificar si hay cambios reales
    const hasChanges = (
      validatedData.invitedName !== originalInvitation.invitedName ||
      validatedData.message !== originalInvitation.message ||
      validatedData.ticketTypeId !== originalInvitation.ticketTypeId ||
      validatedData.priceTierId !== originalInvitation.priceTierId
    );

    if (!hasChanges) {
      return NextResponse.json({ 
        error: 'No se detectaron cambios en la invitación' 
      }, { status: 400 });
    }

    // Usar transacción para asegurar consistencia
    const result = await prisma.$transaction(async (tx) => {
      // 1. Marcar la invitación original como supersedida
      await tx.courtesyInvitation.update({
        where: { id: invitationId },
        data: {
          status: 'SUPERSEDED',
          supersededAt: new Date(),
        },
      });

      // 2. Si había un ticket, marcarlo como cancelado/inactivo
      if (originalInvitation.ticket) {
        await tx.ticket.update({
          where: { id: originalInvitation.ticket.id },
          data: {
            status: 'CANCELLED',
          },
        });
      }

      // 3. Crear nueva invitación con los datos actualizados
      const newInvitation = await tx.courtesyInvitation.create({
        data: {
          eventId: originalInvitation.eventId,
          invitedEmail: originalInvitation.invitedEmail,
          invitedName: validatedData.invitedName ?? originalInvitation.invitedName,
          message: validatedData.message ?? originalInvitation.message,
          status: 'PENDING', // Empezar como pendiente
          ticketTypeId: validatedData.ticketTypeId ?? originalInvitation.ticketTypeId,
          priceTierId: validatedData.priceTierId ?? originalInvitation.priceTierId,
          createdBy: user.id,
          expiresAt: originalInvitation.expiresAt, // Mantener la misma fecha de expiración
        },
        include: {
          event: true,
          ticketType: true,
          priceTier: true,
        },
      });

      // 4. Actualizar la invitación original para referenciar la nueva
      await tx.courtesyInvitation.update({
        where: { id: invitationId },
        data: {
          supersededById: newInvitation.id,
        },
      });

      return newInvitation;
    });

    return NextResponse.json({
      message: 'Invitación editada exitosamente',
      originalInvitationId: invitationId,
      newInvitation: result,
    });

  } catch (error) {
    console.error('Error editing courtesy invitation:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}