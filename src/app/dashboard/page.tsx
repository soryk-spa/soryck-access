import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { UserDashboardClient } from "@/components/user-dashboard-client";
import { RoleRequestForm } from "@/components/role-request-form";
import { ROLE_LABELS, canOrganizeEvents } from "@/lib/roles";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function DashboardPage() {
  const user = await requireAuth();

  // Obtener estadísticas completas del usuario
  const [
    events, 
    totalTicketsSold, 
    totalRevenue, 
    recentEvents, 
    promoCodes, 
    courtesyInvitations,
    upcomingEvents
  ] = await Promise.all([
    prisma.event.findMany({
      where: { organizerId: user.id },
      include: {
        _count: {
          select: { orders: true, tickets: true, courtesyInvitations: true }
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
          select: { orders: true, tickets: true, courtesyInvitations: true }
        },
        category: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.promoCode.count({
      where: { 
        createdBy: user.id,
        status: "ACTIVE"
      }
    }),
    prisma.courtesyInvitation.count({
      where: {
        event: { organizerId: user.id },
        status: "PENDING"
      }
    }),
    prisma.event.findMany({
      where: { 
        organizerId: user.id,
        startDate: { gte: new Date() },
        isPublished: true
      },
      orderBy: { startDate: "asc" },
      take: 3,
      include: {
        _count: {
          select: { tickets: true }
        },
        category: true,
      }
    })
  ]);

  const totalEvents = events.length;
  const publishedEvents = events.filter(event => event.isPublished).length;
  const draftEvents = totalEvents - publishedEvents;
  const revenue = totalRevenue._sum.totalAmount || 0;
  
  // Calcular métricas adicionales
  const averageTicketsPerEvent = totalEvents > 0 ? Math.round(totalTicketsSold / totalEvents) : 0;
  const conversionRate = totalEvents > 0 ? Math.round((publishedEvents / totalEvents) * 100) : 0;
  
  const recentEventsData = recentEvents.map(event => ({
    id: event.id,
    title: event.title,
    organizer: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
    date: new Date(event.startDate).toLocaleDateString("es-CL"),
    status: event.isPublished ? "published" as const : "draft" as const,
    revenue: event._count.orders * 15000, // Esto se calculará con datos reales en el futuro
    tickets: event._count.tickets,
    courtesyInvitations: event._count.courtesyInvitations || 0,
    category: event.category?.name || "Sin categoría",
  }));

  const upcomingEventsData = upcomingEvents.map(event => ({
    id: event.id,
    title: event.title,
    date: new Date(event.startDate).toLocaleDateString("es-CL", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    time: new Date(event.startDate).toLocaleTimeString("es-CL", {
      hour: '2-digit',
      minute: '2-digit',
    }),
    tickets: event._count.tickets,
    category: event.category?.name || "Sin categoría",
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
      draftEvents={draftEvents}
      totalTicketsSold={totalTicketsSold}
      totalRevenue={revenue}
      recentEventsData={recentEventsData}
      upcomingEventsData={upcomingEventsData}
      userRole={ROLE_LABELS[user.role]}
      firstName={user.firstName}
      email={user.email}
      activePromoCodes={promoCodes}
      pendingCourtesyInvitations={courtesyInvitations}
      averageTicketsPerEvent={averageTicketsPerEvent}
      conversionRate={conversionRate}
    />
  );
}
