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
  Activity,
  ChevronRight,
  CalendarDays,
  TicketCheck,
  Target,
  Layers,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UserDashboardClientProps {
  totalEvents: number;
  publishedEvents: number;
  totalTicketsSold: number;
  revenue: number;
  recentEventsData: Array<{
    id: string;
    title: string;
    organizer: string;
    date: string;
    status: "published" | "draft";
    revenue: number;
    tickets: number;
  }>;
  userRole: string;
  firstName?: string | null;
  lastName?: string | null;
  email: string;
}

export function UserDashboardClient({
  totalEvents,
  publishedEvents,
  totalTicketsSold,
  revenue,
  recentEventsData,
  userRole,
  firstName,
  email
}: UserDashboardClientProps) {
  const { data: statsData, loading: statsLoading, error: statsError } = useDashboardStats(false);

  return (
    <div className="space-y-8">
      {/* Header */}
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

      {/* Stats Cards */}
      <StatsGrid>
        <ModernStatCard
          title="Eventos Totales"
          value={totalEvents.toString()}
          icon={Calendar}
          description={`${publishedEvents} publicados`}
          trend="+12%"
          trendDirection="up"
          accentColor="blue"
        />
        <ModernStatCard
          title="Tickets Vendidos"
          value={totalTicketsSold.toLocaleString()}
          icon={Ticket}
          description="Transacciones exitosas"
          trend="+23%"
          trendDirection="up"
          accentColor="purple"
        />
        <ModernStatCard
          title="Ingresos Totales"
          value={`$${revenue.toLocaleString()}`}
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
                  <div key={event.id} className="flex items-center space-x-4 rounded-lg border p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {event.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {event.date} • {event.tickets} tickets vendidos
                      </p>
                    </div>
                    <div className="ml-auto flex items-center space-x-2">
                      <Badge 
                        variant={event.status === "published" ? "default" : "secondary"}
                      >
                        {event.status === "published" ? "Publicado" : "Borrador"}
                      </Badge>
                      <span className="text-sm font-medium text-green-600">
                        ${event.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer transition-colors hover:bg-muted/50">
          <Link href="/dashboard/events">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Gestionar Eventos
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvents}</div>
              <p className="text-xs text-muted-foreground">
                eventos en total
              </p>
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <span>Ver todos</span>
                <ChevronRight className="ml-1 h-3 w-3" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer transition-colors hover:bg-muted/50">
          <Link href="/dashboard/settings">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Configuración
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <UserCircle className="h-8 w-8" />
              </div>
              <p className="text-xs text-muted-foreground">
                perfil y ajustes
              </p>
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <span>Configurar</span>
                <ChevronRight className="ml-1 h-3 w-3" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer transition-colors hover:bg-muted/50">
          <Link href="/dashboard/promo-codes">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Códigos Promocionales
              </CardTitle>
              <TicketCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Target className="h-8 w-8" />
              </div>
              <p className="text-xs text-muted-foreground">
                gestionar promociones
              </p>
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <span>Ver códigos</span>
                <ChevronRight className="ml-1 h-3 w-3" />
              </div>
            </CardContent>
          </Link>
        </Card>

        <Card className="cursor-pointer transition-colors hover:bg-muted/50">
          <Link href="/dashboard/organizer-profile">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Perfil Organizador
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Layers className="h-8 w-8" />
              </div>
              <p className="text-xs text-muted-foreground">
                información pública
              </p>
              <div className="mt-2 flex items-center text-xs text-muted-foreground">
                <span>Editar perfil</span>
                <ChevronRight className="ml-1 h-3 w-3" />
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
    </div>
  );
}
