import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
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
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    
    const [
      totalUsers,
      clientsCount,
      organizersCount,
      scannersCount,
      adminsCount,
      activeUsersThisMonth,
      usersWithEvents,
      usersWithTickets
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: "CLIENT" } }),
      prisma.user.count({ where: { role: "ORGANIZER" } }),
      prisma.user.count({ where: { role: "SCANNER" } }),
      prisma.user.count({ where: { role: "ADMIN" } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),
      prisma.user.count({
        where: {
          organizedEvents: {
            some: {}
          }
        }
      }),
      prisma.user.count({
        where: {
          tickets: {
            some: {}
          }
        }
      })
    ]);

    const stats = {
      totalUsers,
      usersByRole: {
        CLIENT: clientsCount,
        ORGANIZER: organizersCount,
        SCANNER: scannersCount,
        ADMIN: adminsCount
      },
      activeUsersThisMonth,
      usersWithEvents,
      usersWithTickets
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
