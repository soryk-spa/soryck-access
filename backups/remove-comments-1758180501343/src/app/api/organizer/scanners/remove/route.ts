import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

// Ensure this API route runs dynamically so server-side auth can access the request
export const dynamic = 'force-dynamic'
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const removeScannerSchema = z.object({
  scannerId: z.string().min(1, "ID del scanner requerido"),
});

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();

    
    if (user.role !== "ORGANIZER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para remover validadores" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = removeScannerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { scannerId } = validation.data;

    
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

    
    await prisma.eventScanner.delete({
      where: { id: scannerId },
    });

    return NextResponse.json({
      success: true,
      message: "Validador removido exitosamente",
    });

  } catch (error) {
    console.error("Error removing scanner:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
