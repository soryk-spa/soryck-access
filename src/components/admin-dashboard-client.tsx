"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModernStatCard, StatsGrid } from "@/components/modern-stat-card";
import { Overview } from "@/components/overview";
import { DataTable } from "@/components/data-table";
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
  Bell,
  UserPlus,
  Calendar as CalendarIcon,
} from "lucide-react";

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

  const handleViewEvent = (eventId: string) => {
    router.push(`/events/${eventId}`);
  };

  const handleViewUser = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard de Admin</h1>
          <p className="text-muted-foreground">
            Resumen completo de la plataforma SorykPass
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar Datos
          </Button>
          <Button variant="outline" size="sm">
            <Bell className="mr-2 h-4 w-4" />
            {pendingRequests > 0 && (
              <Badge className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                {pendingRequests}
              </Badge>
            )}
            Notificaciones
          </Button>
          <Button asChild>
            <Link href="/admin/categories">
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Stats */}
      <StatsGrid>
        <ModernStatCard
          title="Total Usuarios"
          value={totalUsers.toLocaleString()}
          icon={Users}
          description="Usuarios registrados"
          trend="+12%"
          trendDirection="up"
          accentColor="blue"
          highlight
        />
        <ModernStatCard
          title="Total Eventos"
          value={totalEvents.toLocaleString()}
          icon={Calendar}
          description="Eventos creados"
          trend="+8%"
          trendDirection="up"
          accentColor="green"
        />
        <ModernStatCard
          title="Órdenes Pagadas"
          value={totalOrders.toLocaleString()}
          icon={Ticket}
          description="Transacciones exitosas"
          trend="+23%"
          trendDirection="up"
          accentColor="purple"
        />
        <ModernStatCard
          title="Ingresos Totales"
          value={`$${(totalRevenue || 0).toLocaleString()}`}
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
            <Tabs defaultValue="ingresos">
              <TabsContent value="ingresos">
                <Overview 
                  data={monthlyStats.map(item => ({ name: item.name, total: item.ingresos }))} 
                  type="area" 
                />
              </TabsContent>
              <TabsContent value="usuarios">
                <Overview 
                  data={monthlyStats.map(item => ({ name: item.name, total: item.usuarios }))} 
                  type="line" 
                />
              </TabsContent>
              <TabsContent value="eventos">
                <Overview 
                  data={monthlyStats.map(item => ({ name: item.name, total: item.eventos }))} 
                  type="bar" 
                />
              </TabsContent>
            </Tabs>
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
  );
}
