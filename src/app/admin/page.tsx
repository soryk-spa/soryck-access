import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RoleManagement } from "@/components/role-management";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import {
  Users,
  Calendar,
  Ticket,
  DollarSign,
  TrendingUp,
  Activity,
  Shield,
  Settings,
  BarChart3,
  Star,
  Zap,
  Award,
  ChevronRight,
  Eye,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  Building,
  Globe,
  Mail,
  RefreshCw,
  Sparkles,
  Target,
  Layers,
  PieChart,
  LineChart,
  Calendar as CalendarIcon,
  Filter,
  Download,
  Bell,
  Info,
} from "lucide-react";

type EventWithDetails = {
  id: string;
  title: string;
  startDate: Date;
  location: string;
  isPublished: boolean;
  createdAt: Date;
  organizer: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  category: {
    name: string;
  };
  _count: {
    tickets: number;
    orders: number;
  };
  totalRevenue?: number;
};

const ModernStatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendDirection = "up",
  className = "",
  accentColor = "blue",
  highlight = false,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  className?: string;
  accentColor?: "blue" | "green" | "purple" | "orange" | "red";
  highlight?: boolean;
}) => {
  const colorVariants = {
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
      icon: "bg-blue-500 text-white",
      accent: "text-blue-600 dark:text-blue-400",
      trend: "text-blue-500",
      ring: "ring-blue-500",
    },
    green: {
      bg: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
      icon: "bg-green-500 text-white",
      accent: "text-green-600 dark:text-green-400",
      trend: "text-green-500",
      ring: "ring-green-500",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
      icon: "bg-purple-500 text-white",
      accent: "text-purple-600 dark:text-purple-400",
      trend: "text-purple-500",
      ring: "ring-purple-500",
    },
    orange: {
      bg: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900",
      icon: "bg-orange-500 text-white",
      accent: "text-orange-600 dark:text-orange-400",
      trend: "text-orange-500",
      ring: "ring-orange-500",
    },
    red: {
      bg: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900",
      icon: "bg-red-500 text-white",
      accent: "text-red-600 dark:text-red-400",
      trend: "text-red-500",
      ring: "ring-red-500",
    },
  };

  const colors = colorVariants[accentColor];

  return (
    <Card
      className={`group hover:shadow-xl transition-all duration-300 border-0 ${colors.bg} ${highlight ? `ring-2 ${colors.ring} ring-offset-2` : ""} ${className}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-2.5 rounded-xl ${colors.icon} shadow-sm group-hover:scale-110 transition-transform duration-200`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {title}
                </p>
                <p className={`text-2xl font-bold ${colors.accent}`}>{value}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{description}</p>
            {trend && (
              <div
                className={`flex items-center gap-1 text-xs font-medium ${colors.trend}`}
              >
                <TrendingUp
                  className={`h-3 w-3 ${trendDirection === "down" ? "rotate-180" : ""}`}
                />
                {trend}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AdminActionCard = ({
  title,
  description,
  icon: Icon,
  href,
  variant = "default",
  badge,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  variant?: "default" | "primary" | "secondary" | "success";
  badge?: string;
}) => {
  const variants = {
    default:
      "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700",
    primary:
      "bg-gradient-to-r from-[#0053CC] to-[#01CBFE] hover:from-[#0053CC]/90 hover:to-[#01CBFE]/90 text-white border-blue-500",
    secondary:
      "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-purple-500",
    success:
      "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white border-green-500",
  };

  const isColorVariant = variant !== "default";

  return (
    <Card
      className={`group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 relative ${variants[variant]}`}
    >
      {badge && (
        <Badge
          variant="destructive"
          className="absolute -top-2 -right-2 z-10 text-xs"
        >
          {badge}
        </Badge>
      )}
      <CardContent className="p-6">
        <Link href={href} className="block">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-xl ${isColorVariant ? "bg-white/20" : "bg-[#0053CC]/10 dark:bg-[#0053CC]/20"} group-hover:scale-110 transition-transform duration-200`}
            >
              <Icon
                className={`h-6 w-6 ${isColorVariant ? "text-white" : "text-[#0053CC] dark:text-[#01CBFE]"}`}
              />
            </div>
            <div className="flex-1">
              <h3
                className={`font-semibold mb-1 ${isColorVariant ? "text-white" : "text-foreground"}`}
              >
                {title}
              </h3>
              <p
                className={`text-sm ${isColorVariant ? "text-white/80" : "text-muted-foreground"}`}
              >
                {description}
              </p>
            </div>
            <ChevronRight
              className={`h-5 w-5 ${isColorVariant ? "text-white" : "text-muted-foreground"} group-hover:translate-x-1 transition-transform duration-200`}
            />
          </div>
        </Link>
      </CardContent>
    </Card>
  );
};

export default async function AdminPage() {
  const currentUser = await requireAdmin();
  const [
    totalUsers,
    totalEvents,
    totalTickets,
    totalRevenue,
    users,
    usersByRole,
    recentEvents,
    systemStats,
    adminActivity,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.ticket.count(),
    prisma.order.aggregate({
      where: { status: "PAID" },
      _sum: { totalAmount: true },
    }),
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
      orderBy: [{ role: "desc" }, { createdAt: "desc" }],
    }),
    prisma.user.groupBy({
      by: ["role"],
      _count: { role: true },
    }),
    prisma.event.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      include: {
        organizer: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            tickets: true,
            orders: true,
          },
        },
      },
    }),
    // Estadísticas del sistema
    Promise.all([
      prisma.event.count({ where: { isPublished: true } }),
      prisma.event.count({ where: { isPublished: false } }),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.ticket.count({ where: { isUsed: true } }),
      prisma.roleRequest.count({ where: { status: "PENDING" } }),
    ]),
    // Actividad administrativa reciente
    prisma.roleRequest.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    }),
  ]);

  const [
    publishedEvents,
    draftEvents,
    paidOrders,
    pendingOrders,
    usedTickets,
    pendingRoleRequests,
  ] = systemStats;

  const roleStats = usersByRole.reduce(
    (acc, item) => {
      acc[item.role] = item._count.role;
      return acc;
    },
    {} as Record<string, number>
  );

  const revenue = totalRevenue._sum.totalAmount || 0;
  const conversionRate = totalEvents > 0 ? (paidOrders / totalEvents) * 100 : 0;
  const ticketUtilization =
    totalTickets > 0 ? (usedTickets / totalTickets) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-blue-600 to-purple-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-blue-600/90"></div>
          <div className="absolute top-4 right-4 opacity-20">
            <Shield className="h-32 w-32" />
          </div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <Shield className="h-8 w-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl font-bold">
                      Panel de Administración
                    </h1>
                    <p className="text-purple-100 text-lg">
                      Bienvenido,{" "}
                      {currentUser.firstName || currentUser.email.split("@")[0]}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-purple-100 text-sm">
                  <div className="flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    Sistema operativo
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    {totalUsers} usuarios activos
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {publishedEvents} eventos publicados
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-purple-100 text-sm">
                  {new Date().toLocaleDateString("es-CL", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Alertas importantes */}
        {pendingRoleRequests > 0 && (
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <Bell className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Atención:</strong> Tienes {pendingRoleRequests} solicitud
              {pendingRoleRequests > 1 ? "es" : ""} de cambio de rol pendiente
              {pendingRoleRequests > 1 ? "s" : ""} por revisar.
            </AlertDescription>
          </Alert>
        )}

        {/* Estadísticas Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <ModernStatCard
            title="Total Usuarios"
            value={totalUsers}
            icon={Users}
            description="Usuarios registrados en la plataforma"
            trend={`${roleStats.ADMIN || 0} admins`}
            accentColor="blue"
            highlight={true}
          />
          <ModernStatCard
            title="Eventos Totales"
            value={totalEvents}
            icon={Calendar}
            description="Eventos creados en el sistema"
            trend={`${publishedEvents} publicados`}
            accentColor="green"
          />
          <ModernStatCard
            title="Tickets Vendidos"
            value={totalTickets}
            icon={Ticket}
            description="Total de entradas emitidas"
            trend={`${usedTickets} usados`}
            accentColor="purple"
          />
          <ModernStatCard
            title="Ingresos Totales"
            value={`$${revenue.toLocaleString("es-CL")}`}
            icon={DollarSign}
            description="Ingresos generados"
            trend={`${paidOrders} órdenes pagadas`}
            accentColor="orange"
          />
          <ModernStatCard
            title="Tasa Conversión"
            value={`${conversionRate.toFixed(1)}%`}
            icon={Target}
            description="Eventos con ventas"
            trend={ticketUtilization > 50 ? "Excelente" : "En crecimiento"}
            accentColor="red"
          />
        </div>

        {/* Métricas del Sistema */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#0053CC]" />
                Estado del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">
                    Eventos Publicados
                  </span>
                </div>
                <Badge variant="secondary">{publishedEvents}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium">Eventos Borrador</span>
                </div>
                <Badge variant="outline">{draftEvents}</Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">
                    Órdenes Pendientes
                  </span>
                </div>
                <Badge variant="outline">{pendingOrders}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-[#0053CC]" />
                Distribución de Roles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(roleStats).map(([role, count]) => (
                <div key={role} className="flex justify-between items-center">
                  <span className="text-sm">{role}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-[#0053CC] h-2 rounded-full"
                        style={{ width: `${(count / totalUsers) * 100}%` }}
                      />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#0053CC]" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {adminActivity.slice(0, 4).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-[#0053CC]/10 rounded-full flex items-center justify-center">
                    <Mail className="h-4 w-4 text-[#0053CC]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {request.user.firstName || request.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Solicita ser {request.requestedRole}
                    </p>
                  </div>
                  <Badge
                    variant={
                      request.status === "PENDING" ? "default" : "secondary"
                    }
                    className="text-xs"
                  >
                    {request.status}
                  </Badge>
                </div>
              ))}
              {adminActivity.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay actividad reciente
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gestión de Usuarios */}
        <div className="mb-8">
          <RoleManagement users={users} currentUserRole={currentUser.role} />
        </div>

        {/* Acciones Rápidas de Administración */}
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#0053CC]" />
              Herramientas de Administración
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <AdminActionCard
                title="Solicitudes de Rol"
                description="Revisar y gestionar cambios de rol de usuarios"
                icon={UserCheck}
                href="/admin/role-requests"
                variant="primary"
                badge={
                  pendingRoleRequests > 0
                    ? pendingRoleRequests.toString()
                    : undefined
                }
              />
              <AdminActionCard
                title="Gestionar Categorías"
                description="Crear, editar y organizar categorías de eventos"
                icon={Layers}
                href="/admin/categories"
                variant="secondary"
              />
              <AdminActionCard
                title="Estadísticas Financieras"
                description="Ver reportes detallados de ingresos y comisiones"
                icon={PieChart}
                href="/admin/commission-stats"
                variant="success"
              />
              <AdminActionCard
                title="Sincronizar Usuarios"
                description="Actualizar datos de usuarios desde Clerk"
                icon={RefreshCw}
                href="/admin/sync-users"
              />
              <AdminActionCard
                title="Gestionar Eventos"
                description="Supervisar y moderar todos los eventos"
                icon={Calendar}
                href="/admin/events"
              />
              <AdminActionCard
                title="Configuración Sistema"
                description="Ajustes generales de la plataforma"
                icon={Settings}
                href="/admin/settings"
              />
            </div>
          </CardContent>
        </Card>

        {/* Eventos Recientes */}
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-[#0053CC]" />
                Eventos Recientes
              </CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(recentEvents as EventWithDetails[]).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#0053CC] to-[#01CBFE] rounded-xl flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">
                          {event.title}
                        </h3>
                        <Badge
                          variant={event.isPublished ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {event.isPublished ? "Publicado" : "Borrador"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>📍 {event.location}</span>
                        <span>
                          👤{" "}
                          {event.organizer.firstName || event.organizer.email}
                        </span>
                        <span>🏷️ {event.category.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-right">
                    <div>
                      <div className="text-sm font-medium">
                        {event._count.tickets} tickets
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {event._count.orders} órdenes
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(event.startDate).toLocaleDateString("es-CL")}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(event.createdAt).toLocaleDateString("es-CL")}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/events/${event.id}`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}

              {recentEvents.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">No hay eventos creados aún</p>
                  <p className="text-sm">
                    Los eventos aparecerán aquí cuando se creen
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Métricas Avanzadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="h-5 w-5 text-[#0053CC]" />
                Rendimiento del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Tasa de Conversión
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {conversionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(conversionRate, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Utilización de Tickets
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {ticketUtilization.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(ticketUtilization, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    Eventos Publicados
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {totalEvents > 0
                      ? ((publishedEvents / totalEvents) * 100).toFixed(1)
                      : 0}
                    %
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${totalEvents > 0 ? Math.min((publishedEvents / totalEvents) * 100, 100) : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      ${(revenue / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Ingresos (CLP)
                    </div>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {paidOrders > 0
                        ? (revenue / paidOrders).toLocaleString("es-CL", {
                            maximumFractionDigits: 0,
                          })
                        : "0"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Ticket Promedio
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-[#0053CC]" />
                Resumen Ejecutivo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                      Organizadores
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {roleStats.ORGANIZER || 0}
                  </div>
                  <div className="text-xs text-blue-600/80 dark:text-blue-400/80">
                    +{roleStats.ADMIN || 0} admins
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400">
                      Clientes
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {roleStats.CLIENT || 0}
                  </div>
                  <div className="text-xs text-green-600/80 dark:text-green-400/80">
                    Base activa
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">
                      Acciones Pendientes
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-yellow-100 dark:bg-yellow-900"
                  >
                    {pendingRoleRequests + pendingOrders}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">
                      Eventos de Calidad
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-purple-100 dark:bg-purple-900"
                  >
                    {Math.round(
                      (publishedEvents / Math.max(totalEvents, 1)) * 100
                    )}
                    %
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-medium">Engagement</span>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-orange-100 dark:bg-orange-900"
                  >
                    {ticketUtilization.toFixed(0)}%
                  </Badge>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Estado General</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Sistema Saludable
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Información del sistema */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#0053CC] rounded-xl">
                <Info className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#0053CC] dark:text-[#01CBFE] mb-2">
                  Estado del Sistema SorykPass
                </h3>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Versión:</p>
                    <p className="font-medium">1.0.0 Beta</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">
                      Última actualización:
                    </p>
                    <p className="font-medium">
                      {new Date().toLocaleDateString("es-CL")}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tiempo activo:</p>
                    <p className="font-medium">99.9% uptime</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Estado:</p>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="font-medium text-green-600 dark:text-green-400">
                        Operativo
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/20">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      🔒 Seguridad: Activa
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      💾 Backup: {new Date().toLocaleDateString("es-CL")}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      🌐 CDN: Optimizado
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      📊 Analytics: Funcionando
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
