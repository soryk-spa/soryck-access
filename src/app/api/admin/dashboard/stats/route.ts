import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { canAccessAdmin } from "@/lib/roles";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    
    const user = await prisma.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    if (!canAccessAdmin(user.role)) {
      console.log(`🚫 Usuario ${user.email} con rol ${user.role} intentó acceder a stats de admin`);
      return NextResponse.json({ 
        error: `Acceso denegado. Rol actual: ${user.role}. Se requiere: ADMIN` 
      }, { status: 403 });
    }

    console.log(`✅ Usuario ${user.email} con rol ${user.role} accediendo a stats de admin`);

    
    const now = new Date();
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(now.getMonth() - 11);

    
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

    
    const monthlyStats = await Promise.all(
      months.map(async (month) => {
        const startOfMonth = new Date(month.year, month.month - 1, 1);
        const endOfMonth = new Date(month.year, month.month, 0, 23, 59, 59);

        
        const revenue = await prisma.order.aggregate({
          where: {
            status: "PAID",
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          },
          _sum: { totalAmount: true }
        });

        
        const usersCount = await prisma.user.count({
          where: {
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        });

        
        const eventsCount = await prisma.event.count({
          where: {
            createdAt: {
              gte: startOfMonth,
              lte: endOfMonth
            }
          }
        });

        return {
          name: month.name,
          ingresos: revenue._sum.totalAmount || 0,
          usuarios: usersCount,
          eventos: eventsCount
        };
      })
    );

    
    const [totalUsers, totalEvents, totalOrders, totalRevenue] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.aggregate({
        where: { status: "PAID" },
        _sum: { totalAmount: true }
      })
    ]);

    return NextResponse.json({
      monthlyStats,
      totals: {
        users: totalUsers,
        events: totalEvents,
        orders: totalOrders,
        revenue: totalRevenue._sum.totalAmount || 0
      }
    });
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
