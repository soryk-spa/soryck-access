"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardPageLayout } from "@/components/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Target,
  Activity,
  Filter,
  Search,
  Grid3X3,
  List,
  ChevronRight,
  Zap,
  Award,
  Ticket,
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
    <Card className={`group hover:shadow-lg transition-all duration-300 border-0 ${colors.bg}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2.5 rounded-xl ${colors.icon} shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className={`text-2xl font-bold ${colors.accent}`}>{value}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{description}</p>
            {trend && (
              <div className={`flex items-center gap-1 text-xs font-medium ${colors.trend}`}>
                <TrendingUp className={`h-3 w-3 ${trendDirection === "down" ? "rotate-180" : ""}`} />
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
        color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      };
    }
    return {
      label: "Borrador",
      variant: "secondary" as const,
      color: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
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
                  <h3 className="text-xl font-bold line-clamp-1">{event.title}</h3>
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
                  <Badge variant="outline" className="border-blue-200 text-blue-100 bg-blue-500/20">
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
                    <p className="font-medium text-foreground">{formatDate(event.startDate)}</p>
                    <p className="text-muted-foreground">{formatTime(event.startDate)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <MapPin className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground line-clamp-1">{event.location}</p>
                    <p className="text-muted-foreground">Ubicación del evento</p>
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
                    <p className="text-muted-foreground">{occupancy}% ocupación</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <DollarSign className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">${revenue.toLocaleString("es-CL")} CLP</p>
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

export default function EventsDashboard({ initialEvents, organizerName }: EventsDashboardProps) {
  const [events] = useState<Event[]>(initialEvents);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Calcular estadísticas
  const totalEvents = events.length;
  const publishedEvents = events.filter((e) => e.isPublished).length;
  const totalTicketsSold = events.reduce((sum, e) => sum + e._count.tickets, 0);
  const totalRevenue = events.reduce((sum, e) => sum + (e._count.tickets * e.price), 0);

  // Configuración del header
  const headerConfig = {
    title: "Mis Eventos",
    description: "gestiona y monitorea todos tus eventos",
    greeting: `Hola ${organizerName}`,
    backgroundIcon: Calendar,
    stats: [
      { icon: Target, label: "eventos creados", value: totalEvents },
      { icon: Award, label: "tickets vendidos", value: totalTicketsSold },
    ],
    actions: [
      {
        label: "Crear Evento",
        href: "/events/create",
        icon: Plus,
        variant: "default" as const,
      },
    ],
  };

  if (totalEvents === 0) {
    return (
      <DashboardPageLayout header={headerConfig}>
        <Card className="text-center py-16">
          <CardContent>
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-semibold mb-2">¡Crea tu primer evento!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Comienza tu viaje como organizador creando tu primer evento. Es fácil y rápido.
            </p>
            <Button size="lg" asChild>
              <Link href="/events/create">
                <Plus className="w-5 h-5 mr-2" />
                Crear Primer Evento
              </Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout header={headerConfig}>
      {/* Estadísticas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ModernStatCard
          title="Total Eventos"
          value={totalEvents}
          icon={Calendar}
          description="Eventos creados"
          trend="+12%"
          trendDirection="up"
          accentColor="blue"
        />
        <ModernStatCard
          title="Publicados"
          value={publishedEvents}
          icon={Eye}
          description="Eventos activos"
          trend="+8%"
          trendDirection="up"
          accentColor="green"
        />
        <ModernStatCard
          title="Tickets Vendidos"
          value={totalTicketsSold}
          icon={Ticket}
          description="Total de ventas"
          trend="+23%"
          trendDirection="up"
          accentColor="purple"
        />
        <ModernStatCard
          title="Ingresos Totales"
          value={`$${totalRevenue.toLocaleString("es-CL")}`}
          icon={DollarSign}
          description="CLP generados"
          trend="+15%"
          trendDirection="up"
          accentColor="orange"
        />
      </div>

      {/* Controles de vista */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4 mr-2" />
              Lista
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </div>
      </div>

      {/* Lista de eventos */}
      <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
        {events.map((event) => (
          <ModernEventCard key={event.id} event={event} />
        ))}
      </div>
    </DashboardPageLayout>
  );
}
