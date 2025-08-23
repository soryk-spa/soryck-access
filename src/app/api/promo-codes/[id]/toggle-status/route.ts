import { NextRequest, NextResponse } from "next/server";
import { requireOrganizer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const toggleStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await requireOrganizer();
    const body = await request.json();

    // Validar los datos de entrada
    const validatedData = toggleStatusSchema.parse(body);

    // Verificar que el código promocional existe y pertenece al usuario
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

    // No permitir cambios de estado en códigos expirados o agotados
    if (promoCode.status === "EXPIRED" || promoCode.status === "USED_UP") {
      return NextResponse.json(
        { error: "No se puede cambiar el estado de códigos expirados o agotados" },
        { status: 400 }
      );
    }

    // Actualizar el estado del código promocional
    const updatedPromoCode = await prisma.promoCode.update({
      where: { id },
      data: { 
        status: validatedData.status,
        updatedAt: new Date(),
      },
      include: {
        event: {
          select: { title: true },
        },
        _count: {
          select: { usages: true },
        },
      },
    });

    const actionText = validatedData.status === "ACTIVE" ? "activado" : "desactivado";

    return NextResponse.json({
      promoCode: updatedPromoCode,
      message: `Código promocional ${actionText} exitosamente`,
    });
  } catch (error) {
    console.error("Error toggling promo code status:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
