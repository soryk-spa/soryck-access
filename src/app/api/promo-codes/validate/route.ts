import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { PromoCodeService } from "@/lib/promo-codes";
import { z } from "zod";

const validatePromoCodeSchema = z.object({
  code: z.string().min(1, "Código requerido"),
  ticketTypeId: z.string().min(1, "ID del tipo de ticket requerido"),
  quantity: z.number().min(1, "Cantidad debe ser al menos 1"),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const validation = validatePromoCodeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { code, ticketTypeId, quantity } = validation.data;

    const result = await PromoCodeService.validatePromoCode(
      code,
      user.id,
      ticketTypeId,
      quantity
    );

    if (!result.isValid) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      valid: true,
      promoCode: {
        id: result.promoCode!.id,
        code: result.promoCode!.code,
        name: result.promoCode!.name,
        description: result.promoCode!.description,
        type: result.promoCode!.type,
      },
      discount: {
        amount: result.discountAmount!,
        finalAmount: result.finalAmount!,
        percentage: result.discountPercentage!,
      },
    });
  } catch (error) {
    console.error("Error validating promo code:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}