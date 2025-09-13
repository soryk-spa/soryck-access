import { NextRequest, NextResponse } from "next/server";
import { requireOrganizer } from "@/lib/auth";

// Ensure this route runs as dynamic so server-side auth can read the incoming request
export const dynamic = 'force-dynamic'
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updatePromoCodeSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100).optional(),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  usageLimit: z.number().min(1).optional(),
  usageLimitPerUser: z.number().min(1).optional(),
  validUntil: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireOrganizer();

    const promoCode = await prisma.promoCode.findFirst({
      where: {
        id,
        createdBy: user.id,
      },
      include: {
        event: {
          select: { id: true, title: true },
        },
        usages: {
          include: {
            user: {
              select: { email: true, firstName: true, lastName: true },
            },
            order: {
              select: { orderNumber: true, totalAmount: true, createdAt: true },
            },
          },
          orderBy: { usedAt: "desc" },
        },
        _count: {
          select: { usages: true },
        },
      },
    });

    if (!promoCode) {
      return NextResponse.json(
        { error: "Código promocional no encontrado" },
        { status: 404 }
      );
    }

    const serializedPromoCode = {
      ...promoCode,
      description: promoCode.description ?? undefined,
      usageLimit: promoCode.usageLimit ?? undefined,
      validFrom: promoCode.validFrom.toISOString(),
      validUntil: promoCode.validUntil?.toISOString() || undefined,
      createdAt: promoCode.createdAt.toISOString(),
      updatedAt: promoCode.updatedAt.toISOString(),
      usages: promoCode.usages.map((usage) => ({
        ...usage,
        usedAt: usage.usedAt.toISOString(),
        createdAt: usage.createdAt.toISOString(),
        updatedAt: usage.updatedAt.toISOString(),
        order: {
          ...usage.order,
          createdAt: usage.order.createdAt.toISOString(),
        },
      })),
    };

    return NextResponse.json({ promoCode: serializedPromoCode });
  } catch (error) {
    console.error("Error fetching promo code:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireOrganizer();
    const body = await request.json();
    const validation = updatePromoCodeSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const promoCode = await prisma.promoCode.findFirst({
      where: {
        id,
        createdBy: user.id,
      },
    });

    if (!promoCode) {
      return NextResponse.json(
        { error: "Código promocional no encontrado" },
        { status: 404 }
      );
    }

    const { validUntil, ...restData } = validation.data;
    
    const updateData: Partial<{
      name?: string;
      description?: string;
      status?: "ACTIVE" | "INACTIVE";
      usageLimit?: number;
      usageLimitPerUser?: number;
      validUntil?: Date;
    }> = {
      ...restData,
      ...(validUntil && { validUntil: new Date(validUntil) }),
    };

    const updatedPromoCode = await prisma.promoCode.update({
      where: { id },
      data: updateData,
      include: {
        event: {
          select: { title: true },
        },
        _count: {
          select: { usages: true },
        },
      },
    });

    const serializedPromoCode = {
      ...updatedPromoCode,
      description: updatedPromoCode.description ?? undefined,
      usageLimit: updatedPromoCode.usageLimit ?? undefined,
      validFrom: updatedPromoCode.validFrom.toISOString(),
      validUntil: updatedPromoCode.validUntil?.toISOString() || undefined,
      createdAt: updatedPromoCode.createdAt.toISOString(),
      updatedAt: updatedPromoCode.updatedAt.toISOString(),
      event: updatedPromoCode.event || undefined,
    };

    return NextResponse.json({
      message: "Código promocional actualizado exitosamente",
      promoCode: serializedPromoCode,
    });
  } catch (error) {
    console.error("Error updating promo code:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireOrganizer();

    const promoCode = await prisma.promoCode.findFirst({
      where: {
        id,
        createdBy: user.id,
      },
      include: {
        _count: {
          select: { usages: true },
        },
      },
    });

    if (!promoCode) {
      return NextResponse.json(
        { error: "Código promocional no encontrado" },
        { status: 404 }
      );
    }

    if (promoCode._count.usages > 0) {
      return NextResponse.json(
        { 
          error: `No se puede eliminar el código porque ya ha sido usado ${promoCode._count.usages} vez(es)` 
        },
        { status: 400 }
      );
    }

    await prisma.promoCode.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Código promocional eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error deleting promo code:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}