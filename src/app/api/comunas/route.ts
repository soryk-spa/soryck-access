import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const regionId = searchParams.get('regionId');

    let whereClause = {};
    if (regionId) {
      whereClause = { regionId };
    }

    const comunas = await prisma.comuna.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
      include: {
        region: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      comunas: comunas.map(comuna => ({
        id: comuna.id,
        name: comuna.name,
        code: comuna.code,
        regionId: comuna.regionId,
        region: comuna.region
      }))
    });

  } catch (error) {
    console.error('Error fetching comunas:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor',
        comunas: [] 
      },
      { status: 500 }
    );
  }
}
