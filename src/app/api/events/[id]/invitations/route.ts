import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

// Schema de validación para crear invitación
const createInvitationSchema = z.object({
  invitedEmail: z.string().email("Email inválido"),
  invitedName: z.string().min(1, "Nombre requerido").optional(),
  message: z.string().optional(),
});

// Schema para crear múltiples invitaciones
const bulkCreateInvitationSchema = z.object({
  invitations: z.array(createInvitationSchema).min(1, "Al menos una invitación es requerida").max(50, "Máximo 50 invitaciones por lote"),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Obtener todas las invitaciones de un evento
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: eventId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el evento existe y que el usuario es el organizador o admin
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    const isOwner = event.organizerId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    // Obtener todas las invitaciones
    const invitations = await prisma.courtesyInvitation.findMany({
      where: { eventId },
      include: {
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
      orderBy: { createdAt: 'desc' },
    });

    // Debug log para verificar la estructura
    console.log('Invitations fetched:', invitations.length);
    if (invitations.length > 0) {
      console.log('Sample invitation:', JSON.stringify(invitations[0], null, 2));
    }

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
      },
      invitations,
    });

  } catch (error) {
    console.error("Error fetching courtesy invitations:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Crear nuevas invitaciones
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: eventId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar que el evento existe y que el usuario es el organizador o admin
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        organizer: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: 'Evento no encontrado' }, { status: 404 });
    }

    const isOwner = event.organizerId === user.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await request.json();
    
    // Determinar si es una invitación única o múltiple
    let invitationsToCreate: Array<{
      invitedEmail: string;
      invitedName?: string;
      message?: string;
    }> = [];

    if (body.invitations) {
      // Múltiples invitaciones
      const validation = bulkCreateInvitationSchema.parse(body);
      invitationsToCreate = validation.invitations;
    } else {
      // Invitación única
      const validation = createInvitationSchema.parse(body);
      invitationsToCreate = [validation];
    }

    // Verificar emails duplicados en el evento
    const existingEmails = await prisma.courtesyInvitation.findMany({
      where: {
        eventId,
        invitedEmail: {
          in: invitationsToCreate.map(inv => inv.invitedEmail.toLowerCase()),
        },
      },
      select: { invitedEmail: true },
    });

    if (existingEmails.length > 0) {
      const duplicateEmails = existingEmails.map(e => e.invitedEmail);
      return NextResponse.json(
        { 
          error: "Algunos emails ya están invitados a este evento",
          duplicateEmails 
        },
        { status: 400 }
      );
    }

    // Crear las invitaciones
    const createdInvitations = await prisma.$transaction(
      invitationsToCreate.map((invitation) =>
        prisma.courtesyInvitation.create({
          data: {
            eventId,
            invitedEmail: invitation.invitedEmail.toLowerCase(),
            invitedName: invitation.invitedName,
            message: invitation.message,
            createdBy: user.id,
            invitationCode: generateInvitationCode(),
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
          },
          include: {
            creator: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        })
      )
    );

    return NextResponse.json({
      message: `${createdInvitations.length} invitación(es) creada(s) exitosamente`,
      invitations: createdInvitations,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating courtesy invitations:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Generar código único para invitación
function generateInvitationCode(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
