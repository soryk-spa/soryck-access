import { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Plus,
  Settings,
  TrendingUp,
  Building,
  BarChart3,
  QrCode,
  UserCheck,
  DollarSign,
  Ticket,
  Eye,
  ArrowRight,
  Users,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Panel Organizador | SorykPass",
  description: "Panel de control para organizadores de eventos",
};

// Componente de navegación secundaria
function OrganizerNav() {
  const navItems = [
    {
      href: "/dashboard/organizer",
      label: "Vista General",
      icon: BarChart3,
      isActive: true, // Esta es la página actual
    },
    {
      href: "/dashboard/organizer/venues",
      label: "Venues",
      icon: Building,
      isActive: false,
    },
    {
      href: "/dashboard/organizer/scanners", 
      label: "Validadores",
      icon: UserCheck,
      isActive: false,
    },
    {
      href: "/dashboard/organizer/settings",
      label: "Configuración",
      icon: Settings,
      isActive: false,
    },
  ];

  return (
    <div className="border-b border-border mb-8">
      <div className="flex overflow-x-auto">
        <div className="flex space-x-8 px-1 min-w-full">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 transition-colors whitespace-nowrap ${
                item.isActive
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent hover:border-muted-foreground/20 text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default async function OrganizerDashboard() {
  const user = await requireAuth();

  // Obtener estadísticas del organizador
  const stats = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      organizedEvents: {
        include: {
          _count: {
            select: { tickets: true }
          }
        },
        orderBy: { startDate: "desc" },
        take: 5,
      },
      createdVenues: {
        orderBy: { createdAt: "desc" },
        take: 3,
      },
      _count: {
        select: {
          organizedEvents: true,
          createdVenues: true,
        }
      }
    }
  });

  // Calcular estadísticas
  const totalTicketsSold = stats?.organizedEvents.reduce((sum, event) => sum + event._count.tickets, 0) || 0;
  const totalRevenue = stats?.organizedEvents.reduce((sum, event) => sum + (event.totalRevenue || 0), 0) || 0;
  const activeEvents = stats?.organizedEvents.filter(event => 
    event.isPublished && new Date(event.startDate) > new Date()
  ).length || 0;

  return (
    <div className="space-y-6">
      {/* Navegación secundaria */}
      <OrganizerNav />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Panel Organizador</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Gestiona tus eventos, venues y configuraciones desde un solo lugar
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/organizer/events/new">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              Crear Evento
            </Button>
          </Link>
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <Card className="border hover:shadow-md transition-shadow">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground truncate">Eventos Totales</p>
                <p className="text-2xl lg:text-3xl font-bold text-foreground">{stats?._count.organizedEvents || 0}</p>
              </div>
              <div className="p-2 lg:p-3 bg-blue-50 dark:bg-blue-950 rounded-full shrink-0 ml-3">
                <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-3 lg:mt-4 flex items-center text-sm">
              <span className="text-green-600 dark:text-green-400 font-medium">{activeEvents} activos</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border hover:shadow-md transition-shadow">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground truncate">Venues Creados</p>
                <p className="text-2xl lg:text-3xl font-bold text-foreground">{stats?._count.createdVenues || 0}</p>
              </div>
              <div className="p-2 lg:p-3 bg-green-50 dark:bg-green-950 rounded-full shrink-0 ml-3">
                <Building className="w-5 h-5 lg:w-6 lg:h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-3 lg:mt-4 flex items-center text-sm">
              <Link href="/dashboard/organizer/venues" className="text-muted-foreground hover:text-foreground transition-colors">
                Ver todos →
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border hover:shadow-md transition-shadow">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground truncate">Tickets Vendidos</p>
                <p className="text-2xl lg:text-3xl font-bold text-foreground">{totalTicketsSold}</p>
              </div>
              <div className="p-2 lg:p-3 bg-purple-50 dark:bg-purple-950 rounded-full shrink-0 ml-3">
                <Ticket className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-3 lg:mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400 font-medium">+12%</span>
              <span className="text-muted-foreground ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border hover:shadow-md transition-shadow">
          <CardContent className="p-4 lg:p-6">
            <div className="flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-muted-foreground truncate">Ingresos Totales</p>
                <p className="text-2xl lg:text-3xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="p-2 lg:p-3 bg-orange-50 dark:bg-orange-950 rounded-full shrink-0 ml-3">
                <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-3 lg:mt-4 flex items-center text-sm">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400 font-medium">+8%</span>
              <span className="text-muted-foreground ml-1">vs mes anterior</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg lg:text-xl">Acciones Rápidas</CardTitle>
          <CardDescription>
            Acceso directo a las funciones más utilizadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/organizer/events/new" className="block">
              <div className="p-4 border rounded-lg hover:bg-accent hover:border-blue-200 dark:hover:border-blue-800 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                    <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-foreground truncate">Crear Evento</h3>
                    <p className="text-sm text-muted-foreground">Nuevo evento desde cero</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/organizer/venues" className="block">
              <div className="p-4 border rounded-lg hover:bg-accent hover:border-green-200 dark:hover:border-green-800 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-50 dark:bg-green-950 rounded-lg group-hover:bg-green-100 dark:group-hover:bg-green-900 transition-colors">
                    <Building className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-foreground truncate">Nuevo Venue</h3>
                    <p className="text-sm text-muted-foreground">Configurar ubicación</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/organizer/seat-management" className="block">
              <div className="p-4 border rounded-lg hover:bg-accent hover:border-purple-200 dark:hover:border-purple-800 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-lg group-hover:bg-purple-100 dark:group-hover:bg-purple-900 transition-colors">
                    <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-foreground truncate">Gestionar Asientos</h3>
                    <p className="text-sm text-muted-foreground">Configurar distribución</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/dashboard/organizer/scanners" className="block">
              <div className="p-4 border rounded-lg hover:bg-accent hover:border-orange-200 dark:hover:border-orange-800 transition-all duration-200 cursor-pointer group">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded-lg group-hover:bg-orange-100 dark:group-hover:bg-orange-900 transition-colors">
                    <QrCode className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-foreground truncate">Escanear Tickets</h3>
                    <p className="text-sm text-muted-foreground">Validar en evento</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Eventos Recientes */}
        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg lg:text-xl">Eventos Recientes</CardTitle>
              <Link href="/dashboard/events">
                <Button variant="outline" size="sm" className="shrink-0">
                  Ver todos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.organizedEvents && stats.organizedEvents.length > 0 ? (
              <div className="space-y-4">
                {stats.organizedEvents.map((event) => (
                  <div key={event.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-accent transition-colors">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.startDate).toLocaleDateString("es-CL")} • {event._count.tickets} tickets
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 shrink-0">
                      <Badge variant={event.isPublished ? "default" : "secondary"}>
                        {event.isPublished ? "Publicado" : "Borrador"}
                      </Badge>
                      <Link href={`/organizer/events/${event.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Sin eventos aún</h3>
                <p className="text-muted-foreground mb-4">
                  Crea tu primer evento para comenzar
                </p>
                <Link href="/organizer/events/new">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Primer Evento
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Venues */}
        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg lg:text-xl">Mis Venues</CardTitle>
              <Link href="/dashboard/organizer/venues">
                <Button variant="outline" size="sm" className="shrink-0">
                  Ver todos
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {stats?.createdVenues && stats.createdVenues.length > 0 ? (
              <div className="space-y-4">
                {stats.createdVenues.map((venue) => (
                  <div key={venue.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-accent transition-colors">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg flex items-center justify-center shrink-0">
                      <Building className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">{venue.name}</h3>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="truncate">{venue.address || 'Sin dirección'}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-medium text-foreground">{venue.capacity || 'N/A'}</p>
                      <p className="text-xs text-muted-foreground">Capacidad</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Building className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Sin venues</h3>
                <p className="text-muted-foreground mb-4">
                  Crea venues para tus eventos
                </p>
                <Link href="/dashboard/organizer/venues">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Venue
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
