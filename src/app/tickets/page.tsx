import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import TicketCard from "@/components/ticket-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Ticket,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  TrendingUp,
  Clock,
  Star,
  Eye,
  Activity,
  Target,
  Award,
  Zap,
} from "lucide-react";
import Link from "next/link";


const ModernStatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  accentColor = "blue",
  highlight = false,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  trend?: string;
  accentColor?: "blue" | "green" | "purple" | "orange";
  highlight?: boolean;
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
      className={`group hover:shadow-xl transition-all duration-300 border-0 ${colors.bg} ${highlight ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
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
                <TrendingUp className="h-3 w-3" />
                {trend}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


const TicketFiltersStatic = ({
  counts,
}: {
  counts: { all: number; active: number; used: number; cancelled: number };
}) => {
  const filters = [
    {
      key: "all",
      label: "Todos",
      count: counts.all,
      icon: Ticket,
      color: "blue",
    },
    {
      key: "active",
      label: "Válidos",
      count: counts.active,
      icon: Star,
      color: "green",
    },
    {
      key: "used",
      label: "Usados",
      count: counts.used,
      icon: CheckCircle2,
      color: "purple",
    },
    {
      key: "cancelled",
      label: "Cancelados",
      count: counts.cancelled,
      icon: AlertCircle,
      color: "orange",
    },
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {filters.map((filter) => {
        const Icon = filter.icon;
        const isActive = filter.key === "all"; 

        return (
          <div
            key={filter.key}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
              isActive
                ? "bg-blue-500 text-white shadow-lg scale-105"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
            }`}
          >
            <Icon className="h-4 w-4" />
            <span>{filter.label}</span>
            <Badge
              variant={isActive ? "secondary" : "outline"}
              className={`text-xs ${isActive ? "bg-white/20 text-white border-white/30" : ""}`}
            >
              {filter.count}
            </Badge>
          </div>
        );
      })}
    </div>
  );
};

export default async function TicketsPage() {
  const user = await requireAuth();

  const [tickets, ticketStats] = await Promise.all([
    prisma.ticket.findMany({
      where: { userId: user.id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            imageUrl: true,
            price: true,
            currency: true,
            isFree: true,
            organizer: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            currency: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    Promise.all([
      prisma.ticket.count({
        where: { userId: user.id, status: "ACTIVE", isUsed: false },
      }),
      prisma.ticket.count({
        where: { userId: user.id, isUsed: true },
      }),
      prisma.ticket.count({
        where: { userId: user.id, status: { in: ["CANCELLED", "REFUNDED"] } },
      }),
    ]),
  ]);

  const [activeTickets, usedTickets, cancelledTickets] = ticketStats;
  const totalTickets = tickets.length;

  
  const upcomingEvents = tickets.filter((ticket) => {
    const eventDate = new Date(ticket.event.startDate);
    const today = new Date();
    return ticket.status === "ACTIVE" && !ticket.isUsed && eventDate > today;
  }).length;

  const serializedTickets = tickets.map((ticket) => {
    const startDate = new Date(ticket.event.startDate);

    return {
      ...ticket,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      usedAt: ticket.usedAt?.toISOString() || null,
      event: {
        ...ticket.event,
        startDate: ticket.event.startDate.toISOString(),
        endDate: ticket.event.endDate
          ? ticket.event.endDate.toISOString()
          : null,
        formattedDate: startDate.toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        }),
        formattedTime: startDate.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
      order: {
        ...ticket.order,
        createdAt: ticket.order.createdAt.toISOString(),
      },
    };
  });

  const userName = user.firstName || user.email.split("@")[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600/90 to-blue-600/90"></div>
          <div className="absolute top-4 right-4 opacity-20">
            <Ticket className="h-32 w-32" />
          </div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                  Mis Tickets
                </h1>
                <p className="text-green-100 text-lg mb-4">
                  Hola {userName}, gestiona y accede a todas tus entradas
                </p>
                <div className="flex items-center gap-4 text-green-100 text-sm">
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    {totalTickets} tickets en total
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {upcomingEvents} próximos eventos
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="bg-white text-green-600 hover:bg-gray-100"
                  asChild
                >
                  <Link href="/events">
                    <Eye className="w-5 h-5 mr-2" />
                    Explorar Eventos
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <ModernStatCard
            title="Total Tickets"
            value={totalTickets}
            icon={Ticket}
            description="Entradas adquiridas"
            trend="Todas las compras"
            accentColor="blue"
            highlight={totalTickets > 0}
          />
          <ModernStatCard
            title="Válidos"
            value={activeTickets}
            icon={Star}
            description="Tickets listos para usar"
            trend={`${Math.round((activeTickets / totalTickets) * 100) || 0}% del total`}
            accentColor="green"
          />
          <ModernStatCard
            title="Usados"
            value={usedTickets}
            icon={CheckCircle2}
            description="Eventos a los que asististe"
            trend="Experiencias vividas"
            accentColor="purple"
          />
          <ModernStatCard
            title="Próximos"
            value={upcomingEvents}
            icon={Clock}
            description="Eventos por venir"
            trend="¡No te los pierdas!"
            accentColor="orange"
          />
        </div>

        {}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border-0">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Gestiona tus Tickets
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Organiza y accede a todas tus entradas desde un solo lugar
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Search className="h-4 w-4" />
                <span>Buscar</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Filter className="h-4 w-4" />
                <span>Filtrar</span>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="flex justify-center">
          <TicketFiltersStatic
            counts={{
              all: totalTickets,
              active: activeTickets,
              used: usedTickets,
              cancelled: cancelledTickets,
            }}
          />
        </div>

        {}
        {serializedTickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {serializedTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        ) : (
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardContent className="py-16 text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-full flex items-center justify-center mb-6">
                <Ticket className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3">
                ¡Tu primera aventura te espera!
              </h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Descubre eventos increíbles cerca de ti. Conciertos,
                conferencias, deportes y mucho más.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-blue-600"
                  asChild
                >
                  <Link href="/events">
                    <Calendar className="w-5 h-5 mr-2" />
                    Explorar Eventos
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/">
                    <Activity className="w-5 h-5 mr-2" />
                    Volver al Inicio
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {}
        {serializedTickets.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-0 shadow-lg bg-white dark:bg-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Resumen de Actividad
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700 dark:text-green-400">
                        Primer Evento
                      </span>
                    </div>
                    <p className="font-semibold text-green-800 dark:text-green-300 text-sm">
                      {serializedTickets.length > 0
                        ? serializedTickets[serializedTickets.length - 1].event
                            .title
                        : "N/A"}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
                        Último Ticket
                      </span>
                    </div>
                    <p className="font-semibold text-blue-800 dark:text-blue-300 text-sm">
                      {new Date(
                        serializedTickets[0]?.createdAt || ""
                      ).toLocaleDateString("es-CL")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Zap className="h-5 w-5" />
                  Próximos Pasos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <p className="text-sm font-medium">Descubre más eventos</p>
                  <p className="text-xs text-muted-foreground">
                    Explora nuevas categorías y experiencias
                  </p>
                </div>
                <div className="p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg">
                  <p className="text-sm font-medium">Comparte experiencias</p>
                  <p className="text-xs text-muted-foreground">
                    Invita amigos a eventos que te gusten
                  </p>
                </div>
                {upcomingEvents > 0 && (
                  <div className="p-3 bg-orange-100/60 dark:bg-orange-900/20 rounded-lg border border-orange-200">
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-400">
                      ¡Tienes {upcomingEvents} evento
                      {upcomingEvents > 1 ? "s" : ""} próximo
                      {upcomingEvents > 1 ? "s" : ""}!
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-300">
                      No olvides prepararte para la fecha
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
