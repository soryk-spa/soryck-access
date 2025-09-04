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

    
    const sections = venue.sections.map(section => ({
      id: section.id,
      name: section.name,
      color: section.color,
      x: section.x,
      y: section.y,
      width: section.width,
      height: section.height,
      seats: section.venueSeats.map(seat => ({
        id: seat.id,
        row: seat.row,
        number: seat.number,
        x: seat.x,
        y: seat.y,
        status: 'AVAILABLE' as const,
      })),
    }));

    return NextResponse.json({
      venueId: venue.id,
      sections,
    });
  } catch (error) {
    console.error("Error fetching venue layout:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    const body = await request.json();
    const { sections } = body;

    
    const venue = await prisma.venue.findFirst({
      where: {
        id,
        createdBy: user.id,
      },
    });

    if (!venue) {
      return NextResponse.json({ error: "Venue no encontrado" }, { status: 404 });
    }

    
    await prisma.$transaction(async (tx) => {
      
      await tx.venueSeat.deleteMany({
        where: {
          section: {
            venueId: id,
          },
        },
      });

      await tx.venueSection.deleteMany({
        where: {
          venueId: id,
        },
      });

      
      for (const section of sections) {
        const createdSection = await tx.venueSection.create({
          data: {
            id: section.id,
            name: section.name,
            color: section.color,
            x: section.x,
            y: section.y,
            width: section.width,
            height: section.height,
            seatLayout: {},
            venueId: id,
          },
        });

        
        if (section.seats && section.seats.length > 0) {
          const seatsData = section.seats.map((seat: {
            id: string;
            row: string;
            number: string;
            x: number;
            y: number;
          }) => ({
            id: seat.id,
            row: seat.row,
            number: seat.number,
            x: seat.x,
            y: seat.y,
            sectionId: createdSection.id,
          }));

          await tx.venueSeat.createMany({
            data: seatsData,
          });
        }
      }

      
      const totalSeats = sections.reduce((total: number, section: {
        seats?: Array<{ id: string; row: string; number: string; x: number; y: number }>;
      }) => {
        return total + (section.seats?.length || 0);
      }, 0);

      await tx.venue.update({
        where: {
          id,
        },
        data: {
          capacity: totalSeats,
        },
      });
    });

    return NextResponse.json({ 
      message: "Layout guardado exitosamente",
      venueId: id,
    });
  } catch (error) {
    console.error("Error saving venue layout:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
