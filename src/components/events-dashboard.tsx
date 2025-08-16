"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Plus,
  Eye,
  TrendingUp,
  Settings,
  BarChart3,
  Target,
  Activity,
  Filter,
  Search,
  Grid3X3,
  List,
  ChevronRight,
  Star,
  Zap,
  Award,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/date-utils";

interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string;
  startDate: string;
  endDate: string | null;
  price: number;
  capacity: number;
  isFree: boolean;
  isPublished: boolean;
  imageUrl: string | null;
  category: {
    id: string;
    name: string;
  };
  organizer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  _count: {
    tickets: number;
    orders: number;
  };
}

interface EventsDashboardProps {
  initialEvents: Event[];
  organizerName: string;
}

// Componente para tarjetas de estadísticas modernas
const ModernStatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendDirection = "up",
  accentColor = "blue",
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
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
      className={`group hover:shadow-lg transition-all duration-300 border-0 ${colors.bg}`}
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

// Componente para tarjeta de evento moderna
const ModernEventCard = ({ event }: { event: Event }) => {
  const getEventStatus = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);

    if (startDate < now) {
      return {
        label: "Finalizado",
        variant: "secondary" as const,
        color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
      };
    }
    if (event.isPublished) {
      return {
        label: "Publicado",
        variant: "default" as const,
        color:
          "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      };
    }
    return {
      label: "Borrador",
      variant: "secondary" as const,
      color:
        "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    };
  };

  const status = getEventStatus(event);
  const ticketsSold = event._count.tickets;
  const occupancy = Math.round((ticketsSold / event.capacity) * 100);
  const isHighDemand = occupancy > 80;
  const revenue = ticketsSold * event.price;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800 hover:scale-[1.02] cursor-pointer overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold line-clamp-1">
                    {event.title}
                  </h3>
                  {isHighDemand && (
                    <div className="flex items-center gap-1 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      <Zap className="h-3 w-3" />
                      Hot
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-blue-100 text-sm">
                  <Badge className={status.color} variant="secondary">
                    {status.label}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-blue-200 text-blue-100 bg-blue-500/20"
                  >
                    {event.category.name}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <ChevronRight className="h-5 w-5 text-blue-200 group-hover:text-white group-hover:translate-x-1 transition-all duration-200" />
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="p-6 space-y-6">
            {/* Información del evento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {formatDate(event.startDate)}
                    </p>
                    <p className="text-muted-foreground">
                      {formatTime(event.startDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground line-clamp-1">
                      {event.location}
                    </p>
                    <p className="text-muted-foreground">
                      Ubicación del evento
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {ticketsSold}/{event.capacity} tickets
                    </p>
                    <p className="text-muted-foreground">
                      {occupancy}% ocupación
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <DollarSign className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      ${revenue.toLocaleString("es-CL")} CLP
                    </p>
                    <p className="text-muted-foreground">Ingresos generados</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de progreso de ocupación */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ocupación</span>
                <span className="font-medium">{occupancy}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    occupancy > 80
                      ? "bg-gradient-to-r from-orange-500 to-red-500"
                      : occupancy > 50
                        ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                        : "bg-gradient-to-r from-green-500 to-blue-500"
                  }`}
                  style={{ width: `${Math.min(occupancy, 100)}%` }}
                />
              </div>
            </div>

            {/* Acciones rápidas */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex gap-2">
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/events/${event.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Link>
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link href={`/events/${event.id}/edit`}>
                    <Settings className="h-4 w-4 mr-1" />
                    Editar
                  </Link>
                </Button>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Activity className="h-3 w-3" />
                {event._count.orders} órdenes
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function EventsDashboard({
  initialEvents,
  organizerName,
}: EventsDashboardProps) {
  const [events] = useState<Event[]>(initialEvents);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Calcular estadísticas
  const totalEvents = events.length;
  const publishedEvents = events.filter((e) => e.isPublished).length;
  const totalTicketsSold = events.reduce((sum, e) => sum + e._count.tickets, 0);
  const totalRevenue = events.reduce(
    (sum, e) => sum + e._count.tickets * e.price,
    0
  );
  const averageOccupancy =
    events.length > 0
      ? Math.round(
          events.reduce(
            (sum, e) => sum + (e._count.tickets / e.capacity) * 100,
            0
          ) / events.length
        )
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-zinc-900 dark:via-zinc-950 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-purple-600/90"></div>
          <div className="absolute top-4 right-4 opacity-20">
            <Calendar className="h-32 w-32" />
          </div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                  Mis Eventos
                </h1>
                <p className="text-blue-100 text-lg mb-4">
                  Hola {organizerName}, gestiona y monitorea todos tus eventos
                </p>
                <div className="flex items-center gap-4 text-blue-100 text-sm">
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    {totalEvents} eventos creados
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    {totalTicketsSold} tickets vendidos
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="bg-white text-indigo-600 hover:bg-gray-100"
                  asChild
                >
                  <Link href="/events/create">
                    <Plus className="w-5 h-5 mr-2" />
                    Crear Evento
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Estadísticas Principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernStatCard
            title="Total Eventos"
            value={totalEvents}
            icon={Calendar}
            description="Eventos creados hasta ahora"
            trend="+2 este mes"
            accentColor="blue"
          />
          <ModernStatCard
            title="Publicados"
            value={publishedEvents}
            icon={Eye}
            description="Eventos visibles al público"
            trend={`${Math.round((publishedEvents / totalEvents) * 100) || 0}% del total`}
            accentColor="green"
          />
          <ModernStatCard
            title="Tickets Vendidos"
            value={totalTicketsSold}
            icon={Users}
            description="Total de entradas vendidas"
            trend={`${averageOccupancy}% ocupación promedio`}
            accentColor="purple"
          />
          <ModernStatCard
            title="Ingresos Totales"
            value={`$${totalRevenue.toLocaleString("es-CL")}`}
            icon={DollarSign}
            description="Ingresos generados"
            trend="+15% vs mes anterior"
            accentColor="orange"
          />
        </div>

        {/* Controles de Vista */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Buscar eventos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filtros</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <Button
              size="sm"
              variant={viewMode === "grid" ? "default" : "ghost"}
              onClick={() => setViewMode("grid")}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === "list" ? "default" : "ghost"}
              onClick={() => setViewMode("list")}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Lista de Eventos */}
        <div className="space-y-6">
          {events.length > 0 ? (
            <div
              className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"}`}
            >
              {events.map((event) => (
                <Link key={event.id} href={`/events/${event.id}/edit`}>
                  <ModernEventCard event={event} />
                </Link>
              ))}
            </div>
          ) : (
            <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardContent className="py-16 text-center">
                <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center mb-6">
                  <Calendar className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  ¡Tiempo de crear tu primer evento!
                </h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Comienza tu viaje como organizador creando eventos increíbles
                  que la gente ame.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                    asChild
                  >
                    <Link href="/events/create">
                      <Plus className="w-5 h-5 mr-2" />
                      Crear Mi Primer Evento
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/events">
                      <Eye className="w-5 h-5 mr-2" />
                      Explorar Eventos
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Panel de Insights (solo si hay eventos) */}
        {events.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Resumen de Rendimiento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
                        Evento Top
                      </span>
                    </div>
                    <p className="font-semibold text-green-800 dark:text-green-300">
                      {events.reduce((top, current) =>
                        current._count.tickets > top._count.tickets
                          ? current
                          : top
                      )?.title || "N/A"}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                        Promedio Ocupación
                      </span>
                    </div>
                    <p className="font-semibold text-blue-800 dark:text-blue-300">
                      {averageOccupancy}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-400">
                  <Zap className="h-5 w-5" />
                  Próximos Pasos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <p className="text-sm font-medium">Optimiza tu alcance</p>
                  <p className="text-xs text-muted-foreground">
                    Considera crear eventos en diferentes categorías
                  </p>
                </div>
                <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <p className="text-sm font-medium">Aumenta engagement</p>
                  <p className="text-xs text-muted-foreground">
                    Agrega imágenes atractivas a tus eventos
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
