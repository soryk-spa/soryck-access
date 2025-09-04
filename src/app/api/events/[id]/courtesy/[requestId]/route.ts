import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendCourtesyEmail } from '@/lib/email';
import { z } from 'zod';
import crypto from 'crypto';

const updateCourtesyRequestSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT']),
  codeType: z.enum(['FREE', 'DISCOUNT']).optional(),
  discountValue: z.number().min(1).max(100).nullable().optional(),
});

interface RouteParams {
  params: Promise<{
    id: string;
    requestId: string;
  }>;
}

interface CourtesyUpdateData {
  status: 'APPROVED' | 'REJECTED';
  codeType?: 'FREE' | 'DISCOUNT';
  discountValue?: number | null;
  code?: string;
  expiresAt?: Date;
  approvedAt?: Date;
  rejectedAt?: Date;
}


function generateCourtesyCode(): string {
  return crypto.randomBytes(8).toString('hex').toUpperCase();
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: eventId, requestId } = await params;
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

    
    const request_obj = await prisma.courtesyRequest.findUnique({
      where: { id: requestId },
    });

    if (!request_obj) {
      return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
    }

    if (request_obj.eventId !== eventId) {
      return NextResponse.json({ error: 'Solicitud no pertenece a este evento' }, { status: 400 });
    }

    return NextResponse.json(request_obj);

  } catch (error) {
    console.error('Error fetching courtesy request:', error);
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
    const { id: eventId, requestId } = await params;
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
    const { action, codeType, discountValue } = updateCourtesyRequestSchema.parse(body);

    
    const existingRequest = await prisma.courtesyRequest.findUnique({
      where: { id: requestId },
    });

    if (!existingRequest) {
      return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
    }

    if (existingRequest.eventId !== eventId) {
      return NextResponse.json({ error: 'Solicitud no pertenece a este evento' }, { status: 400 });
    }

    if (existingRequest.status !== 'PENDING') {
      return NextResponse.json({ error: 'Esta solicitud ya fue procesada' }, { status: 400 });
    }

    let updateData: CourtesyUpdateData;

    if (action === 'APPROVE') {
      
      if (!codeType) {
        return NextResponse.json({ error: 'Tipo de código requerido para aprobar' }, { status: 400 });
      }

      
      if (codeType === 'DISCOUNT' && (!discountValue || discountValue <= 0 || discountValue > 100)) {
        return NextResponse.json({ error: 'Monto de descuento inválido' }, { status: 400 });
      }

      updateData = {
        status: 'APPROVED' as const,
        codeType,
        discountValue: codeType === 'DISCOUNT' ? discountValue : null,
        code: generateCourtesyCode(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 
        approvedAt: new Date(),
      };
    } else {
      updateData = {
        status: 'REJECTED' as const,
        rejectedAt: new Date(),
      };
    }

    
    const updatedRequest = await prisma.courtesyRequest.update({
      where: { id: requestId },
      data: updateData,
      include: {
        event: true,
      },
    });

    
    if (action === 'APPROVE') {
      try {
        
        const requestUser = await prisma.user.findUnique({
          where: { email: updatedRequest.email },
        });

        if (requestUser) {
          await sendCourtesyEmail({
            user: requestUser,
            event: updatedRequest.event,
            courtesyRequest: updatedRequest,
          });
          console.log(`[COURTESY API] ✅ Correo enviado exitosamente para cortesía ${requestId}`);
        } else {
          console.log(`[COURTESY API] ⚠️ Usuario no encontrado para email ${updatedRequest.email}, omitiendo envío de correo`);
        }
      } catch (emailError) {
        console.error(`[COURTESY API] ⚠️ Error al enviar correo para cortesía ${requestId}:`, emailError);
        
      }
    }

    return NextResponse.json(updatedRequest);

  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.issues);
      const detailedErrors = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      return NextResponse.json(
        { 
          error: 'Datos inválidos', 
          details: detailedErrors,
          issues: error.issues 
        },
        { status: 400 }
      );
    }

    console.error('Error updating courtesy request:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
