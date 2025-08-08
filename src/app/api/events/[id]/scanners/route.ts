import { NextRequest, NextResponse } from "next/server";
import { canAccessEvent } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const assignScannerSchema = z.object({
  scannerEmail: z.string().email("Email inválido"),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { canAccess } = await canAccessEvent(id);

    if (!canAccess) {
      return NextResponse.json(
        { error: "No tienes permisos para ver los scanners de este evento" },
        { status: 403 }
      );
    }

    const scanners = await prisma.eventScanner.findMany({
      where: { eventId: id },
      include: {
        scanner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
        assigner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { assignedAt: "desc" },
    });

    const serializedScanners = scanners.map((scanner) => ({
      ...scanner,
      assignedAt: scanner.assignedAt.toISOString(),
      createdAt: scanner.createdAt.toISOString(),
      updatedAt: scanner.updatedAt.toISOString(),
    }));

    return NextResponse.json({ scanners: serializedScanners });
  } catch (error) {
    console.error("Error fetching event scanners:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { canAccess, user } = await canAccessEvent(id);

    if (!canAccess) {
      return NextResponse.json(
        { error: "No tienes permisos para asignar scanners a este evento" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = assignScannerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Datos inválidos",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    const { scannerEmail } = validation.data;

    const scannerUser = await prisma.user.findUnique({
      where: { email: scannerEmail },
    });

    if (!scannerUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado con ese email" },
        { status: 404 }
      );
    }

    if (!["SCANNER", "ORGANIZER", "ADMIN"].includes(scannerUser.role)) {
      return NextResponse.json(
        {
          error:
            "El usuario debe tener rol de Scanner, Organizador o Administrador",
        },
        { status: 400 }
      );
    }

    const existingAssignment = await prisma.eventScanner.findFirst({
      where: {
        eventId: id,
        scannerId: scannerUser.id,
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        {
          error: "Este usuario ya está asignado como scanner para este evento",
        },
        { status: 400 }
      );
    }

    const assignment = await prisma.eventScanner.create({
      data: {
        eventId: id,
        scannerId: scannerUser.id,
        assignedBy: user.id,
      },
      include: {
        scanner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: "Scanner asignado exitosamente",
      assignment: {
        ...assignment,
        assignedAt: assignment.assignedAt.toISOString(),
        createdAt: assignment.createdAt.toISOString(),
        updatedAt: assignment.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error assigning scanner:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
