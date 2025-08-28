import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { cache } from "@/lib/redis";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    // Intentar obtener el rol desde Redis primero
    const cachedRole = await cache.getUserRole(clerkId);
    if (cachedRole) {
      return NextResponse.json({ role: cachedRole });
    }

    // Si no está en caché, buscar en la base de datos
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { role: true }
    });

    const role = user?.role || "CLIENT";

    // Guardar en caché por 1 hora
    await cache.setUserRole(clerkId, role, 3600);

    return NextResponse.json({ role });
  } catch (error) {
    console.error("Error fetching user role:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
