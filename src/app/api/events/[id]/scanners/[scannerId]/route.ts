import { NextRequest, NextResponse } from "next/server";
import { canAccessEvent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; scannerId: string }> }
) {
  try {
    const { id, scannerId } = await params;
    const { canAccess } = await canAccessEvent(id);

    if (!canAccess) {
      return NextResponse.json(
        { error: "No tienes permisos para remover scanners de este evento" },
        { status: 403 }
      );
    }

    const assignment = await prisma.eventScanner.findFirst({
      where: {
        eventId: id,
        scannerId: scannerId,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Asignación de scanner no encontrada" },
        { status: 404 }
      );
    }

    await prisma.eventScanner.delete({
      where: { id: assignment.id },
    });

    return NextResponse.json({
      message: "Scanner removido exitosamente",
    });
  } catch (error) {
    console.error("Error removing scanner:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; scannerId: string }> }
) {
  try {
    const { id, scannerId } = await params;
    const { canAccess } = await canAccessEvent(id);

    if (!canAccess) {
      return NextResponse.json(
        { error: "No tienes permisos para modificar scanners de este evento" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { isActive } = body;

    if (typeof isActive !== "boolean") {
      return NextResponse.json(
        { error: "isActive debe ser un valor booleano" },
        { status: 400 }
      );
    }

    const assignment = await prisma.eventScanner.findFirst({
      where: {
        eventId: id,
        scannerId: scannerId,
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Asignación de scanner no encontrada" },
        { status: 404 }
      );
    }

    const updatedAssignment = await prisma.eventScanner.update({
      where: { id: assignment.id },
      data: { isActive },
      include: {
        scanner: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: `Scanner ${isActive ? "activado" : "desactivado"} exitosamente`,
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error("Error updating scanner status:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
