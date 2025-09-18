"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ModernStatCard, StatsGrid } from "@/components/modern-stat-card";
import { Overview } from "@/components/overview";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import {
  Calendar,
  Ticket,
  DollarSign,
  Plus,
  Settings,
  UserCircle,
  CalendarDays,
  Target,
  Loader2,
  Users,
  Gift,
  BarChart3,
  FileText,
  QrCode,
  Edit,
  Eye,
  TrendingUp,
  Clock,
  Activity,
  Building
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserDashboardClientProps {
  totalEvents: number;
  publishedEvents: number;
  draftEvents: number;
  totalRevenue: number;
  totalTicketsSold: number;
  averageTicketsPerEvent: number;
  conversionRate: number;
  upcomingEventsData: {
    id: string;
    title: string;
    date: string;
    time: string;
    tickets: number;
    category: string;
  }[];
  recentEventsData: {
    id: string;
    title: string;
    date: string;
    tickets: number;
    courtesyInvitations: number;
    revenue: number;
    status: "published" | "draft";
    category: string;
  }[];
  userRole: string;
  firstName?: string | null;
  email: string;
  activePromoCodes: number;
  pendingCourtesyInvitations: number;
}

// Componente para acciones rápidas
const QuickActionCard = ({ 
  icon: Icon, 
  title, 
  description, 
  href, 
  color = "blue",
  badge
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  color?: "blue" | "green" | "purple" | "orange" | "red";
  badge?: string;
}) => {
  const colorClasses = {
    blue: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200 text-blue-700 shadow-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20 dark:border-blue-800 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 dark:text-blue-300 dark:shadow-blue-900/20",
    green: "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:from-emerald-100 hover:to-emerald-200 text-emerald-700 shadow-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/20 dark:border-emerald-800 dark:hover:from-emerald-900/30 dark:hover:to-emerald-800/30 dark:text-emerald-300 dark:shadow-emerald-900/20",
    purple: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200 text-purple-700 shadow-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20 dark:border-purple-800 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30 dark:text-purple-300 dark:shadow-purple-900/20",
    orange: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-200 text-orange-700 shadow-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/20 dark:border-orange-800 dark:hover:from-orange-900/30 dark:hover:to-orange-800/30 dark:text-orange-300 dark:shadow-orange-900/20",
    red: "bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:from-red-100 hover:to-red-200 text-red-700 shadow-red-100/50 dark:from-red-950/20 dark:to-red-900/20 dark:border-red-800 dark:hover:from-red-900/30 dark:hover:to-red-800/30 dark:text-red-300 dark:shadow-red-900/20"
  };

  return (
    <Link href={href}>
      <Card className={`group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer border-2 ${colorClasses[color]}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className="p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 shadow-sm border border-gray-200/50 dark:border-gray-700/50">
                <Icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm group-hover:text-current transition-colors">{title}</h3>
                <p className="text-xs opacity-70 mt-1 group-hover:opacity-80 transition-opacity">{description}</p>
              </div>
            </div>
            {badge && (
              <Badge variant="secondary" className="text-xs bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50">
                {badge}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

// Componente para métricas destacadas
const HighlightMetric = ({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  color = "blue" 
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  trend?: string;
  color?: "blue" | "green" | "purple" | "orange";
}) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/50",
    green: "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-950/50",
    purple: "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-950/50",
    orange: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/50"
  };

  return (
    <div className="text-center p-4">
      <div className={`w-12 h-12 rounded-full ${colorClasses[color]} flex items-center justify-center mx-auto mb-2 border border-gray-200 dark:border-gray-700`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</div>
      <div className="text-sm text-gray-600 dark:text-gray-400">{label}</div>
      {trend && (
        <div className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center justify-center">
          <TrendingUp className="h-3 w-3 mr-1" />
          {trend}
        </div>
      )}
    </div>
  );
};

export function EnhancedDashboard(props: UserDashboardClientProps) {
  const { data: stats, loading } = useDashboardStats();

  const {
    totalEvents,
    publishedEvents,
    draftEvents,
    totalRevenue,
    totalTicketsSold,
    averageTicketsPerEvent,
    conversionRate,
    upcomingEventsData,
    recentEventsData,
    userRole,
    firstName,
    activePromoCodes,
    pendingCourtesyInvitations,
  } = props;

  return (
    <div className="space-y-8">
      {/* Header con saludo personalizado */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              ¡Hola, {firstName || "Organizador"}! 👋
            </h1>
            <p className="text-blue-100 mt-2">
              Bienvenido a tu panel de control. Gestiona tus eventos y haz crecer tu audiencia.
            </p>
          </div>
          <div className="hidden md:block">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {userRole}
            </Badge>
          </div>
        </div>
      </div>

      {/* Métricas destacadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Resumen de Actividad</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <HighlightMetric
              icon={Calendar}
              label="Eventos Totales"
              value={totalEvents}
              trend="+12% este mes"
              color="blue"
            />
            <HighlightMetric
              icon={Ticket}
              label="Tickets Vendidos"
              value={totalTicketsSold}
              trend="+8% vs anterior"
              color="green"
            />
            <HighlightMetric
              icon={DollarSign}
              label="Ingresos"
              value={`$${totalRevenue.toLocaleString()}`}
              trend="+15% este mes"
              color="purple"
            />
            <HighlightMetric
              icon={Users}
              label="Invitaciones"
              value={pendingCourtesyInvitations}
              color="orange"
            />
          </div>
        </CardContent>
      </Card>

      {/* Navegación tradicional */}
      <div className="space-y-8">
        {/* Gestión de Eventos */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Gestión de Eventos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickActionCard
              icon={Plus}
              title="Crear Evento"
              description="Nuevo evento desde cero"
              href="/dashboard/events/new"
              color="blue"
            />
            <QuickActionCard
              icon={Edit}
              title="Mis Eventos"
              description="Editar eventos existentes"
              href="/dashboard/events"
              color="green"
              badge={`${draftEvents} borradores`}
            />
            <QuickActionCard
              icon={Eye}
              title="Eventos Públicos"
              description="Ver eventos publicados"
              href="/events"
              color="purple"
              badge={`${publishedEvents} activos`}
            />
            <QuickActionCard
              icon={BarChart3}
              title="Estadísticas"
              description="Métricas y análisis"
              href="/dashboard/events"
              color="orange"
            />
          </div>
        </div>

        {/* Ventas y Marketing */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Ventas y Marketing</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickActionCard
              icon={Gift}
              title="Códigos Promocionales"
              description="Gestionar descuentos"
              href="/dashboard/promo-codes"
              color="green"
              badge={`${activePromoCodes} activos`}
            />
            <QuickActionCard
              icon={Plus}
              title="Crear Código Promo"
              description="Nuevo código de descuento"
              href="/dashboard/promo-codes/create"
              color="blue"
            />
            <QuickActionCard
              icon={Ticket}
              title="Mis Tickets"
              description="Ver tickets vendidos"
              href="/dashboard/tickets"
              color="purple"
            />
            <QuickActionCard
              icon={QrCode}
              title="Escáner de Tickets"
              description="Validar entradas"
              href="/dashboard/organizer/scanners"
              color="orange"
            />
          </div>
        </div>

        {/* Herramientas */}
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Herramientas</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <QuickActionCard
              icon={UserCircle}
              title="Mi Perfil"
              description="Configurar perfil público"
              href="/dashboard/organizer-profile"
              color="green"
            />
            <QuickActionCard
              icon={Building}
              title="Mis Venues"
              description="Gestionar lugares"
              href="/dashboard/organizer/venues"
              color="blue"
            />
            <QuickActionCard
              icon={Settings}
              title="Configuración"
              description="Ajustes de cuenta"
              href="/dashboard/settings"
              color="purple"
            />
            <QuickActionCard
              icon={FileText}
              title="Ayuda"
              description="Centro de ayuda"
              href="/help"
              color="orange"
            />
          </div>
        </div>
      </div>

      {/* Contenido con pestañas */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="events">Próximos Eventos</TabsTrigger>
          <TabsTrigger value="recent">Actividad Reciente</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Estadísticas principales */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas Principales</CardTitle>
              </CardHeader>
              <CardContent>
                <StatsGrid>
                  <ModernStatCard
                    title="Eventos Publicados"
                    value={publishedEvents}
                    icon={Calendar}
                    description={`${conversionRate}% de tus eventos están publicados`}
                    trend="+12% este mes"
                  />
                  <ModernStatCard
                    title="Tickets Promedio"
                    value={averageTicketsPerEvent}
                    icon={Ticket}
                    description="Por evento organizado"
                    trend="+8% vs anterior"
                  />
                  <ModernStatCard
                    title="Tasa de Conversión"
                    value={`${conversionRate}%`}
                    icon={Target}
                    description="Eventos publicados vs borradores"
                    trend="+5% este mes"
                  />
                  <ModernStatCard
                    title="Códigos Activos"
                    value={activePromoCodes}
                    icon={Gift}
                    description="Promociones disponibles"
                  />
                </StatsGrid>
              </CardContent>
            </Card>

            {/* Gráfico de ingresos */}
            <Card>
              <CardHeader>
                <CardTitle>Tendencia de Ingresos</CardTitle>
                <CardDescription>
                  Ingresos de los últimos 6 meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-48">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <Overview data={stats?.monthlyStats.map(stat => ({ 
                    name: stat.name, 
                    total: stat.ingresos 
                  })) || []} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Próximos Eventos</CardTitle>
                <CardDescription>
                  Eventos programados para las próximas semanas
                </CardDescription>
              </div>
              <Button asChild>
                <Link href="/organizer/events/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Evento
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {upcomingEventsData.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarDays className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay eventos próximos
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Crea tu primer evento para comenzar a vender tickets
                  </p>
                  <Button asChild>
                    <Link href="/organizer/events/create">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Evento
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingEventsData.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{event.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {event.date} - {event.time}
                            </span>
                            <span className="flex items-center">
                              <Ticket className="h-4 w-4 mr-1" />
                              {event.tickets} tickets
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{event.category}</Badge>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/organizer/events/${event.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
              <CardDescription>
                Últimos eventos y acciones realizadas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {recentEventsData.length === 0 ? (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay actividad reciente
                  </h3>
                  <p className="text-gray-600">
                    La actividad de tus eventos aparecerá aquí
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentEventsData.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-gray-50 rounded-lg">
                          <Calendar className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{event.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>{event.date}</span>
                            <span>{event.tickets} tickets</span>
                            <span>{event.courtesyInvitations} invitaciones</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={event.status === "published" ? "default" : "secondary"}
                        >
                          {event.status === "published" ? "Publicado" : "Borrador"}
                        </Badge>
                        <span className="text-sm font-semibold">
                          ${event.revenue.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Rendimiento de Eventos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Eventos Publicados</span>
                    <span className="font-semibold">{publishedEvents}/{totalEvents}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${conversionRate}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Promedio de Tickets</span>
                    <span className="font-semibold">{averageTicketsPerEvent}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Ingresos Totales</span>
                    <span className="font-semibold">${totalRevenue.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Acciones Recomendadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {draftEvents > 0 && (
                  <Alert>
                    <AlertDescription>
                      Tienes {draftEvents} eventos en borrador. 
                      <Link href="/organizer/events" className="font-semibold text-blue-600 ml-1">
                        Publícalos ahora
                      </Link>
                    </AlertDescription>
                  </Alert>
                )}
                
                {activePromoCodes === 0 && (
                  <Alert>
                    <AlertDescription>
                      Crea códigos promocionales para aumentar las ventas.
                      <Link href="/organizer/promo-codes" className="font-semibold text-blue-600 ml-1">
                        Crear códigos
                      </Link>
                    </AlertDescription>
                  </Alert>
                )}

                {totalEvents === 0 && (
                  <Alert>
                    <AlertDescription>
                      ¡Comienza creando tu primer evento!
                      <Link href="/organizer/events/create" className="font-semibold text-blue-600 ml-1">
                        Crear evento
                      </Link>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
