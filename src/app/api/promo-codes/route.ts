// src/app/api/promo-codes/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireOrganizer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PromoCodeService } from "@/lib/promo-codes";
import { z } from "zod";

const createPromoCodeSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100),
  description: z.string().optional(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE"]),
  value: z.number().min(0, "Valor debe ser positivo"),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscountAmount: z.number().min(0).optional(),
  usageLimit: z.number().min(1).optional(),
  usageLimitPerUser: z.number().min(1).optional(),
  validFrom: z.string().min(1, "Fecha de inicio requerida"),
  validUntil: z.string().optional(),
  eventId: z.string().optional(),
  generateCode: z.boolean().default(true),
  customCode: z.string().optional(),
}).refine(
  (data) => {
    if (!data.generateCode && !data.customCode) {
      return false;
    }
    if (data.type === "PERCENTAGE" && data.value > 100) {
      return false;
    }
    return true;
  },
  {
    message: "Datos inválidos",
  }
);

export async function GET(request: NextRequest) {
  try {
    const user = await requireOrganizer();
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    const whereClause: {
      createdBy: string;
      eventId?: string;
    } = {
      createdBy: user.id,
    };

    if (eventId) {
      whereClause.eventId = eventId;
    }

    const promoCodes = await prisma.promoCode.findMany({
      where: whereClause,
      include: {
        event: {
          select: { title: true },
        },
        _count: {
          select: { usages: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const serializedPromoCodes = promoCodes.map((code) => ({
      ...code,
      description: code.description ?? undefined,
      usageLimit: code.usageLimit ?? undefined,
      validFrom: code.validFrom.toISOString(),
      validUntil: code.validUntil?.toISOString() || undefined,
      createdAt: code.createdAt.toISOString(),
      updatedAt: code.updatedAt.toISOString(),
      event: code.event || undefined,
    }));

    return NextResponse.json({ promoCodes: serializedPromoCodes });
  } catch (error) {
    console.error("Error fetching promo codes:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireOrganizer();
    const body = await request.json();
    const validation = createPromoCodeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const {
      generateCode,
      customCode,
      eventId,
      validFrom,
      validUntil,
      ...promoData
    } = validation.data;

    // Generar o usar código personalizado
    let code = "";
    if (generateCode) {
      do {
        code = PromoCodeService.generatePromoCode("SP");
      } while (!(await PromoCodeService.isCodeUnique(code)));
    } else {
      code = customCode!.toUpperCase();
      if (!(await PromoCodeService.isCodeUnique(code))) {
        return NextResponse.json(
          { error: "El código ya existe" },
          { status: 400 }
        );
      }
    }

    // Validar evento si se especifica
    if (eventId) {
      const event = await prisma.event.findFirst({
        where: {
          id: eventId,
          organizerId: user.id,
        },
      });

      if (!event) {
        return NextResponse.json(
          { error: "Evento no encontrado" },
          { status: 404 }
        );
      }
    }

    // Validar fechas
    const validFromDate = new Date(validFrom);
    const validUntilDate = validUntil ? new Date(validUntil) : null;

    if (validUntilDate && validUntilDate <= validFromDate) {
      return NextResponse.json(
        { error: "La fecha de fin debe ser posterior a la fecha de inicio" },
        { status: 400 }
      );
    }

    const promoCode = await prisma.promoCode.create({
      data: {
        ...promoData,
        code,
        validFrom: validFromDate,
        validUntil: validUntilDate,
        eventId: eventId || null,
        createdBy: user.id,
        currency: "CLP",
      },
      include: {
        event: {
          select: { title: true },
        },
      },
    });

    const serializedPromoCode = {
      ...promoCode,
      description: promoCode.description ?? undefined,
      usageLimit: promoCode.usageLimit ?? undefined,
      validFrom: promoCode.validFrom.toISOString(),
      validUntil: promoCode.validUntil?.toISOString() || undefined,
      createdAt: promoCode.createdAt.toISOString(),
      updatedAt: promoCode.updatedAt.toISOString(),
      event: promoCode.event || undefined,
    };

    return NextResponse.json(
      {
        message: "Código promocional creado exitosamente",
        promoCode: serializedPromoCode,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating promo code:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}