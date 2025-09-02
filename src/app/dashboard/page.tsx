import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserDashboardClient } from "@/components/user-dashboard-client";
import { RoleRequestForm } from "@/components/role-request-form";
import { ROLE_LABELS, canOrganizeEvents } from "@/lib/roles";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function DashboardPage() {
  const user = await requireAuth();

  // Obtener estadísticas del usuario
  const [events, totalTicketsSold, totalRevenue, recentEvents] = await Promise.all([
    prisma.event.findMany({
      where: { organizerId: user.id },
      include: {
        _count: {
          select: { orders: true, tickets: true }
        },
        category: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.ticket.count({
      where: {
        event: { organizerId: user.id },
        order: { status: "PAID" }
      }
    }),
    prisma.order.aggregate({
      where: {
        event: { organizerId: user.id },
        status: "PAID"
      },
      _sum: { totalAmount: true }
    }),
    prisma.event.findMany({
      where: { organizerId: user.id },
      include: {
        _count: {
          select: { orders: true, tickets: true }
        },
        category: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const totalEvents = events.length;
  const publishedEvents = events.filter(event => event.isPublished).length;
  const revenue = totalRevenue._sum.totalAmount || 0;
  
  const recentEventsData = recentEvents.map(event => ({
    id: event.id,
    title: event.title,
    organizer: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
    date: new Date(event.startDate).toLocaleDateString("es-CL"),
    status: event.isPublished ? "published" as const : "draft" as const,
    revenue: event._count.orders * 15000, // Esto se calculará con datos reales en el futuro
    tickets: event._count.tickets,
  }));

  // Si el usuario no puede organizar eventos, mostrar formulario de solicitud
  if (!canOrganizeEvents(user.role)) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido de vuelta, {user.firstName || user.email}
          </p>
        </div>

        <Alert>
          <AlertDescription>
            Tu rol actual es <strong>{ROLE_LABELS[user.role]}</strong>. 
            Para crear eventos necesitas solicitar el rol de organizador.
          </AlertDescription>
        </Alert>

        <RoleRequestForm />
      </div>
    );
  }

  return (
    <UserDashboardClient
      totalEvents={totalEvents}
      publishedEvents={publishedEvents}
      totalTicketsSold={totalTicketsSold}
      revenue={revenue}
      recentEventsData={recentEventsData}
      userRole={ROLE_LABELS[user.role]}
      firstName={user.firstName}
      email={user.email}
    />
  );
}
