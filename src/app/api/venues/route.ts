import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const venues = await prisma.venue.findMany({
      where: {
        createdBy: user.id,
      },
      include: {
        sections: {
          include: {
            venueSeats: true,
          },
        },
        _count: {
          select: {
            sections: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    
    const venuesWithStats = venues.map(venue => {
      const totalSeats = venue.sections.reduce((total, section) => {
        return total + section.venueSeats.length;
      }, 0);

      return {
        ...venue,
        totalSeats,
        totalSections: venue._count.sections,
      };
    });

    return NextResponse.json(venuesWithStats);
  } catch (error) {
    console.error("Error fetching venues:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, address, capacity } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "El nombre del venue es requerido" },
        { status: 400 }
      );
    }

    const venue = await prisma.venue.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        address: address?.trim() || null,
        capacity: capacity || 0,
        createdBy: user.id,
      },
    });

    return NextResponse.json(venue, { status: 201 });
  } catch (error) {
    console.error("Error creating venue:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
