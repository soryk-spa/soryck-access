import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { 
  Calendar,
  MapPin,
  Clock,
  Ticket,
  Download,
  QrCode,
  ExternalLink
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function MyTicketsPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Debes iniciar sesión para ver tus tickets</p>
      </div>
    );
  }

  const tickets = await prisma.ticket.findMany({
    where: {
      userId: user.id
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          description: true,
          startDate: true,
          location: true,
          imageUrl: true,
          organizer: {
            select: {
              firstName: true,
              lastName: true,
              producerName: true
            }
          }
        }
      },
      ticketType: {
        select: {
          name: true,
          price: true
        }
      },
      order: {
        select: {
          id: true,
          createdAt: true,
          status: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Confirmado";
      case "PENDING":
        return "Pendiente";
      case "CANCELLED":
        return "Cancelado";
      default:
        return status;
    }
  };

  
  const upcomingTickets = tickets.filter(ticket => {
    const eventDate = new Date(ticket.event.startDate);
    return eventDate > new Date();
  }).length;

  const pastTickets = tickets.length - upcomingTickets;
  const activeTickets = tickets.filter(ticket => ticket.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mis Tickets</h1>
          <p className="text-muted-foreground">
            Gestiona y accede a todos tus tickets de eventos
          </p>
        </div>
        <Badge variant="secondary" className="text-lg px-3 py-1">
          {tickets.length} {tickets.length === 1 ? "ticket" : "tickets"}
        </Badge>
      </div>

      {}
      {tickets.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tickets</p>
                  <p className="text-2xl font-bold">{tickets.length}</p>
                </div>
                <Ticket className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Próximos</p>
                  <p className="text-2xl font-bold">{upcomingTickets}</p>
                </div>
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Activos</p>
                  <p className="text-2xl font-bold">{activeTickets}</p>
                </div>
                <QrCode className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Finalizados</p>
                  <p className="text-2xl font-bold">{pastTickets}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {tickets.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent>
            <Ticket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No tienes tickets aún</h3>
            <p className="text-muted-foreground mb-4">
              Explora eventos y compra tu primer ticket para empezar
            </p>
            <Button asChild>
              <Link href="/events">
                <ExternalLink className="h-4 w-4 mr-2" />
                Explorar Eventos
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {tickets.map((ticket) => (
            <Card key={ticket.id} className="overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                {}
                <div className="lg:w-48 h-48 lg:h-auto bg-muted">
                  {ticket.event.imageUrl ? (
                    <Image
                      src={ticket.event.imageUrl}
                      alt={ticket.event.title}
                      width={192}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-1">{ticket.event.title}</h3>
                      <p className="text-muted-foreground">
                        Organizado por {ticket.event.organizer.producerName || 
                          `${ticket.event.organizer.firstName} ${ticket.event.organizer.lastName}`}
                      </p>
                    </div>
                    <Badge className={getStatusColor(ticket.order.status)}>
                      {getStatusLabel(ticket.order.status)}
                    </Badge>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(ticket.event.startDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{ticket.event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Ticket className="h-4 w-4 text-muted-foreground" />
                      <span>{ticket.ticketType?.name || "Ticket"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Comprado: {new Date(ticket.order.createdAt).toLocaleDateString("es-ES")}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-lg font-semibold text-[#0053CC]">
                      {formatCurrency(ticket.ticketType?.price || 0)}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <QrCode className="h-4 w-4 mr-2" />
                        Código QR
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
