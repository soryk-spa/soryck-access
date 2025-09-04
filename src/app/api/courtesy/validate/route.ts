import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, eventId } = body;

    if (!code || !eventId) {
      return NextResponse.json(
        { error: "Código y ID del evento son requeridos" },
        { status: 400 }
      );
    }

    
    const courtesyRequest = await prisma.courtesyRequest.findFirst({
      where: {
        code: code.toUpperCase(),
        eventId,
        status: 'APPROVED',
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            price: true,
          },
        },
      },
    });

    if (!courtesyRequest) {
      return NextResponse.json(
        { error: "Código de cortesía inválido o no encontrado" },
        { status: 404 }
      );
    }

    
    if (courtesyRequest.expiresAt && new Date() > courtesyRequest.expiresAt) {
      
      await prisma.courtesyRequest.update({
        where: { id: courtesyRequest.id },
        data: { status: 'EXPIRED' },
      });

      return NextResponse.json(
        { error: "El código de cortesía ha expirado" },
        { status: 400 }
      );
    }

    
    if (courtesyRequest.status === 'USED') {
      return NextResponse.json(
        { error: "Este código de cortesía ya ha sido utilizado" },
        { status: 400 }
      );
    }

    
    let discount = 0;
    let finalPrice = courtesyRequest.event.price;

    if (courtesyRequest.codeType === 'FREE') {
      discount = courtesyRequest.event.price;
      finalPrice = 0;
    } else if (courtesyRequest.codeType === 'DISCOUNT' && courtesyRequest.discountValue) {
      discount = courtesyRequest.discountValue;
      finalPrice = Math.max(0, courtesyRequest.event.price - discount);
    }

    return NextResponse.json({
      valid: true,
      code: courtesyRequest.code,
      codeType: courtesyRequest.codeType,
      originalPrice: courtesyRequest.event.price,
      discount,
      finalPrice,
      recipientName: courtesyRequest.name,
      recipientEmail: courtesyRequest.email,
      message: courtesyRequest.codeType === 'FREE' 
        ? 'Entrada gratuita aplicada' 
        : `Descuento de $${discount} CLP aplicado`,
    });

  } catch (error) {
    console.error("Error validating courtesy code:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}


export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, eventId } = body;

    if (!code || !eventId) {
      return NextResponse.json(
        { error: "Código y ID del evento son requeridos" },
        { status: 400 }
      );
    }

    
    const updatedRequest = await prisma.courtesyRequest.updateMany({
      where: {
        code: code.toUpperCase(),
        eventId,
        status: 'APPROVED',
      },
      data: {
        status: 'USED',
        usedAt: new Date(),
      },
    });

    if (updatedRequest.count === 0) {
      return NextResponse.json(
        { error: "Código de cortesía no encontrado o ya usado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Código de cortesía marcado como usado",
    });

  } catch (error) {
    console.error("Error marking courtesy code as used:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
