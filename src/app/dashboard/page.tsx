import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModernStatCard, StatsGrid } from "@/components/modern-stat-card";
import { Overview } from "@/components/overview";
import { RecentEventsTable } from "@/components/data-table";
import { RoleRequestForm } from "@/components/role-request-form";
import {
  ROLE_LABELS,
  ROLE_COLORS,
  canOrganizeEvents,
  canAccessAdmin,
} from "@/lib/roles";
import {
  Calendar,
  Ticket,
  DollarSign,
  Plus,
  Settings,
  UserCircle,
  Eye,
  Activity,
  ChevronRight,
  CalendarDays,
  TicketCheck,
  Bell,
  BarChart3,
  PieChart,
  Target,
  Layers,
} from "lucide-react";
import Link from "next/link";
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

  // Datos para gráficos (simulados por ahora, puedes reemplazar con datos reales)
  const monthlyData = [
    { name: "Ene", total: 1200000 },
    { name: "Feb", total: 1900000 },
    { name: "Mar", total: 3200000 },
    { name: "Abr", total: 2800000 },
    { name: "May", total: 4100000 },
    { name: "Jun", total: 3600000 },
  ];

  const recentEventsData = recentEvents.map(event => ({
    id: event.id,
    title: event.title,
    organizer: `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email,
    date: new Date(event.startDate).toLocaleDateString("es-CL"),
    status: event.isPublished ? "published" as const : "draft" as const,
    revenue: event._count.orders * 15000, // Simulado
    tickets: event._count.tickets,
  }));

  const canOrganize = canOrganizeEvents(user.role);
  const canAdmin = canAccessAdmin(user.role);

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Bienvenido de vuelta, {user.firstName || user.email}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Bell className="mr-2 h-4 w-4" />
            Notificaciones
          </Button>
          {canOrganize && (
            <Button asChild>
              <Link href="/dashboard/events/create">
                <Plus className="mr-2 h-4 w-4" />
                Crear Evento
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Role Status */}
      <div className="flex items-center gap-4">
        <Badge 
          variant="secondary" 
          className={`${ROLE_COLORS[user.role]} px-3 py-1`}
        >
          {ROLE_LABELS[user.role]}
        </Badge>
        {canAdmin && (
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin">
              <Settings className="mr-2 h-4 w-4" />
              Panel Admin
            </Link>
          </Button>
        )}
      </div>

      {!canOrganize && (
        <Alert>
          <AlertDescription>
            Para crear eventos, necesitas ser aprobado como organizador.
            <RoleRequestForm />
          </AlertDescription>
        </Alert>
      )}

      {canOrganize && (
        <>
          {/* Stats Overview */}
          <StatsGrid>
            <ModernStatCard
              title="Total de Eventos"
              value={totalEvents}
              icon={Calendar}
              description="Eventos creados"
              trend="+12%"
              trendDirection="up"
              accentColor="blue"
              highlight
            />
            <ModernStatCard
              title="Eventos Publicados"
              value={publishedEvents}
              icon={Eye}
              description="Visibles al público"
              trend="+8%"
              trendDirection="up"
              accentColor="green"
            />
            <ModernStatCard
              title="Tickets Vendidos"
              value={totalTicketsSold}
              icon={Ticket}
              description="Total de tickets"
              trend="+23%"
              trendDirection="up"
              accentColor="purple"
            />
            <ModernStatCard
              title="Ingresos Totales"
              value={new Intl.NumberFormat("es-CL", {
                style: "currency",
                currency: "CLP",
              }).format(revenue)}
              icon={DollarSign}
              description="Ingresos generados"
              trend="+15%"
              trendDirection="up"
              accentColor="orange"
            />
          </StatsGrid>

          {/* Charts and Tables */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Resumen de Ingresos</CardTitle>
                    <CardDescription>
                      Ingresos mensuales de tus eventos
                    </CardDescription>
                  </div>
                  <Tabs defaultValue="bar" className="w-[200px]">
                    <TabsList>
                      <TabsTrigger value="bar">Barras</TabsTrigger>
                      <TabsTrigger value="line">Líneas</TabsTrigger>
                      <TabsTrigger value="area">Área</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent className="pl-2">
                <Tabs defaultValue="bar">
                  <TabsContent value="bar">
                    <Overview data={monthlyData} type="bar" />
                  </TabsContent>
                  <TabsContent value="line">
                    <Overview data={monthlyData} type="line" />
                  </TabsContent>
                  <TabsContent value="area">
                    <Overview data={monthlyData} type="area" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Estadísticas Rápidas</CardTitle>
                <CardDescription>
                  Métricas clave de tus eventos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center">
                    <BarChart3 className="h-4 w-4 text-blue-500" />
                    <div className="ml-2 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Conversión
                      </p>
                      <p className="text-sm text-muted-foreground">
                        85% de visitantes compran tickets
                      </p>
                    </div>
                    <div className="ml-auto font-medium">85%</div>
                  </div>
                  <div className="flex items-center">
                    <PieChart className="h-4 w-4 text-green-500" />
                    <div className="ml-2 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Ticket Promedio
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Precio promedio por ticket
                      </p>
                    </div>
                    <div className="ml-auto font-medium">$25.000</div>
                  </div>
                  <div className="flex items-center">
                    <Target className="h-4 w-4 text-purple-500" />
                    <div className="ml-2 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Ocupación
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Promedio de llenado de eventos
                      </p>
                    </div>
                    <div className="ml-auto font-medium">78%</div>
                  </div>
                  <div className="flex items-center">
                    <Layers className="h-4 w-4 text-orange-500" />
                    <div className="ml-2 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        Repetición
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Clientes que regresan
                      </p>
                    </div>
                    <div className="ml-auto font-medium">42%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Events Table */}
          <RecentEventsTable events={recentEventsData} />

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="group hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <CalendarDays className="h-8 w-8 text-blue-500" />
                  <div>
                    <h3 className="font-semibold">Crear Evento</h3>
                    <p className="text-sm text-muted-foreground">
                      Nuevo evento
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <TicketCheck className="h-8 w-8 text-green-500" />
                  <div>
                    <h3 className="font-semibold">Códigos Promo</h3>
                    <p className="text-sm text-muted-foreground">
                      Gestionar promociones
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <Activity className="h-8 w-8 text-purple-500" />
                  <div>
                    <h3 className="font-semibold">Analíticas</h3>
                    <p className="text-sm text-muted-foreground">
                      Ver reportes
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-md transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4">
                  <UserCircle className="h-8 w-8 text-orange-500" />
                  <div>
                    <h3 className="font-semibold">Perfil</h3>
                    <p className="text-sm text-muted-foreground">
                      Configuración
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
