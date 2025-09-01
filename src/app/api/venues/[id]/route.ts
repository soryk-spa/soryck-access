import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener el usuario de la base de datos usando clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const { id } = await params;

    const venue = await prisma.venue.findFirst({
      where: {
        id,
        createdBy: user.id,
      },
      include: {
        sections: {
          include: {
            venueSeats: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!venue) {
      return NextResponse.json({ error: "Venue no encontrado" }, { status: 404 });
    }

    return NextResponse.json(venue);
  } catch (error) {
    console.error("Error fetching venue:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener el usuario de la base de datos usando clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, address, capacity } = body;

    // Verificar que el venue existe y pertenece al usuario
    const existingVenue = await prisma.venue.findFirst({
      where: {
        id,
        createdBy: user.id,
      },
    });

    if (!existingVenue) {
      return NextResponse.json({ error: "Venue no encontrado" }, { status: 404 });
    }

    const venue = await prisma.venue.update({
      where: {
        id,
      },
      data: {
        name: name?.trim() || existingVenue.name,
        description: description?.trim() || existingVenue.description,
        address: address?.trim() || existingVenue.address,
        capacity: capacity ?? existingVenue.capacity,
      },
    });

    return NextResponse.json(venue);
  } catch (error) {
    console.error("Error updating venue:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Obtener el usuario de la base de datos usando clerkId
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const { id } = await params;

    // Verificar que el venue existe y pertenece al usuario
    const existingVenue = await prisma.venue.findFirst({
      where: {
        id,
        createdBy: user.id,
      },
    });

    if (!existingVenue) {
      return NextResponse.json({ error: "Venue no encontrado" }, { status: 404 });
    }

    // Verificar si el venue está siendo usado en algún evento
    // En el futuro podríamos verificar si hay eventos que usan este venue
    // const eventsUsingVenue = await prisma.event.findMany({ ... });

    // Por simplicidad, permitimos eliminar por ahora

    await prisma.venue.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: "Venue eliminado exitosamente" });
  } catch (error) {
    console.error("Error deleting venue:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
