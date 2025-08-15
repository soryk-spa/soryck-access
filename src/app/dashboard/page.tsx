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
  BarChart3,
  UserCircle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

// Componente reutilizable para las tarjetas de estadísticas
const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

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
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          event: {
            select: {
              title: true,
              startDate: true,
              location: true,
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
        take: 3,
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

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Bienvenido a tu Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Hola {user.firstName || user.email}, aquí tienes un resumen de tu
            actividad.
          </p>
        </div>
        <Badge className={`${ROLE_COLORS[user.role]} text-sm px-4 py-1`}>
          {ROLE_LABELS[user.role]}
        </Badge>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tickets Comprados"
          value={ticketsCount}
          icon={Ticket}
          description="Total de tickets adquiridos"
        />
        <StatCard
          title="Órdenes Realizadas"
          value={userStats._count.id}
          icon={DollarSign}
          description="Total de compras completadas"
        />
        {canOrganizeEvents(user.role) && (
          <>
            <StatCard
              title="Eventos Creados"
              value={organizerStats?._count.id || 0}
              icon={Calendar}
              description="Eventos que has organizado"
            />
            <StatCard
              title="Ingresos Generados"
              value={`$${(
                organizerStats?._sum.totalRevenue || 0
              ).toLocaleString("es-CL")}`}
              icon={BarChart3}
              description="Ingresos de tus eventos"
            />
          </>
        )}
      </div>

      {/* Contenido principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Eventos del Organizador */}
          {canOrganizeEvents(user.role) && (
            <Card>
              <CardHeader>
                <CardTitle>Mis Eventos Recientes</CardTitle>
                <CardDescription>
                  Un vistazo a los últimos eventos que has creado.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div>
                        <Link
                          href={`/events/${event.id}`}
                          className="font-medium hover:underline"
                        >
                          {event.title}
                        </Link>
                        <div className="text-sm text-muted-foreground">
                          {new Date(event.startDate).toLocaleDateString(
                            "es-CL",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={event.isPublished ? "default" : "secondary"}
                        >
                          {event.isPublished ? "Publicado" : "Borrador"}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {event._count.tickets} tickets vendidos
                        </div>
                      </div>
                    </div>
                  ))}
                  {userEvents.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aún no has creado ningún evento.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tickets Recientes */}
          <Card>
            <CardHeader>
              <CardTitle>Mis Tickets Recientes</CardTitle>
              <CardDescription>Tus últimas compras de tickets.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <div>
                      <div className="font-medium">{ticket.event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(ticket.event.startDate).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant={ticket.isUsed ? "secondary" : "default"}>
                      {ticket.isUsed ? "Usado" : "Válido"}
                    </Badge>
                  </div>
                ))}
                {recentTickets.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No has comprado tickets recientemente.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-between">
                <Link href="/dashboard/events">
                  <span>Mis Eventos</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              {canOrganizeEvents(user.role) && (
                <Button asChild className="w-full justify-between">
                  <Link href="/events/create">
                    <span>Crear Nuevo Evento</span>
                    <Plus className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              {canAccessAdmin(user.role) && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-between"
                >
                  <Link href="/admin">
                    <span>Panel de Admin</span>
                    <Settings className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              {canOrganizeEvents(user.role) && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-between"
                >
                  <Link href="/dashboard/organizer-profile">
                    <span>Perfil de Organizador</span>
                    <UserCircle className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>

          {user.role === "CLIENT" && <RoleRequestForm />}

          {roleRequests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Mis Solicitudes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {roleRequests.map((req) => (
                  <div key={req.id} className="text-sm p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span>
                        Rol: <strong>{ROLE_LABELS[req.requestedRole]}</strong>
                      </span>
                      <Badge
                        variant={
                          req.status === "APPROVED"
                            ? "default"
                            : req.status === "REJECTED"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {req.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Solicitado: {new Date(req.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
