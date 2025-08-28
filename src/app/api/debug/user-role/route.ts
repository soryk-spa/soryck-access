import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId } = await auth();
    
    console.log("🔍 Debug - userId from Clerk:", userId);
    
    if (!userId) {
      return NextResponse.json({ 
        error: "No autenticado",
        clerkUserId: null,
        dbUser: null
      }, { status: 401 });
    }

    // Buscar usuario en la base de datos
    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: {
        id: true,
        clerkId: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      }
    });

    console.log("🔍 Debug - Usuario en DB:", user);

    // También busquemos todos los usuarios para ver qué hay en la DB
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
      },
      take: 10
    });

    console.log("🔍 Debug - Todos los usuarios en DB:", allUsers);

    return NextResponse.json({
      clerkUserId: userId,
      dbUser: user,
      allUsers: allUsers,
      message: user 
        ? `Usuario encontrado: ${user.email}, Rol: ${user.role}` 
        : `Usuario con ID ${userId} no existe en la base de datos`
    });
  } catch (error) {
    console.error("❌ Error checking user role:", error);
    return NextResponse.json(
      { 
        error: "Error interno del servidor", 
        details: error instanceof Error ? error.message : "Error desconocido" 
      },
      { status: 500 }
    );
  }
}
