"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardPageLayout } from "@/components/dashboard-page-layout";
import { ModernStatCard, StatsGrid } from "@/components/modern-stat-card";
import { Overview } from "@/components/overview";
import { DataTable } from "@/components/data-table";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { formatPrice } from "@/lib/commission";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Calendar,
  Ticket,
  DollarSign,
  Settings,
  BarChart3,
  ChevronRight,
  CheckCircle2,
  UserCheck,
  Building,
  Download,
  UserPlus,
  Calendar as CalendarIcon,
  Loader2,
  Shield,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RecentEvent {
  id: string;
  title: string;
  organizer: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  category: {
    name: string;
  };
  isPublished: boolean;
  _count: {
    tickets: number;
    orders: number;
  };
}

interface RecentUser {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  role: string;
  createdAt: Date;
}

interface MonthlyStats {
  name: string;
  usuarios: number;
  eventos: number;
  ingresos: number;
}

interface AdminDashboardClientProps {
  totalUsers: number;
  totalEvents: number;
  totalOrders: number;
  totalRevenue: number;
  pendingRequests: number;
  recentEvents: RecentEvent[];
  recentUsers: RecentUser[];
  monthlyStats: MonthlyStats[];
}

export function AdminDashboardClient({
  totalUsers,
  totalEvents,
  totalOrders,
  totalRevenue,
  pendingRequests,
  recentEvents,
  recentUsers,
  monthlyStats
}: AdminDashboardClientProps) {
  const router = useRouter();
  const { data: statsData, loading: statsLoading, error: statsError } = useDashboardStats(true);

  const handleViewEvent = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleViewUser = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  // Usar datos reales si están disponibles, sino usar los props como fallback
  const realMonthlyStats = statsData?.monthlyStats || monthlyStats;

  // Configuración del header para DashboardPageLayout
  const headerConfig = {
    title: "Dashboard de Admin",
    description: "Resumen completo de la plataforma SorykPass",
    backgroundIcon: Shield,
    gradient: "from-purple-600 to-pink-600",
    badge: {
      label: "Admin",
      variant: "secondary" as const,
    },
    stats: [
      {
        icon: Users,
        label: "Total Usuarios",
        value: totalUsers,
      },
      {
        icon: Calendar,
        label: "Total Eventos",
        value: totalEvents,
      },
      {
        icon: DollarSign,
        label: "Ingresos",
        value: `$${(totalRevenue / 1000000).toFixed(1)}M`,
      },
      {
        icon: UserCheck,
        label: "Solicitudes",
        value: pendingRequests > 0 ? pendingRequests : "Ninguna",
      },
    ],
    actions: [
      {
        label: "Configuración",
        href: "/admin/categories",
        icon: Settings,
        variant: "default" as const,
      },
      {
        label: "Exportar Datos",
        href: "#",
        icon: Download,
        variant: "outline" as const,
      },
    ],
  };

  return (
    <DashboardPageLayout header={headerConfig}>
      <div className="space-y-6">{/* Alertas si hay solicitudes pendientes */}
      <StatsGrid>
        <ModernStatCard
          title="Total Usuarios"
          value={totalUsers.toString()}
          icon={Users}
          description="Usuarios registrados"
          trend="+12%"
          trendDirection="up"
          accentColor="blue"
          highlight
        />
        <ModernStatCard
          title="Total Eventos"
          value={totalEvents.toString()}
          icon={Calendar}
          description="Eventos creados"
          trend="+8%"
          trendDirection="up"
          accentColor="green"
        />
        <ModernStatCard
          title="Órdenes Pagadas"
          value={totalOrders.toString()}
          icon={Ticket}
          description="Transacciones exitosas"
          trend="+23%"
          trendDirection="up"
          accentColor="purple"
        />
        <ModernStatCard
          title="Ingresos Totales"
          value={formatPrice(totalRevenue || 0)}
          icon={DollarSign}
          description="CLP recaudados"
          trend="+15%"
          trendDirection="up"
          accentColor="green"
          highlight
        />
      </StatsGrid>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Resumen de Plataforma</CardTitle>
                <CardDescription>
                  Métricas principales por mes
                </CardDescription>
              </div>
              <Tabs defaultValue="ingresos" className="w-[300px]">
                <TabsList>
                  <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
                  <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
                  <TabsTrigger value="eventos">Eventos</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="pl-2">
            {statsLoading ? (
              <div className="flex items-center justify-center h-[350px]">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Cargando estadísticas...</span>
              </div>
            ) : statsError ? (
              <div className="flex items-center justify-center h-[350px]">
                <Alert>
                  <AlertDescription>
                    Error al cargar las estadísticas: {statsError}
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <Tabs defaultValue="ingresos">
                <TabsContent value="ingresos">
                  <Overview 
                    data={realMonthlyStats.map(item => ({ name: item.name, total: item.ingresos }))} 
                    type="area" 
                  />
                </TabsContent>
                <TabsContent value="usuarios">
                  <Overview 
                    data={realMonthlyStats.map(item => ({ name: item.name, total: item.usuarios || 0 }))} 
                    type="line" 
                  />
                </TabsContent>
                <TabsContent value="eventos">
                  <Overview 
                    data={realMonthlyStats.map(item => ({ name: item.name, total: item.eventos }))} 
                    type="bar" 
                  />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>
              Últimas acciones en la plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 rounded-lg border p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                  <UserPlus className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Nuevo usuario registrado
                  </p>
                  <p className="text-sm text-muted-foreground">
                    usuario@ejemplo.com se unió a la plataforma
                  </p>
                </div>
                <div className="ml-auto">
                  <Badge variant="outline">Hace 2m</Badge>
                </div>
              </div>
              <div className="flex items-center space-x-4 rounded-lg border p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                  <CalendarIcon className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Evento publicado
                  </p>
                  <p className="text-sm text-muted-foreground">
                    &ldquo;Concierto de Rock&rdquo; fue publicado
                  </p>
                </div>
                <div className="ml-auto">
                  <Badge variant="outline">Hace 5m</Badge>
                </div>
              </div>
              <div className="flex items-center space-x-4 rounded-lg border p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100">
                  <Ticket className="h-4 w-4 text-purple-600" />
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Ticket vendido
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ticket para &ldquo;Festival de Verano&rdquo;
                  </p>
                </div>
                <div className="ml-auto">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Tables */}
      <div className="grid gap-6 md:grid-cols-2">
        <DataTable
          title="Eventos Recientes"
          description="Los últimos eventos creados en la plataforma"
          data={recentEvents.map(event => ({
            id: event.id,
            title: event.title,
            organizer: `${event.organizer.firstName || ""} ${event.organizer.lastName || ""}`.trim() || event.organizer.email,
            category: event.category.name,
            status: event.isPublished ? "Publicado" : "Borrador",
            tickets: event._count.tickets,
            orders: event._count.orders,
          }))}
          columns={[
            { key: "title", label: "Evento", sortable: true },
            { key: "organizer", label: "Organizador" },
            { key: "category", label: "Categoría" },
            { 
              key: "status", 
              label: "Estado",
              render: (value) => (
                <Badge variant={value === "Publicado" ? "default" : "secondary"}>
                  {value}
                </Badge>
              )
            },
            { key: "tickets", label: "Tickets" },
            { key: "orders", label: "Órdenes" },
          ]}
          actions={[
            {
              label: "Ver evento",
              icon: "Eye",
              onClick: (item) => handleViewEvent(item.id)
            }
          ]}
        />

        <DataTable
          title="Usuarios Recientes"
          description="Los últimos usuarios registrados"
          data={recentUsers.map(user => ({
            id: user.id,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Sin nombre",
            email: user.email,
            role: user.role,
            createdAt: new Date(user.createdAt).toLocaleDateString("es-CL"),
          }))}
          columns={[
            { key: "name", label: "Nombre", sortable: true },
            { key: "email", label: "Email" },
            { 
              key: "role", 
              label: "Rol",
              render: (value) => (
                <Badge variant="outline">
                  {value === "ORGANIZER" ? "Organizador" : 
                   value === "ADMIN" ? "Admin" : "Usuario"}
                </Badge>
              )
            },
            { key: "createdAt", label: "Registro", sortable: true },
          ]}
          actions={[
            {
              label: "Ver perfil",
              icon: "UserCheck",
              onClick: (item) => handleViewUser(item.id)
            }
          ]}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="group hover:shadow-md transition-all cursor-pointer">
          <Link href="/admin/role-requests">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <UserCheck className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-semibold">Solicitudes de Rol</h3>
                  <p className="text-sm text-muted-foreground">
                    {pendingRequests} pendientes
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="group hover:shadow-md transition-all cursor-pointer">
          <Link href="/admin/categories">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Building className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="font-semibold">Categorías</h3>
                  <p className="text-sm text-muted-foreground">
                    Gestionar categorías
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="group hover:shadow-md transition-all cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <BarChart3 className="h-8 w-8 text-purple-500" />
              <div>
                <h3 className="font-semibold">Reportes</h3>
                <p className="text-sm text-muted-foreground">
                  Analíticas avanzadas
                </p>
              </div>
              <ChevronRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all cursor-pointer">
          <Link href="/admin/settings">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <Settings className="h-8 w-8 text-orange-500" />
                <div>
                  <h3 className="font-semibold">Configuración</h3>
                  <p className="text-sm text-muted-foreground">
                    Ajustes del sistema
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
      </div>
    </DashboardPageLayout>
  );
}
