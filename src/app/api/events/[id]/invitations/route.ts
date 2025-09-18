import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";


const createInvitationSchema = z.object({
  invitedEmail: z.string().email("Email inválido"),
  invitedName: z.string().min(1, "Nombre requerido").optional(),
  ticketTypeId: z.string().optional(),
  priceTierId: z.string().optional(),
  message: z.string().optional(),
});


const bulkCreateInvitationSchema = z.object({
  invitations: z.array(createInvitationSchema).min(1, "Al menos una invitación es requerida").max(50, "Máximo 50 invitaciones por lote"),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}


export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: eventId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    
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
        ticketType: {
          select: { id: true, name: true, price: true }
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


export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: eventId } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    
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
    
    
    let invitationsToCreate: Array<{
      invitedEmail: string;
      invitedName?: string;
      message?: string;
      ticketTypeId?: string | null;
      priceTierId?: string | null;
    }> = [];

    if (body.invitations) {
      const validation = bulkCreateInvitationSchema.parse(body);
      invitationsToCreate = validation.invitations.map((inv) => ({
        invitedEmail: inv.invitedEmail,
        invitedName: inv.invitedName,
        message: inv.message,
        ticketTypeId: inv.ticketTypeId || null,
        priceTierId: inv.priceTierId || null,
      }));
    } else {
      const validation = createInvitationSchema.parse(body);
      invitationsToCreate = [{
        invitedEmail: validation.invitedEmail,
        invitedName: validation.invitedName,
        message: validation.message,
        ticketTypeId: validation.ticketTypeId || null,
        priceTierId: validation.priceTierId || null,
      }];
    }

    
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

    
    
    const providedTicketTypeIds = invitationsToCreate
      .map(i => i.ticketTypeId)
      .filter(Boolean) as string[];

    if (providedTicketTypeIds.length > 0) {
      const validTypes = await prisma.ticketType.findMany({
        where: { eventId, id: { in: providedTicketTypeIds } },
        select: { id: true },
      });
      const validIds = new Set(validTypes.map(t => t.id));
      const invalid = providedTicketTypeIds.filter(id => !validIds.has(id));
      if (invalid.length > 0) {
        return NextResponse.json({ error: 'Algunos tipos de ticket no pertenecen a este evento', invalid }, { status: 400 });
      }
    }

    
    const providedPriceTierIds = invitationsToCreate
      .map(i => i.priceTierId)
      .filter(Boolean) as string[];

  type PriceTierMapValue = { id: string; ticketTypeId: string; endDate?: Date | null };
  const priceTierMap = new Map<string, PriceTierMapValue>();
    if (providedPriceTierIds.length > 0) {
      const tiers = await prisma.priceTier.findMany({
        where: { id: { in: providedPriceTierIds }, ticketType: { eventId } },
        select: { id: true, ticketTypeId: true, endDate: true },
      });
      const foundIds = new Set(tiers.map(t => t.id));
      const invalidTiers = providedPriceTierIds.filter(id => !foundIds.has(id));
      if (invalidTiers.length > 0) {
        return NextResponse.json({ error: 'Algunos price tiers no pertenecen a este evento', invalid: invalidTiers }, { status: 400 });
      }
      tiers.forEach(t => priceTierMap.set(t.id, { id: t.id, ticketTypeId: t.ticketTypeId, endDate: t.endDate }));
    }

    
    const mismatches = invitationsToCreate.filter(inv => inv.ticketTypeId && inv.priceTierId && priceTierMap.get(inv.priceTierId!)?.ticketTypeId !== inv.ticketTypeId).map(i => ({ invitedEmail: i.invitedEmail }));
    if (mismatches.length > 0) {
      return NextResponse.json({ error: 'Algunos price tiers no corresponden al tipo de entrada seleccionado', mismatches }, { status: 400 });
    }

    const createdInvitations = await prisma.$transaction(
      invitationsToCreate.map((invitation) => {
        const tier = invitation.priceTierId ? priceTierMap.get(invitation.priceTierId) : undefined;
        const expires = tier && tier.endDate ? tier.endDate : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        return prisma.courtesyInvitation.create({
          data: {
            eventId,
            invitedEmail: invitation.invitedEmail.toLowerCase(),
            invitedName: invitation.invitedName,
            message: invitation.message,
            createdBy: user.id,
            invitationCode: generateInvitationCode(),
            expiresAt: expires,
            ticketTypeId: invitation.ticketTypeId || null,
            priceTierId: invitation.priceTierId || null,
          },
          include: {
            creator: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
            ticketType: {
              select: { id: true, name: true, price: true }
            },
            priceTier: {
              select: { id: true, name: true, price: true }
            }
          },
        });
      })
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


function generateInvitationCode(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
