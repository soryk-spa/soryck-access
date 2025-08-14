import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, User, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { calculateTotalPrice, formatPrice } from "@/lib/commission";

/**
 * Interfaz para los tipos de entrada que se esperan del backend.
 * Solo necesitamos el precio y la moneda para la lógica de visualización.
 */
interface TicketTypeInfo {
  price: number;
  currency: string;
  capacity: number; // Incluido para futuros cálculos de capacidad total
}

/**
 * Interfaz actualizada para las props del EventCard.
 * Ahora espera un array `ticketTypes` en lugar de `price` y `isFree`.
 */
interface EventCardProps {
  event: {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    location: string;
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
    ticketTypes: TicketTypeInfo[]; // <-- CAMBIO CLAVE
  };
  showOrganizerInfo?: boolean;
  showManageButtons?: boolean;
}

/**
 * Función auxiliar para determinar qué texto de precio mostrar
 * basado en los tipos de entrada disponibles.
 */
function getEventPriceDisplay(ticketTypes: TicketTypeInfo[]): string {
  if (!ticketTypes || ticketTypes.length === 0) {
    return "No disponible";
  }

  // Se calcula el precio final para cada tipo de entrada, incluyendo la comisión.
  const prices = ticketTypes.map((t) => calculateTotalPrice(t.price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currency = ticketTypes[0]?.currency || "CLP";

  // Si todos los tickets son gratuitos.
  if (minPrice === 0 && maxPrice === 0) {
    return "Gratis";
  }

  // Si solo hay un precio (o todos tienen el mismo precio).
  if (minPrice === maxPrice) {
    return formatPrice(minPrice, currency);
  }

  // Si hay entradas gratuitas y de pago.
  if (minPrice === 0) {
    return `Desde Gratis`;
  }

  // Si hay un rango de precios.
  return `Desde ${formatPrice(minPrice, currency)}`;
}

export default function EventCard({
  event,
  showOrganizerInfo = false,
}: EventCardProps) {
  const startDate = new Date(event.startDate);
  const now = new Date();
  const isPast = startDate < now;

  const totalCapacity = event.ticketTypes.reduce(
    (sum, type) => sum + (type.capacity || 0),
    0
  );
  const availableTickets = totalCapacity - event._count.tickets;
  const isSoldOut = availableTickets <= 0;

  // Llama a la nueva función para obtener el texto del precio.
  const displayPrice = getEventPriceDisplay(event.ticketTypes);

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
            {isSoldOut && !isPast && (
              <Badge variant="destructive">Agotado</Badge>
            )}
            {availableTickets <= 10 && availableTickets > 0 && !isPast && (
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
              {displayPrice !== "Gratis" &&
                displayPrice !== "No disponible" && (
                  <div className="text-xs text-muted-foreground">
                    Precio final
                  </div>
                )}
            </div>
            <div className="text-right text-sm">
              {!isPast && (
                <>
                  <div className="font-medium">
                    {availableTickets > 0
                      ? `${availableTickets} disponibles`
                      : "0 disponibles"}
                  </div>
                  <div className="text-muted-foreground">
                    de {totalCapacity} tickets
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
            <Button asChild className="w-full" disabled={isSoldOut && !isPast}>
              <Link href={`/events/${event.id}`}>
                {isPast
                  ? "Ver detalles"
                  : isSoldOut
                    ? "Agotado"
                    : "Comprar Tickets"}
              </Link>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
