import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { cache } from "@/lib/redis";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Intentar obtener estadísticas desde Redis primero
    const cachedStats = await cache.getDashboardStats(userId);
    if (cachedStats) {
      return NextResponse.json(cachedStats);
    }

    // Si no está en caché, calcular estadísticas
    const now = new Date();
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(now.getMonth() - 11);

    // Generar array de los últimos 12 meses
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(now.getMonth() - i);
      months.push({
        date,
        name: date.toLocaleDateString('es-CL', { month: 'short' }).replace('.', ''),
        year: date.getFullYear(),
        month: date.getMonth() + 1
      });
    }

    // Obtener estadísticas mensuales
    const monthlyStats = await Promise.all(
      months.map(async (month) => {
        const startOfMonth = new Date(month.year, month.month - 1, 1);
        const endOfMonth = new Date(month.year, month.month, 0, 23, 59, 59);

        // Ingresos del mes
        const revenue = await prisma.order.aggregate({
          where: {
            event: { organizerId: userId },
            status: "PAID",
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          },
          _sum: { totalAmount: true }
        });

        // Eventos creados en el mes
        const eventsCount = await prisma.event.count({
          where: {
            organizerId: userId,
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        });

        // Tickets vendidos en el mes
        const ticketsCount = await prisma.ticket.count({
          where: {
            event: { organizerId: userId },
            order: { status: "PAID" },
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        });

        return {
          name: month.name,
          ingresos: revenue._sum.totalAmount || 0,
          eventos: eventsCount,
          tickets: ticketsCount
        };
      })
    );

    // Guardar en caché por 5 minutos (las estadísticas cambian frecuentemente)
    await cache.setDashboardStats(userId, monthlyStats, 300);

    return NextResponse.json(monthlyStats);
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
