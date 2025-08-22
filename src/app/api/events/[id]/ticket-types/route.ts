import { NextRequest, NextResponse } from "next/server";
import { requireOrganizer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireOrganizer();
    const { id } = await params;

    // Verificar que el usuario puede acceder a este evento
    const event = await prisma.event.findFirst({
      where: {
        id,
        organizerId: user.id,
      },
      include: {
        ticketTypes: {
          select: {
            id: true,
            name: true,
            price: true,
            capacity: true,
            status: true,
          },
          where: {
            status: "AVAILABLE", // Solo tipos de entrada disponibles
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ticketTypes: event.ticketTypes,
    });
  } catch (error) {
    console.error("Error fetching ticket types:", error);
    
    if (error instanceof Error && error.message.includes("Acceso denegado")) {
      return NextResponse.json(
        { error: "Solo organizadores y administradores pueden ver tipos de entrada" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
