import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { DiscountCodeService } from "@/lib/discount-codes";
import type { PromoCode, CourtesyRequest } from "@prisma/client";
import { z } from "zod";

const validateDiscountCodeSchema = z.object({
  code: z.string().min(1, "Código requerido"),
  ticketTypeId: z.string().min(1, "ID del tipo de ticket requerido"),
  quantity: z.number().min(1, "Cantidad debe ser al menos 1"),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    
    const validation = validateDiscountCodeSchema.safeParse(body);

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

    const result = await DiscountCodeService.validateDiscountCode(
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

    
    let codeType = 'FIXED_AMOUNT';
    if (result.type === 'COURTESY_CODE') {
      const courtesyData = result.codeData as CourtesyRequest;
      codeType = courtesyData.codeType === 'FREE' ? 'FREE' : 'FIXED_AMOUNT';
    } else if (result.type === 'PROMO_CODE') {
      const promoData = result.codeData as PromoCode;
      codeType = promoData.type || 'FIXED_AMOUNT';
    }

    
    return NextResponse.json({
      valid: true,
      codeType: result.type,
      promoCode: {
        id: result.codeData?.id || '',
        code: result.code,
        name: result.name,
        description: result.description,
        type: codeType,
      },
      discount: {
        amount: result.discountAmount,
        finalAmount: result.finalAmount,
        percentage: result.discountPercentage,
      },
    });
  } catch (error) {
    console.error("Error validating discount code:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
