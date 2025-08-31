import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema de validación para solicitud de cortesía
const courtesyRequestSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  rut: z.string().min(8, "RUT inválido"),
  email: z.string().email("Email inválido"),
  phone: z.string().optional(),
});

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// Obtener solicitudes de cortesía de un evento
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: eventId } = await params;

    // Verificar que el evento existe y permite cortesías
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { 
        id: true, 
        title: true, 
        allowCourtesy: true,
        courtesyLimit: true,
        _count: {
          select: {
            courtesyRequests: {
              where: {
                status: {
                  in: ['APPROVED', 'USED']
                }
              }
            }
          }
        }
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    if (!event.allowCourtesy) {
      return NextResponse.json(
        { error: "Este evento no permite solicitudes de cortesía" },
        { status: 400 }
      );
    }

    // Obtener todas las solicitudes de cortesía
    const courtesyRequests = await prisma.courtesyRequest.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        status: true,
        createdAt: true,
        approvedAt: true,
        usedAt: true,
        code: true,
        codeType: true,
        discountValue: true,
      },
    });

    return NextResponse.json({
      event: {
        id: event.id,
        title: event.title,
        allowCourtesy: event.allowCourtesy,
        courtesyLimit: event.courtesyLimit,
        usedCourtesies: event._count.courtesyRequests,
      },
      requests: courtesyRequests,
    });
  } catch (error) {
    console.error("Error fetching courtesy requests:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// Crear solicitud de cortesía
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();

    // Validar datos de entrada
    const validatedData = courtesyRequestSchema.parse(body);

    // Verificar que el evento existe y permite cortesías
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            courtesyRequests: {
              where: {
                status: {
                  in: ['APPROVED', 'USED']
                }
              }
            }
          }
        }
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    if (!event.allowCourtesy) {
      return NextResponse.json(
        { error: "Este evento no permite solicitudes de cortesía" },
        { status: 400 }
      );
    }

    // Verificar límite de cortesías
    if (event.courtesyLimit && event._count.courtesyRequests >= event.courtesyLimit) {
      return NextResponse.json(
        { error: "Se ha alcanzado el límite de cortesías para este evento" },
        { status: 400 }
      );
    }

    // Verificar si ya existe una solicitud con este email o RUT
    const existingRequest = await prisma.courtesyRequest.findFirst({
      where: {
        eventId,
        OR: [
          { email: validatedData.email },
          { rut: validatedData.rut }
        ]
      }
    });

    if (existingRequest) {
      return NextResponse.json(
        { error: "Ya existe una solicitud de cortesía con este email o RUT para este evento" },
        { status: 400 }
      );
    }

    // Crear la solicitud de cortesía
    const courtesyRequest = await prisma.courtesyRequest.create({
      data: {
        eventId,
        name: validatedData.name,
        rut: validatedData.rut,
        email: validatedData.email,
        phone: validatedData.phone,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      message: "Solicitud de cortesía enviada exitosamente",
      request: {
        id: courtesyRequest.id,
        status: courtesyRequest.status,
        createdAt: courtesyRequest.createdAt,
      }
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error creating courtesy request:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
