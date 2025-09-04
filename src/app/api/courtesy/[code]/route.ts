import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { z } from 'zod';

const acceptInvitationSchema = z.object({
  invitationId: z.string(),
});

interface RouteParams {
  params: Promise<{ code: string }>;
}


export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { code } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { invitationId } = acceptInvitationSchema.parse(body);

    
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

    
    if (!invitation.ticket || invitation.ticket.qrCode !== code) {
      return NextResponse.json({ error: 'Código QR inválido' }, { status: 400 });
    }

    
    if (invitation.status !== 'SENT' && invitation.status !== 'ACCEPTED') {
      return NextResponse.json({ 
        error: 'Invitación no válida o expirada',
        status: invitation.status 
      }, { status: 400 });
    }

    
    if (invitation.event.endDate && new Date() > invitation.event.endDate) {
      return NextResponse.json({ error: 'El evento ya ha terminado' }, { status: 400 });
    }

    
    if (invitation.ticket.isUsed) {
      return NextResponse.json({ 
        error: 'Este ticket ya ha sido utilizado',
        usedAt: invitation.ticket.usedAt 
      }, { status: 400 });
    }

    
    await prisma.ticket.update({
      where: { id: invitation.ticket.id },
      data: {
        isUsed: true,
        usedAt: new Date(),
      },
    });

    
    if (invitation.status !== 'ACCEPTED') {
      await prisma.courtesyInvitation.update({
        where: { id: invitationId },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      message: 'Ticket validado exitosamente',
      invitation: {
        id: invitation.id,
        invitedName: invitation.invitedName,
        invitedEmail: invitation.invitedEmail,
        status: 'ACCEPTED',
      },
      event: {
        id: invitation.event.id,
        title: invitation.event.title,
        startDate: invitation.event.startDate,
        location: invitation.event.location,
      },
      ticket: {
        id: invitation.ticket.id,
        qrCode: invitation.ticket.qrCode,
        usedAt: new Date(),
      },
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error accepting courtesy invitation:', error);
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
    const { code } = await params;

    
    const ticket = await prisma.ticket.findUnique({
      where: { qrCode: code },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            imageUrl: true,
          },
        },
        courtesyInvitation: {
          select: {
            id: true,
            invitedName: true,
            invitedEmail: true,
            status: true,
            sentAt: true,
            acceptedAt: true,
            expiresAt: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket no encontrado' }, { status: 404 });
    }

    
    if (!ticket.courtesyInvitation) {
      return NextResponse.json({ error: 'Este no es un ticket de cortesía' }, { status: 400 });
    }

    const invitation = ticket.courtesyInvitation;

    
    const now = new Date();
    const isExpired = invitation.expiresAt ? now > invitation.expiresAt : false;
    const eventEnded = ticket.event.endDate ? now > ticket.event.endDate : false;

    return NextResponse.json({
      ticket: {
        id: ticket.id,
        qrCode: ticket.qrCode,
        isUsed: ticket.isUsed,
        usedAt: ticket.usedAt,
        status: ticket.status,
      },
      invitation: {
        id: invitation.id,
        invitedName: invitation.invitedName,
        invitedEmail: invitation.invitedEmail,
        status: invitation.status,
        sentAt: invitation.sentAt,
        acceptedAt: invitation.acceptedAt,
        expiresAt: invitation.expiresAt,
        isExpired,
      },
      event: {
        id: ticket.event.id,
        title: ticket.event.title,
        startDate: ticket.event.startDate,
        endDate: ticket.event.endDate,
        location: ticket.event.location,
        imageUrl: ticket.event.imageUrl,
        hasEnded: eventEnded,
      },
      canUse: !ticket.isUsed && !isExpired && !eventEnded && invitation.status === 'SENT',
    });

  } catch (error) {
    console.error('Error fetching courtesy invitation:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
