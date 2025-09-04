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
  ChevronRight,
  CalendarDays,
  Target,
  Loader2,
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
  activePromoCodes: number;
  pendingCourtesyInvitations: number;
  userRole: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
}

export function UserDashboardClient({
  totalEvents,
  publishedEvents,
  draftEvents,
  totalTicketsSold,
  totalRevenue,
  recentEventsData,
  upcomingEventsData,
  userRole,
  firstName,
  email,
  activePromoCodes,
  pendingCourtesyInvitations,
  averageTicketsPerEvent,
  conversionRate
}: UserDashboardClientProps) {
  const { data: statsData, loading: statsLoading, error: statsError } = useDashboardStats(false);

  return (
    <div className="space-y-8">
      {}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido de vuelta, {firstName || email}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline">{userRole}</Badge>
          <Button asChild>
            <Link href="/dashboard/events">
              <Plus className="mr-2 h-4 w-4" />
              Crear Evento
            </Link>
          </Button>
        </div>
      </div>

      {}
      <StatsGrid>
        <ModernStatCard
          title="Eventos Totales"
          value={totalEvents.toString()}
          icon={Calendar}
          description={`${publishedEvents} publicados, ${draftEvents} borradores`}
          trend={`${conversionRate}%`}
          trendDirection="up"
          accentColor="blue"
        />
        <ModernStatCard
          title="Tickets Vendidos"
          value={totalTicketsSold.toLocaleString()}
          icon={Ticket}
          description={`Promedio: ${averageTicketsPerEvent} por evento`}
          trend="+23%"
          trendDirection="up"
          accentColor="purple"
        />
        <ModernStatCard
          title="Ingresos Totales"
          value={`$${totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          description="CLP recaudados"
          trend="+15%"
          trendDirection="up"
          accentColor="green"
          highlight
        />
        <ModernStatCard
          title="Códigos Activos"
          value={activePromoCodes.toString()}
          icon={Target}
          description={`${pendingCourtesyInvitations} cortesías pendientes`}
          trend="Disponibles"
          trendDirection="neutral"
          accentColor="orange"
        />
      </StatsGrid>

      {}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-8">
        <Card className="col-span-5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Resumen de Actividad</CardTitle>
                <CardDescription>
                  Métricas de tus eventos por mes
                </CardDescription>
              </div>
              <Tabs defaultValue="ingresos" className="w-[300px]">
                <TabsList>
                  <TabsTrigger value="ingresos">Ingresos</TabsTrigger>
                  <TabsTrigger value="eventos">Eventos</TabsTrigger>
                  <TabsTrigger value="tickets">Tickets</TabsTrigger>
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
                    data={statsData?.monthlyStats.map(item => ({ 
                      name: item.name, 
                      total: item.ingresos 
                    })) || []} 
                    type="area" 
                  />
                </TabsContent>
                <TabsContent value="eventos">
                  <Overview 
                    data={statsData?.monthlyStats.map(item => ({ 
                      name: item.name, 
                      total: item.eventos 
                    })) || []} 
                    type="bar" 
                  />
                </TabsContent>
                <TabsContent value="tickets">
                  <Overview 
                    data={statsData?.monthlyStats.map(item => ({ 
                      name: item.name, 
                      total: item.tickets || 0 
                    })) || []} 
                    type="line" 
                  />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Eventos Próximos</CardTitle>
            <CardDescription>
              Tus eventos publicados que están por comenzar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEventsData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay eventos próximos</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Publica un evento para que aparezca aquí
                  </p>
                </div>
              ) : (
                upcomingEventsData.map((event) => (
                  <div key={event.id} className="flex items-start space-x-3 rounded-lg border p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {event.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.date}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.time} • {event.tickets} tickets vendidos
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {event.category}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Eventos Recientes</CardTitle>
            <CardDescription>
              Tus últimos eventos creados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentEventsData.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay eventos</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Crea tu primer evento para comenzar
                  </p>
                  <Button asChild size="sm">
                    <Link href="/dashboard/events">
                      <Plus className="mr-2 h-4 w-4" />
                      Crear Evento
                    </Link>
                  </Button>
                </div>
              ) : (
                recentEventsData.map((event) => (
                  <div key={event.id} className="flex items-center space-x-4 rounded-lg border p-3 hover:bg-muted/50 transition-colors">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {event.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {event.date} • {event.tickets} tickets • {event.courtesyInvitations} cortesías
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {event.category}
                      </Badge>
                    </div>
                    <div className="ml-auto flex flex-col items-end space-y-1">
                      <Badge 
                        variant={event.status === "published" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {event.status === "published" ? "Publicado" : "Borrador"}
                      </Badge>
                      <span className="text-xs font-medium text-green-600">
                        ${event.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
              {recentEventsData.length > 0 && (
                <div className="pt-2">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/dashboard/events">
                      Ver todos los eventos
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Gestiona tu cuenta y eventos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button asChild variant="default" className="justify-start h-12">
                <Link href="/dashboard/events/new">
                  <Plus className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Crear Nuevo Evento</div>
                    <div className="text-xs opacity-80">Configurar evento y tickets</div>
                  </div>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="justify-start h-12">
                <Link href="/dashboard/promo-codes">
                  <Target className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Códigos Promocionales</div>
                    <div className="text-xs opacity-70">{activePromoCodes} códigos activos</div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="justify-start h-12">
                <Link href="/dashboard/organizer-profile">
                  <UserCircle className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Perfil de Organizador</div>
                    <div className="text-xs opacity-70">Configurar información pública</div>
                  </div>
                </Link>
              </Button>

              <Button asChild variant="outline" className="justify-start h-12">
                <Link href="/dashboard/settings">
                  <Settings className="mr-3 h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">Configuración</div>
                    <div className="text-xs opacity-70">Preferencias y seguridad</div>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
