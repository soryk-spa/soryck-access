import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    console.log("🔄 Sincronizando usuario:", {
      clerkId: userId,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName
    });

    
    const existingUser = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (existingUser) {
      return NextResponse.json({
        message: "Usuario ya existe en la base de datos",
        user: existingUser
      });
    }

    
    const newUser = await prisma.user.create({
      data: {
        clerkId: userId, 
        email: user.emailAddresses[0]?.emailAddress || "",
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        role: "ADMIN", 
      }
    });

    console.log("✅ Usuario sincronizado:", newUser);

    return NextResponse.json({
      message: "Usuario sincronizado exitosamente",
      user: newUser
    });
  } catch (error) {
    console.error("❌ Error sincronizando usuario:", error);
    return NextResponse.json(
      { 
        error: "Error sincronizando usuario", 
        details: error instanceof Error ? error.message : "Error desconocido" 
      },
      { status: 500 }
    );
  }
}
