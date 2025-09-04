import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import CacheInvalidation from "@/lib/cache-invalidation";

const settingsSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido").optional(),
  lastName: z.string().min(1, "El apellido es requerido").optional(),
  bio: z.string().max(500, "La biografía debe tener máximo 500 caracteres").optional(),
  producerName: z.string().max(100, "El nombre de productor debe tener máximo 100 caracteres").optional(),
  websiteUrl: z.string().url("URL del sitio web inválida").optional().or(z.literal("")),
  twitterUrl: z.string().url("URL de Twitter inválida").optional().or(z.literal("")),
  instagramUrl: z.string().url("URL de Instagram inválida").optional().or(z.literal("")),
});

export async function PUT(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = settingsSchema.parse(body);

    
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    
    const updatedUser = await prisma.user.update({
      where: { clerkId },
      data: {
        ...validatedData,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        bio: true,
        producerName: true,
        websiteUrl: true,
        twitterUrl: true,
        instagramUrl: true,
        imageUrl: true,
        role: true,
        updatedAt: true,
      }
    });

    
    await CacheInvalidation.invalidateUserProfile(clerkId);
    await CacheInvalidation.invalidateUserCache(clerkId);

    return NextResponse.json({
      message: "Configuración actualizada exitosamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Datos inválidos", details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        clerkId: true,
        firstName: true,
        lastName: true,
        email: true,
        bio: true,
        producerName: true,
        websiteUrl: true,
        twitterUrl: true,
        instagramUrl: true,
        imageUrl: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
