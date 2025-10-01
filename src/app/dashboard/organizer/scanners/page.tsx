import { requireAuth } from "@/lib/auth";


export const dynamic = 'force-dynamic'
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  UserCheck,
  Plus,
  Shield,
  Calendar,
  QrCode,
  CheckCircle,
  AlertCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default async function ScannersPage() {
  const user = await requireAuth();

  
  const events = await prisma.event.findMany({
    where: { organizerId: user.id },
    include: {
      scanners: {
        include: {
          scanner: true,
        }
      },
      _count: {
        select: { 
          scanners: true,
          tickets: true,
        }
      }
    },
    orderBy: { startDate: "desc" },
    take: 10,
  });

  
  const allScanners = await prisma.eventScanner.findMany({
    where: {
      event: { organizerId: user.id }
    },
    include: {
      scanner: true,
      event: {
        select: {
          id: true,
          title: true,
          startDate: true,
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  
  const uniqueScanners = allScanners.reduce((acc: Record<string, {
    user: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
    events: Array<{
      id: string;
      title: string;
      createdAt: Date;
      startDate?: Date;
    }>;
    lastActivity: Date;
    totalEvents: number;
  }>, scanner) => {
    const userId = scanner.scanner.id;
    if (!acc[userId]) {
      acc[userId] = {
        user: scanner.scanner,
        events: [],
        lastActivity: scanner.createdAt,
        totalEvents: 0,
      };
    }
    acc[userId].events.push({
      id: scanner.event.id,
      title: scanner.event.title,
      createdAt: scanner.createdAt,
      startDate: scanner.event.startDate,
    });
    acc[userId].totalEvents = acc[userId].events.length;
    return acc;
  }, {});

  const scannerList = Object.values(uniqueScanners);

  return (
    <div className="space-y-8">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              👥 Gestión de Validadores
            </h1>
            <p className="text-blue-100 mt-2">
              Administra usuarios que pueden escanear tickets en tus eventos
            </p>
          </div>
          <div className="hidden md:block">
            <Link href="/dashboard/organizer/scanners/invite">
              <Button variant="secondary" className="bg-white/20 hover:bg-white/30 text-white border-white/30">
                <Plus className="w-4 h-4 mr-2" />
                Invitar Scanner
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile button */}
      <div className="md:hidden">
        <Link href="/dashboard/organizer/scanners/invite">
          <Button className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Invitar Scanner
          </Button>
        </Link>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scanners Activos</p>
                <p className="text-2xl font-bold text-foreground">{scannerList.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 dark:bg-green-950 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eventos Activos</p>
                <p className="text-2xl font-bold text-foreground">
                  {events.filter(e => new Date(e.startDate) > new Date()).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <QrCode className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                <p className="text-2xl font-bold text-foreground">
                  {events.reduce((sum, event) => sum + event._count.tickets, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded-lg">
                <Shield className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Permisos</p>
                <p className="text-2xl font-bold text-foreground">
                  {allScanners.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {}
        <Card className="border">
          <CardHeader>
            <CardTitle className="text-lg">Validadores Registrados</CardTitle>
            <CardDescription>
              Usuarios con permisos para escanear tickets
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scannerList.length > 0 ? (
              <div className="space-y-4">
                {scannerList.map((scanner: {
                  user: {
                    id: string;
                    firstName: string | null;
                    lastName: string | null;
                    email: string;
                  };
                  events: Array<{
                    id: string;
                    title: string;
                    createdAt: Date;
                    startDate?: Date;
                  }>;
                  lastActivity: Date;
                  totalEvents: number;
                }) => (
                  <div key={scanner.user.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <Avatar>
                      <AvatarFallback>
                        {scanner.user.firstName?.charAt(0) || scanner.user.email.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-medium text-foreground">
                        {scanner.user.firstName && scanner.user.lastName 
                          ? `${scanner.user.firstName} ${scanner.user.lastName}`
                          : scanner.user.email
                        }
                      </h4>
                      <p className="text-sm text-muted-foreground">{scanner.user.email}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {scanner.events.length} eventos
                        </Badge>
                        <span className="text-xs text-muted-foreground/70">
                          {formatDistanceToNow(new Date(scanner.lastActivity), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        <UserCheck className="w-3 h-3 mr-1" />
                        Activo
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <UserCheck className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Sin validadores</h3>
                <p className="text-muted-foreground mb-4">
                  Invita usuarios para que puedan escanear tickets
                </p>
                <Link href="/dashboard/organizer/scanners/invite">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Invitar Primer Scanner
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg">Eventos con Validadores</CardTitle>
            <CardDescription>
              Permisos de escaneo por evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.filter(event => event._count.scanners > 0).map((event) => (
                  <div key={event.id} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-slate-900 truncate">{event.title}</h4>
                      <Badge variant={new Date(event.startDate) > new Date() ? "default" : "secondary"}>
                        {new Date(event.startDate) > new Date() ? "Próximo" : "Finalizado"}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-slate-500 mb-3">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(event.startDate).toLocaleDateString("es-CL")}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <QrCode className="w-4 h-4" />
                        <span>{event._count.tickets} tickets</span>
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="flex -space-x-2">
                        {event.scanners.slice(0, 3).map((eventScanner) => (
                          <Avatar key={eventScanner.id} className="w-6 h-6 border-2 border-white">
                            <AvatarFallback className="text-xs">
                              {eventScanner.scanner.firstName?.charAt(0) || eventScanner.scanner.email.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="text-sm text-slate-500">
                        {event._count.scanners} validador{event._count.scanners !== 1 ? 'es' : ''}
                      </span>
                      {event._count.scanners > 3 && (
                        <span className="text-xs text-slate-400">
                          +{event._count.scanners - 3} más
                        </span>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <Link href={`/organizer/events/${event.id}/scanners`}>
                        <Button variant="outline" size="sm" className="w-full">
                          Gestionar Validadores
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Sin eventos</h3>
                <p className="text-slate-500 mb-4">
                  Crea eventos para asignar validadores
                </p>
                <Link href="/organizer/events/new">
                  <Button variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Crear Evento
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Consejos para Validadores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-slate-900">Asigna responsabilidades claras</h4>
              <p className="text-sm text-slate-600">
                Define qué validadores se encargan de qué áreas o entradas del evento
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-slate-900">Capacita a tu equipo</h4>
              <p className="text-sm text-slate-600">
                Asegúrate de que todos sepan cómo usar la aplicación de escaneo
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <Shield className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-medium text-slate-900">Controla los permisos</h4>
              <p className="text-sm text-slate-600">
                Los validadores solo pueden escanear tickets de eventos específicos
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
