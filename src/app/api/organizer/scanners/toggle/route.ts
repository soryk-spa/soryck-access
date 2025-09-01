import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const toggleScannerSchema = z.object({
  scannerId: z.string().min(1, "ID del scanner requerido"),
  isActive: z.boolean(),
});

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Verificar que el usuario sea organizador
    if (user.role !== "ORGANIZER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para modificar validadores" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = toggleScannerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { scannerId, isActive } = validation.data;

    // Verificar que el scanner pertenezca al organizador
    const scanner = await prisma.eventScanner.findFirst({
      where: {
        id: scannerId,
        assignedBy: user.id,
      },
    });

    if (!scanner) {
      return NextResponse.json(
        { error: "Validador no encontrado o no tienes permisos" },
        { status: 404 }
      );
    }

    // Actualizar el estado
    const updatedScanner = await prisma.eventScanner.update({
      where: { id: scannerId },
      data: { isActive },
    });

    return NextResponse.json({
      success: true,
      message: `Validador ${isActive ? "activado" : "desactivado"} exitosamente`,
      scanner: updatedScanner,
    });

  } catch (error) {
    console.error("Error toggling scanner:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
