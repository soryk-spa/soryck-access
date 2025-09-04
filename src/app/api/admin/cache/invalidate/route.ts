import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import CacheInvalidation from "@/lib/cache-invalidation";

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { role: true }
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Permisos insuficientes" }, { status: 403 });
    }

    const { type, target } = await request.json();

    switch (type) {
      case 'events':
        await CacheInvalidation.invalidateEventsCache();
        break;
      
      case 'dashboard':
        await CacheInvalidation.invalidateDashboardStats(target);
        break;
      
      case 'user':
        if (!target) {
          return NextResponse.json({ error: "Se requiere target para invalidar caché de usuario" }, { status: 400 });
        }
        await CacheInvalidation.invalidateUserCache(target);
        break;
      
      case 'all':
        await CacheInvalidation.invalidateAllCache();
        break;
      
      default:
        return NextResponse.json({ error: "Tipo de invalidación no válido" }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Caché ${type} invalidado correctamente`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error invalidating cache:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
