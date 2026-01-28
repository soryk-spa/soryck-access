import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const regions = await prisma.region.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { comunas: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      regions: regions.map(region => ({
        id: region.id,
        name: region.name,
        code: region.code,
        comunasCount: region._count.comunas
      }))
    });

  } catch (error) {
    console.error('Error fetching regions:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        regions: [] 
      },
      { status: 500 }
    );
  }
}
