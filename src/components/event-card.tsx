import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, User, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { calculateTotalPrice, formatPrice } from "@/lib/commission";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    location: string;
    price: number;
    currency: string;
    isFree: boolean;
    capacity: number;
    imageUrl?: string;
    isPublished: boolean;
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
  };
  showOrganizerInfo?: boolean;
  showManageButtons?: boolean;
}

export default function EventCard({
  event,
  showOrganizerInfo = false,
  showManageButtons = false,
}: EventCardProps) {
  const startDate = new Date(event.startDate);
  const now = new Date();
  const isUpcoming = startDate > now;
  const isPast = startDate < now;
  const availableTickets = event.capacity - event._count.tickets;
  const isSoldOut = availableTickets <= 0;

  const finalPrice = event.isFree ? 0 : calculateTotalPrice(event.price);
  const displayPrice = formatPrice(finalPrice, event.currency);

  const organizerName = event.organizer.firstName
    ? `${event.organizer.firstName} ${event.organizer.lastName || ""}`.trim()
    : event.organizer.email.split("@")[0];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString("es-ES", { month: "short" }),
      time: date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      weekday: date.toLocaleDateString("es-ES", { weekday: "long" }),
    };
  };

  const dateInfo = formatDate(event.startDate);

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative">
        <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700">
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Calendar className="h-16 w-16 text-muted-foreground" />
            </div>
          )}

          <div className="absolute top-4 left-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg p-2 shadow-lg text-center min-w-[60px]">
              <div className="text-2xl font-bold text-primary">
                {dateInfo.day}
              </div>
              <div className="text-xs uppercase text-muted-foreground">
                {dateInfo.month}
              </div>
            </div>
          </div>

          <div className="absolute top-4 right-4 flex flex-col gap-2">
            {!event.isPublished && <Badge variant="secondary">Borrador</Badge>}
            {isPast && (
              <Badge variant="outline" className="bg-gray-100 dark:bg-gray-800">
                Finalizado
              </Badge>
            )}
            {isSoldOut && isUpcoming && (
              <Badge variant="destructive">Agotado</Badge>
            )}
            {availableTickets <= 10 && availableTickets > 0 && isUpcoming && (
              <Badge
                variant="outline"
                className="bg-orange-100 text-orange-700 border-orange-300"
              >
                Últimos tickets
              </Badge>
            )}
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          <Badge variant="outline" className="w-fit">
            {event.category.name}
          </Badge>

          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>

          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.description}
            </p>
          )}

          <div className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {dateInfo.weekday}, {dateInfo.time}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{event.location}</span>
            </div>

            {showOrganizerInfo && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>Organizado por {organizerName}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="text-lg font-bold">{displayPrice}</div>
              {!event.isFree && (
                <div className="text-xs text-muted-foreground">
                  Precio final
                </div>
              )}
            </div>

            <div className="text-right text-sm">
              {isUpcoming && (
                <>
                  <div className="font-medium">
                    {availableTickets} disponibles
                  </div>
                  <div className="text-muted-foreground">
                    de {event.capacity} tickets
                  </div>
                </>
              )}
              {isPast && (
                <div className="text-muted-foreground">
                  {event._count.tickets} asistentes
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            {showManageButtons ? (
              <>
                <Button asChild variant="outline" className="flex-1">
                  <Link href={`/events/${event.id}/edit`}>Editar</Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href={`/events/${event.id}`}>Ver</Link>
                </Button>
              </>
            ) : (
              <Button
                asChild
                className="w-full"
                disabled={isSoldOut && isUpcoming}
              >
                <Link href={`/events/${event.id}`}>
                  {isPast
                    ? "Ver detalles"
                    : isSoldOut
                    ? "Agotado"
                    : event.isFree
                    ? "Registrarse gratis"
                    : `Comprar desde ${displayPrice}`}
                </Link>
              </Button>
            )}
          </div>

          {showManageButtons && (
            <div className="grid grid-cols-2 gap-4 pt-2 text-xs text-muted-foreground border-t">
              <div>
                <span className="font-medium">{event._count.orders}</span>{" "}
                órdenes
              </div>
              <div>
                <span className="font-medium">{event._count.tickets}</span>{" "}
                tickets vendidos
              </div>
            </div>
          )}
        </CardContent>
      </div>
    </Card>
  );
}
