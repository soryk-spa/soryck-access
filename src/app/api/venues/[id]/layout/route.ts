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
        creator: true,
        events: true,
      },
    });

    if (!venue) {
      return NextResponse.json({ error: "Venue no encontrado" }, { status: 404 });
    }

    
    return NextResponse.json({
      venueId: venue.id,
      name: venue.name,
      description: venue.description,
      address: venue.address,
      capacity: venue.capacity,
      sections: venue.layoutSections || [], 
      elements: venue.layoutElements || [], 
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
    
    
    let body;
    try {
      const text = await request.text();
      if (!text.trim()) {
        console.log("⚠️ Petición con cuerpo vacío recibida, ignorando...");
        return NextResponse.json({ 
          message: "Petición vacía ignorada",
          venueId: id
        });
      }
      body = JSON.parse(text);
    } catch (error) {
      console.error("❌ Error parsing JSON:", error);
      return NextResponse.json(
        { error: "Formato JSON inválido" },
        { status: 400 }
      );
    }

    const { sections = [], elements = [] } = body;

    console.log(`💾 Guardando venue ${id}: ${sections.length} secciones, ${elements.length} elementos`);

    
    const venue = await prisma.venue.findFirst({
      where: {
        id,
        createdBy: user.id,
      },
    });

    if (!venue) {
      return NextResponse.json({ error: "Venue no encontrado" }, { status: 404 });
    }

    
    const totalCapacity = sections.reduce((total: number, section: { seats?: unknown[] }) => {
      return total + (section.seats?.length || 0);
    }, 0);

    
    await prisma.venue.update({
      where: { id },
      data: {
        capacity: totalCapacity || venue.capacity,
        layoutSections: sections, 
        layoutElements: elements, 
      },
    });

    console.log(`✅ Venue ${id} guardado exitosamente en DB`);

    return NextResponse.json({ 
      message: "Layout guardado exitosamente",
      venueId: id,
      sections: sections,
      elements: elements
    });
  } catch (error) {
    console.error("Error saving venue layout:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
