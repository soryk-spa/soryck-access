import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { COMMISSION_RATE } from "@/lib/commission";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    await requireAdmin();

    const totalStats = await prisma.order.aggregate({
      where: {
        status: "PAID",
      },
      _sum: {
        totalAmount: true,
        baseAmount: true,
        commissionAmount: true,
      },
      _count: {
        id: true,
      },
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyStats = await prisma.order.aggregate({
      where: {
        status: "PAID",
        createdAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        totalAmount: true,
        baseAmount: true,
        commissionAmount: true,
      },
      _count: {
        id: true,
      },
    });

    const topEventsByRevenue = await prisma.event.findMany({
      where: {
        orders: {
          some: {
            status: "PAID",
          },
        },
      },
      include: {
        orders: {
          where: {
            status: "PAID",
          },
        },
        _count: {
          select: {
            tickets: true,
          },
        },
      },
      take: 10,
    });

    const topEvents = topEventsByRevenue
      .map((event) => {
        const totalRevenue = event.orders.reduce(
          (sum, order) => sum + order.totalAmount,
          0
        );
        const commissions = event.orders.reduce(
          (sum, order) => sum + (order.commissionAmount || 0),
          0
        );

        return {
          id: event.id,
          title: event.title,
          totalRevenue,
          commissions,
          ticketsSold: event._count.tickets,
        };
      })
      .filter((event) => event.totalRevenue > 0)
      .sort((a, b) => b.commissions - a.commissions)
      .slice(0, 5);

    const recentCommissions = await prisma.order.findMany({
      where: {
        status: "PAID",
        commissionAmount: {
          gt: 0,
        },
      },
      include: {
        event: {
          select: {
            title: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
    });

    const formattedRecentCommissions = recentCommissions.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      eventTitle: order.event.title,
      baseAmount: order.baseAmount || 0,
      commissionAmount: order.commissionAmount || 0,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt.toISOString(),
    }));

    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyBreakdown = (await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        SUM("totalAmount") as revenue,
        SUM("commissionAmount") as commissions,
        COUNT(*) as orders
      FROM "orders"
      WHERE "status" = 'PAID' 
        AND "createdAt" >= ${twelveMonthsAgo}
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month ASC
    `) as Array<{
      month: Date;
      revenue: number;
      commissions: number;
      orders: number;
    }>;

    const response = {
      totalCommissions: totalStats._sum.commissionAmount || 0,
      totalRevenue: totalStats._sum.totalAmount || 0,
      totalBaseAmount: totalStats._sum.baseAmount || 0,
      commissionRate: COMMISSION_RATE,
      totalOrders: totalStats._count.id,

      monthlyCommissions: monthlyStats._sum.commissionAmount || 0,
      monthlyRevenue: monthlyStats._sum.totalAmount || 0,
      monthlyOrders: monthlyStats._count.id,

      topEvents,
      recentCommissions: formattedRecentCommissions,

      monthlyBreakdown: monthlyBreakdown.map((item) => ({
        month: item.month.toISOString(),
        revenue: Number(item.revenue),
        commissions: Number(item.commissions),
        orders: Number(item.orders),
      })),

      
      averageOrderValue:
        totalStats._count.id > 0
          ? (totalStats._sum.totalAmount || 0) / totalStats._count.id
          : 0,
      averageCommissionPerOrder:
        totalStats._count.id > 0
          ? (totalStats._sum.commissionAmount || 0) / totalStats._count.id
          : 0,
      effectiveCommissionRate:
        (totalStats._sum.totalAmount || 0) > 0
          ? (totalStats._sum.commissionAmount || 0) /
            (totalStats._sum.totalAmount || 0)
          : 0,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching commission stats:", error);

    if (error instanceof Error && error.message.includes("Acceso denegado")) {
      return NextResponse.json(
        { error: "Solo administradores pueden ver estadísticas de comisiones" },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { startDate, endDate, eventId } = body;

    const whereClause: Prisma.OrderWhereInput = {
      status: "PAID",
    };

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    if (eventId) {
      whereClause.eventId = eventId;
    }

    const stats = await prisma.order.aggregate({
      where: whereClause,
      _sum: {
        totalAmount: true,
        baseAmount: true,
        commissionAmount: true,
      },
      _count: {
        id: true,
      },
    });

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        event: {
          select: {
            title: true,
          },
        },
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      period: {
        startDate,
        endDate,
        eventId,
      },
      stats: {
        totalRevenue: stats._sum.totalAmount || 0,
        totalCommissions: stats._sum.commissionAmount || 0,
        totalBaseAmount: stats._sum.baseAmount || 0,
        orderCount: stats._count.id,
        averageOrderValue:
          stats._count.id > 0
            ? (stats._sum.totalAmount || 0) / stats._count.id
            : 0,
      },
      orders: orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        eventTitle: order.event.title,
        customerEmail: order.user.email,
        customerName: order.user.firstName
          ? `${order.user.firstName} ${order.user.lastName || ""}`.trim()
          : order.user.email,
        baseAmount: order.baseAmount || 0,
        commissionAmount: order.commissionAmount || 0,
        totalAmount: order.totalAmount,
        createdAt: order.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching period stats:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
