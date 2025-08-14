"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  MoreVertical,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate, formatTime } from "@/lib/date"; // Importación actualizada

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

export default function EventsDashboard({
  initialEvents,
  organizerName,
}: EventsDashboardProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const handlePublishToggle = async (
    eventId: string,
    currentStatus: boolean
  ) => {
    setLoadingAction(eventId);

    try {
      const response = await fetch(`/api/events/${eventId}/publish`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isPublished: !currentStatus,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Error al cambiar el estado del evento");
        return;
      }

      setEvents(
        events.map((event) =>
          event.id === eventId
            ? { ...event, isPublished: !currentStatus }
            : event
        )
      );
    } catch (error) {
      console.error("Error toggling publish status:", error);
      alert("Error de conexión");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDelete = async (eventId: string) => {
    if (
      !confirm(
        "¿Estás seguro de que quieres eliminar este evento? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    setLoadingAction(eventId);

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Error al eliminar el evento");
        return;
      }
      setEvents(events.filter((event) => event.id !== eventId));
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Error de conexión");
    } finally {
      setLoadingAction(null);
    }
  };

  const getEventStatus = (event: Event) => {
    const now = new Date();
    const startDate = new Date(event.startDate);

    if (startDate < now) {
      return {
        label: "Finalizado",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
      };
    }
    if (event.isPublished) {
      return {
        label: "Publicado",
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      };
    }
    return {
      label: "Borrador",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mis Eventos</h1>
          <p className="text-muted-foreground mt-2">
            Hola {organizerName}, aquí puedes gestionar todos tus eventos
          </p>
        </div>

        <Button asChild size="lg">
          <Link href="/events/create">
            <Plus className="w-4 h-4 mr-2" />
            Crear Evento
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">Total Eventos</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">Publicados</p>
                <p className="text-2xl font-bold">
                  {events.filter((e) => e.isPublished).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">Tickets Vendidos</p>
                <p className="text-2xl font-bold">
                  {events.reduce((sum, e) => sum + e._count.tickets, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">Ingresos</p>
                <p className="text-2xl font-bold">
                  $
                  {events
                    .reduce((sum, e) => sum + e._count.tickets * e.price, 0)
                    .toLocaleString("es-CL")}{" "}
                  CLP
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-4">
        {events.map((event) => {
          const status = getEventStatus(event);
          const ticketsSold = event._count.tickets;
          const occupancy = Math.round((ticketsSold / event.capacity) * 100);

          return (
            <Card key={event.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{event.title}</h3>
                      <Badge className={status.color}>{status.label}</Badge>
                      <Badge variant="outline">{event.category.name}</Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <div>
                          <div>{formatDate(event.startDate)}</div>
                          <div>{formatTime(event.startDate)}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>
                          {ticketsSold}/{event.capacity} ({occupancy}%)
                        </span>
                      </div>
                    </div>

                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-4">
                      <div className="text-sm">
                        <span className="font-medium">
                          {event.isFree
                            ? "Gratis"
                            : `${event.price.toLocaleString("es-CL")} CLP`}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {event._count.orders} órdenes
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        {loadingAction === event.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <MoreVertical className="h-4 w-4" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/events/${event.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Evento
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/events/${event.id}/edit`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          handlePublishToggle(event.id, event.isPublished)
                        }
                        disabled={loadingAction === event.id}
                      >
                        {event.isPublished ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Despublicar
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Publicar
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(event.id)}
                        disabled={loadingAction === event.id || ticketsSold > 0}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {events.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No tienes eventos aún
              </h3>
              <p className="text-muted-foreground mb-6">
                Crea tu primer evento y comienza a vender tickets
              </p>
              <Button asChild>
                <Link href="/events/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Mi Primer Evento
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
