import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  ArrowRight,
  TrendingUp,
  Clock,
  Users,
  Eye,
  Activity,
  ChevronRight,
  CalendarDays,
  TicketCheck,
  Zap,
  Bell,
  Award,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Componente reutilizable para las tarjetas de estadísticas modernas
const ModernStatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendDirection = "up",
  className = "",
  accentColor = "blue",
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  className?: string;
  accentColor?: "blue" | "green" | "purple" | "orange";
}) => {
  const colorVariants = {
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
      icon: "bg-blue-500 text-white",
      accent: "text-blue-600 dark:text-blue-400",
      trend: "text-blue-500",
    },
    green: {
      bg: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
      icon: "bg-green-500 text-white",
      accent: "text-green-600 dark:text-green-400",
      trend: "text-green-500",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
      icon: "bg-purple-500 text-white",
      accent: "text-purple-600 dark:text-purple-400",
      trend: "text-purple-500",
    },
    orange: {
      bg: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900",
      icon: "bg-orange-500 text-white",
      accent: "text-orange-600 dark:text-orange-400",
      trend: "text-orange-500",
    },
  };

  const colors = colorVariants[accentColor];

  return (
    <Card
      className={`group hover:shadow-lg transition-all duration-300 border-0 ${colors.bg} ${className}`}
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

// Componente para eventos recientes mejorado
const RecentEventCard = ({
  event,
  type,
}: {
  event: {
    id: string;
    title: string;
    startDate: Date | string;
    isUsed?: boolean;
    isPublished?: boolean;
    _count?: {
      tickets?: number;
      orders?: number;
    };
  };
  type: "organized" | "attended";
}) => (
  <div className="group p-4 rounded-xl bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          {type === "organized" ? (
            <Calendar className="h-4 w-4 text-blue-500" />
          ) : (
            <Ticket className="h-4 w-4 text-green-500" />
          )}
          <Link
            href={`/events/${event.id}`}
            className="font-semibold text-foreground hover:text-blue-600 transition-colors group-hover:underline line-clamp-1"
          >
            {event.title}
          </Link>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <CalendarDays className="h-3 w-3" />
            {new Date(event.startDate).toLocaleDateString("es-CL", {
              month: "short",
              day: "numeric",
            })}
          </div>
          {type === "organized" && (
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {event._count?.tickets || 0} tickets
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <Badge
          variant={event.isPublished ? "default" : "secondary"}
          className="text-xs"
        >
          {event.isPublished
            ? "Publicado"
            : type === "organized"
              ? "Borrador"
              : event.isUsed
                ? "Usado"
                : "Válido"}
        </Badge>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </div>
  </div>
);

// Componente para acciones rápidas mejoradas
const QuickActionCard = ({
  title,
  description,
  icon: Icon,
  href,
  variant = "default",
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  variant?: "default" | "primary" | "secondary";
}) => {
  const variants = {
    default:
      "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-700",
    primary:
      "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-blue-500",
    secondary:
      "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-purple-500",
  };

  const isColorVariant = variant !== "default";

  return (
    <Card
      className={`group hover:shadow-lg transition-all duration-300 cursor-pointer border ${variants[variant]}`}
    >
      <CardContent className="p-6">
        <Link href={href} className="block">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-xl ${isColorVariant ? "bg-white/20" : "bg-blue-100 dark:bg-blue-900"} group-hover:scale-110 transition-transform duration-200`}
            >
              <Icon
                className={`h-6 w-6 ${isColorVariant ? "text-white" : "text-blue-600 dark:text-blue-400"}`}
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
            <ArrowRight
              className={`h-5 w-5 ${isColorVariant ? "text-white" : "text-muted-foreground"} group-hover:translate-x-1 transition-transform duration-200`}
            />
          </div>
        </Link>
      </CardContent>
    </Card>
  );
};

export default async function DashboardPage() {
  const user = await requireAuth();

  // Fetch de datos optimizado
  const [userStats, recentTickets, userEvents, roleRequests] =
    await Promise.all([
      prisma.order.aggregate({
        where: { userId: user.id, status: "PAID" },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      prisma.ticket.findMany({
        where: { userId: user.id },
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              location: true,
              isPublished: true,
            },
          },
        },
      }),
      canOrganizeEvents(user.role)
        ? prisma.event.findMany({
            where: { organizerId: user.id },
            take: 3,
            orderBy: { createdAt: "desc" },
            include: {
              _count: {
                select: {
                  tickets: true,
                  orders: true,
                },
              },
            },
          })
        : Promise.resolve([]),
      prisma.roleRequest.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 2,
      }),
    ]);

  const organizerStats = canOrganizeEvents(user.role)
    ? await prisma.event.aggregate({
        where: { organizerId: user.id },
        _count: { id: true },
        _sum: {
          totalRevenue: true,
        },
      })
    : null;

  const ticketsCount = await prisma.ticket.count({
    where: { userId: user.id },
  });

  const activeTickets = await prisma.ticket.count({
    where: { userId: user.id, status: "ACTIVE", isUsed: false },
  });

  const userName = user.firstName || user.email.split("@")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section Moderno */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-purple-600/90"></div>
          <div className="absolute top-4 right-4 opacity-20">
            <Activity className="h-32 w-32" />
          </div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                  ¡Hola {userName}! 👋
                </h1>
                <p className="text-blue-100 text-lg mb-4">
                  Bienvenido de vuelta a tu panel de control
                </p>
                <div className="flex items-center gap-2">
                  <Badge
                    className={`${ROLE_COLORS[user.role]} border-0 text-sm px-4 py-1.5`}
                  >
                    <Award className="h-4 w-4 mr-1" />
                    {ROLE_LABELS[user.role]}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-blue-100 text-sm">
                  {new Date().toLocaleDateString("es-CL", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                <div className="flex items-center gap-1 text-blue-200 text-sm mt-1">
                  <Clock className="h-4 w-4" />
                  {new Date().toLocaleTimeString("es-CL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernStatCard
            title="Mis Tickets"
            value={ticketsCount}
            icon={Ticket}
            description="Total de entradas adquiridas"
            trend={`${activeTickets} activos`}
            accentColor="blue"
          />
          <ModernStatCard
            title="Órdenes"
            value={userStats._count.id}
            icon={TicketCheck}
            description="Compras completadas"
            trend="Todas exitosas"
            accentColor="green"
          />
          {canOrganizeEvents(user.role) && (
            <>
              <ModernStatCard
                title="Eventos Creados"
                value={organizerStats?._count.id || 0}
                icon={Calendar}
                description="Eventos organizados"
                trend="Crecimiento constante"
                accentColor="purple"
              />
              <ModernStatCard
                title="Ingresos"
                value={`$${(organizerStats?._sum.totalRevenue || 0).toLocaleString("es-CL")}`}
                icon={DollarSign}
                description="Ingresos generados"
                trend="+12% este mes"
                accentColor="orange"
              />
              <QuickActionCard
                title="Códigos Promocionales"
                description="Crear descuentos y ofertas"
                icon={Tag}
                href="/dashboard/promo-codes"
              />
            </>
          )}
        </div>

        {/* Notificaciones importantes */}
        {user.role === "CLIENT" && (
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <Zap className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>¿Quieres organizar eventos?</strong> Solicita permisos de
              organizador y empieza a crear experiencias increíbles.
            </AlertDescription>
          </Alert>
        )}

        {/* Contenido Principal */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Columna Principal */}
          <div className="xl:col-span-2 space-y-8">
            {/* Eventos del Organizador */}
            {canOrganizeEvents(user.role) && (
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-xl">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        Mis Eventos Recientes
                      </CardTitle>
                      <CardDescription>
                        Gestiona y monitorea tus eventos más recientes
                      </CardDescription>
                    </div>
                    <Button asChild size="sm">
                      <Link href="/dashboard/events">
                        Ver todos
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {userEvents.map((event) => (
                    <RecentEventCard
                      key={event.id}
                      event={event}
                      type="organized"
                    />
                  ))}
                  {userEvents.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p className="font-medium">
                        Aún no has creado ningún evento
                      </p>
                      <p className="text-sm">
                        ¡Empieza creando tu primer evento!
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Tickets Recientes */}
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Ticket className="h-5 w-5 text-green-600" />
                      Mis Tickets Recientes
                    </CardTitle>
                    <CardDescription>
                      Tus últimas entradas y eventos
                    </CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/tickets">
                      Ver todos
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentTickets.map((ticket) => (
                  <RecentEventCard
                    key={ticket.id}
                    event={{
                      id: ticket.event.id,
                      title: ticket.event.title,
                      startDate: ticket.event.startDate,
                      isUsed: ticket.isUsed,
                      isPublished: ticket.event.isPublished,
                    }}
                    type="attended"
                  />
                ))}
                {recentTickets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Ticket className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="font-medium">
                      No has comprado tickets recientemente
                    </p>
                    <p className="text-sm">
                      Explora eventos increíbles y compra tus entradas
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Barra Lateral */}
          <div className="space-y-6">
            {/* Acciones Rápidas */}
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Acciones Rápidas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <QuickActionCard
                  title="Explorar Eventos"
                  description="Descubre eventos increíbles"
                  icon={Eye}
                  href="/events"
                  variant="primary"
                />

                {canOrganizeEvents(user.role) && (
                  <QuickActionCard
                    title="Crear Evento"
                    description="Organiza tu próximo evento"
                    icon={Plus}
                    href="/events/create"
                    variant="secondary"
                  />
                )}

                <QuickActionCard
                  title="Mis Eventos"
                  description="Ver mi historial"
                  icon={CalendarDays}
                  href="/dashboard/events"
                />

                {canAccessAdmin(user.role) && (
                  <QuickActionCard
                    title="Panel de Admin"
                    description="Gestión avanzada"
                    icon={Settings}
                    href="/admin"
                  />
                )}

                {canOrganizeEvents(user.role) && (
                  <QuickActionCard
                    title="Mi Perfil"
                    description="Configurar perfil público"
                    icon={UserCircle}
                    href="/dashboard/organizer-profile"
                  />
                )}
              </CardContent>
            </Card>

            {/* Formulario de Solicitud de Rol */}
            {user.role === "CLIENT" && (
              <div className="space-y-4">
                <RoleRequestForm />
              </div>
            )}

            {/* Solicitudes de Rol */}
            {roleRequests.length > 0 && (
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-blue-500" />
                    Mis Solicitudes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {roleRequests.map((req) => (
                    <div
                      key={req.id}
                      className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-700/50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-sm">
                            Rol:{" "}
                            <span className="text-blue-600">
                              {ROLE_LABELS[req.requestedRole]}
                            </span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(req.createdAt).toLocaleDateString(
                              "es-CL"
                            )}
                          </p>
                        </div>
                        <Badge
                          variant={
                            req.status === "APPROVED"
                              ? "default"
                              : req.status === "REJECTED"
                                ? "destructive"
                                : "secondary"
                          }
                          className="text-xs"
                        >
                          {req.status === "APPROVED"
                            ? "Aprobado"
                            : req.status === "REJECTED"
                              ? "Rechazado"
                              : "Pendiente"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {req.message}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
