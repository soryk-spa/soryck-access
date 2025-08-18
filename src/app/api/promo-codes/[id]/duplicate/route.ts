import { NextRequest, NextResponse } from "next/server";
import { requireOrganizer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireOrganizer();

    const originalPromoCode = await prisma.promoCode.findFirst({
      where: {
        id,
        createdBy: user.id,
      },
    });

    if (!originalPromoCode) {
      return NextResponse.json(
        { error: "Código promocional no encontrado" },
        { status: 404 }
      );
    }

    // Generar nuevo código único
    const { PromoCodeService } = await import("@/lib/promo-codes");
    let newCode = "";
    do {
      newCode = PromoCodeService.generatePromoCode("SP");
    } while (!(await PromoCodeService.isCodeUnique(newCode)));

    // Crear duplicado con datos del original
    const duplicatedPromoCode = await prisma.promoCode.create({
      data: {
        code: newCode,
        name: `${originalPromoCode.name} (Copia)`,
        description: originalPromoCode.description,
        type: originalPromoCode.type,
        value: originalPromoCode.value,
        minOrderAmount: originalPromoCode.minOrderAmount,
        maxDiscountAmount: originalPromoCode.maxDiscountAmount,
        currency: originalPromoCode.currency,
        usageLimit: originalPromoCode.usageLimit,
        usageLimitPerUser: originalPromoCode.usageLimitPerUser,
        validFrom: new Date(), // Nueva fecha de inicio
        validUntil: originalPromoCode.validUntil,
        eventId: originalPromoCode.eventId,
        categoryId: originalPromoCode.categoryId,
        ticketTypeId: originalPromoCode.ticketTypeId,
        createdBy: user.id,
      },
      include: {
        event: {
          select: { title: true },
        },
      },
    });

    const serializedPromoCode = {
      ...duplicatedPromoCode,
      description: duplicatedPromoCode.description ?? undefined,
      usageLimit: duplicatedPromoCode.usageLimit ?? undefined,
      validFrom: duplicatedPromoCode.validFrom.toISOString(),
      validUntil: duplicatedPromoCode.validUntil?.toISOString() || undefined,
      createdAt: duplicatedPromoCode.createdAt.toISOString(),
      updatedAt: duplicatedPromoCode.updatedAt.toISOString(),
      event: duplicatedPromoCode.event || undefined,
    };

    return NextResponse.json({
      message: "Código promocional duplicado exitosamente",
      promoCode: serializedPromoCode,
    });
  } catch (error) {
    console.error("Error duplicating promo code:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}