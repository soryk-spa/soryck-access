import { prisma } from "@/lib/prisma";
import { AdminDashboardClient } from "@/components/admin-dashboard-client";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [
    totalUsers,
    totalEvents,
    totalOrders,
    totalRevenue,
    pendingRequests,
    recentEvents,
    recentUsers,
    monthlyStats
  ] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.aggregate({
      where: { status: "PAID" },
      _sum: { totalAmount: true }
    }),
    prisma.roleRequest.count({ where: { status: "PENDING" } }),
    prisma.event.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        organizer: {
          select: { firstName: true, lastName: true, email: true }
        },
        category: {
          select: { name: true }
        },
        _count: {
          select: { tickets: true, orders: true }
        }
      }
    }),
    prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true
      }
    }),
    
    Array.from({ length: 6 }, (_, i) => ({
      name: new Date(Date.now() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString("es-CL", { month: "short" }),
      usuarios: Math.floor(Math.random() * 100) + 20,
      eventos: Math.floor(Math.random() * 50) + 10,
      ingresos: Math.floor(Math.random() * 5000000) + 1000000,
    }))
  ]);

  return (
    <AdminDashboardClient
      totalUsers={totalUsers}
      totalEvents={totalEvents}
      totalOrders={totalOrders}
      totalRevenue={totalRevenue._sum.totalAmount || 0}
      pendingRequests={pendingRequests}
      recentEvents={recentEvents}
      recentUsers={recentUsers}
      monthlyStats={monthlyStats}
    />
  );
}

export { AdminDashboard as ModernAdminDashboard };
