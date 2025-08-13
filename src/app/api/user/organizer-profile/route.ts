import { NextResponse } from "next/server";
import { requireOrganizer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const profileSchema = z.object({
  producerName: z.string().max(100, "Máximo 100 caracteres").optional(),
  bio: z.string().max(500, "Máximo 500 caracteres").optional(),
  websiteUrl: z.string().url("URL no válida").or(z.literal("")).optional(),
  twitterUrl: z.string().url("URL no válida").or(z.literal("")).optional(),
  instagramUrl: z.string().url("URL no válida").or(z.literal("")).optional(),
});

export async function GET() {
  try {
    const user = await requireOrganizer();
    return NextResponse.json({ profile: user });
  } catch (error) {
    console.error("Error fetching organizer profile:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const user = await requireOrganizer();
    const body = await request.json();

    const validation = profileSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: validation.error.issues },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: validation.data,
    });

    return NextResponse.json({
      message: "Perfil actualizado exitosamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating organizer profile:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
