import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendScannerInviteEmail } from "@/lib/email";
import { z } from "zod";

const assignScannerSchema = z.object({
  eventId: z.string().min(1, "ID del evento requerido"),
  scannerId: z.string().optional(),
  scannerEmail: z.string().email().optional(),
}).refine(
  (data) => data.scannerId || data.scannerEmail,
  {
    message: "Debe proporcionar scannerId o scannerEmail",
    path: ["scannerId"],
  }
);

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    // Verificar que el usuario sea organizador
    if (user.role !== "ORGANIZER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para asignar validadores" },
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

    const { eventId, scannerId, scannerEmail } = validation.data;

    // Verificar que el evento pertenezca al organizador y obtener más información
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizerId: user.id,
      },
      include: {
        organizer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        venue: {
          select: {
            name: true,
            address: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado o no tienes permisos" },
        { status: 404 }
      );
    }

    let targetScannerId = scannerId;
    let isNewUser = false;

    // Si se proporcionó email, buscar o crear el usuario scanner
    if (scannerEmail && !scannerId) {
      let scannerUser = await prisma.user.findUnique({
        where: { email: scannerEmail },
      });

      if (!scannerUser) {
        // Crear usuario scanner con email
        scannerUser = await prisma.user.create({
          data: {
            email: scannerEmail,
            clerkId: `scanner_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            role: "SCANNER",
            firstName: "Scanner",
            lastName: "Usuario",
          },
        });
        isNewUser = true;
      } else if (scannerUser.role !== "SCANNER") {
        return NextResponse.json(
          { error: "El usuario no tiene rol de validador" },
          { status: 400 }
        );
      }

      targetScannerId = scannerUser.id;
    }

    if (!targetScannerId) {
      return NextResponse.json(
        { error: "No se pudo identificar el validador" },
        { status: 400 }
      );
    }

    // Verificar si ya está asignado
    const existingAssignment = await prisma.eventScanner.findUnique({
      where: {
        eventId_scannerId: {
          eventId,
          scannerId: targetScannerId,
        },
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "Este validador ya está asignado a este evento" },
        { status: 400 }
      );
    }

    // Crear la asignación
    const assignment = await prisma.eventScanner.create({
      data: {
        eventId,
        scannerId: targetScannerId,
        assignedBy: user.id,
        isActive: true,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            isPublished: true,
          },
        },
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
    });

    // Enviar email de invitación
    try {
      // Obtener el usuario scanner completo y el organizador completo
      const [scannerUser, organizerUser] = await Promise.all([
        prisma.user.findUnique({
          where: { id: targetScannerId },
        }),
        prisma.user.findUnique({
          where: { id: user.id },
        }),
      ]);

      if (scannerUser && organizerUser) {
        const emailResult = await sendScannerInviteEmail({
          scannerUser,
          event,
          organizer: organizerUser,
          isNewUser,
        });

        console.log('Scanner invitation email sent:', emailResult);
      }
    } catch (emailError) {
      console.error('Error sending scanner invitation email:', emailError);
      // No fallar la asignación si el email falla
    }

    return NextResponse.json({
      success: true,
      message: "Validador asignado exitosamente",
      scanner: assignment,
    });

  } catch (error) {
    console.error("Error assigning scanner:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
