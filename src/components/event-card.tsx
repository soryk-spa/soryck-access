"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Heart,
  Share2,
} from "lucide-react";
import { formatPrice } from "@/lib/commission";

interface TicketType {
  price: number;
  currency: string;
  capacity: number;
}

interface EventCardProps {
  event: {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    location: string;
    startDate: string;
    endDate?: string;
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
    ticketTypes: TicketType[];
  };
  showQuickActions?: boolean;
  variant?: "default" | "compact" | "featured";
}

export default function EventCard({
  event,
  showQuickActions = false,
  variant = "default",
}: EventCardProps) {
  const startDate = new Date(event.startDate);
  const now = new Date();
  const isPast = startDate < now;
  const isToday = startDate.toDateString() === now.toDateString();

  
  const prices = event.ticketTypes.map((t) => t.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const totalCapacity = event.ticketTypes.reduce(
    (sum, t) => sum + t.capacity,
    0
  );
  const availableTickets = totalCapacity - event._count.tickets;
  const isSoldOut = availableTickets <= 0;

  const priceDisplay = (() => {
    if (minPrice === 0 && maxPrice === 0) return "Gratis";
    if (minPrice === maxPrice) {
      return formatPrice(minPrice, event.ticketTypes[0]?.currency || "CLP");
    }
    if (minPrice === 0) return "Desde Gratis";
    return `Desde ${formatPrice(minPrice, event.ticketTypes[0]?.currency || "CLP")}`;
  })();

  const organizerName = event.organizer.firstName
    ? `${event.organizer.firstName} ${event.organizer.lastName || ""}`.trim()
    : event.organizer.email.split("@")[0];

  const formatEventDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return startDate.toLocaleDateString("es-ES", options);
  };

  const getStatusBadge = () => {
    if (isPast) return <Badge variant="secondary">Finalizado</Badge>;
    if (isSoldOut) return <Badge variant="destructive">Agotado</Badge>;
    if (isToday) return <Badge className="bg-green-500">Hoy</Badge>;
    
    return null; 
  };

  if (variant === "compact") {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden">
        <Link href={`/events/${event.id}`}>
          <div className="flex">
            {}
            <div className="relative w-24 h-24 flex-shrink-0 bg-muted rounded-l-lg overflow-hidden">
              <Image
                src={event.imageUrl || "/default-event.png"}
                alt={event.title}
                fill
                className="object-cover object-center"
                sizes="96px"
              />
            </div>
            <CardContent className="flex-1 p-4">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                  {getStatusBadge()}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{formatEventDate()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">{event.location}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    {event.category.name}
                  </Badge>
                  <span className="font-semibold text-sm text-primary">
                    {priceDisplay}
                  </span>
                </div>
              </div>
            </CardContent>
          </div>
        </Link>
      </Card>
    );
  }

  if (variant === "featured") {
    return (
      <Card className="group hover:shadow-2xl transition-all duration-300 overflow-hidden bg-gradient-to-br from-background to-muted/50">
        <div className="relative">
          {}
          <div className="relative h-80 overflow-hidden bg-muted">
            <Image
              src={event.imageUrl || "/default-event.png"}
              alt={event.title}
              fill
              className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {}
            <div className="absolute top-4 left-4">{getStatusBadge()}</div>

            {}
            {showQuickActions && (
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 backdrop-blur-sm"
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-8 w-8 backdrop-blur-sm"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {}
            <div className="absolute bottom-4 right-4">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                <span className="font-bold text-primary">{priceDisplay}</span>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <Badge variant="outline" className="mb-2">
                  {event.category.name}
                </Badge>
                <Link href={`/events/${event.id}`}>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {event.title}
                  </h3>
                </Link>
                <p className="text-muted-foreground text-sm line-clamp-2">
                  {event.description ||
                    "Evento organizado por " + organizerName}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>{formatEventDate()}</span>
                  {isToday && <Badge className="bg-green-500 ml-2">Hoy</Badge>}
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="truncate">{event.location}</span>
                </div>


              </div>
            </div>
          </CardContent>

          <CardFooter className="px-6 pb-6 pt-0">
            <Link href={`/events/${event.id}`} className="w-full">
              <Button
                className="w-full"
                disabled={isPast || isSoldOut}
                size="lg"
              >
                {isPast
                  ? "Evento finalizado"
                  : isSoldOut
                    ? "Agotado"
                    : "Ver detalles"}
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </div>
      </Card>
    );
  }

  
  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden bg-white dark:bg-card">
      <div className="relative">
        {}
        <div className="relative h-56 overflow-hidden bg-muted">
          <Image
            src={event.imageUrl || "/default-event.png"}
            alt={event.title}
            fill
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />

          {}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

          {}
          <div className="absolute top-3 left-3 z-10">{getStatusBadge()}</div>

          {}
          <div className="absolute bottom-3 right-3 z-10">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md">
              <span className="font-bold text-sm text-primary">
                {priceDisplay}
              </span>
            </div>
          </div>

          {}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>

        <CardContent className="p-5">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  {event.category.name}
                </Badge>
              </div>

              <Link href={`/events/${event.id}`}>
                <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                  {event.title}
                </h3>
              </Link>

              <p className="text-muted-foreground text-sm line-clamp-1">
                Por {organizerName}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 flex-shrink-0" />
                <span>{formatEventDate()}</span>
              </div>

              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span className="line-clamp-1">{event.location}</span>
              </div>


            </div>
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-0">
          <Link href={`/events/${event.id}`} className="w-full">
            <Button
              className="w-full"
              variant={isPast || isSoldOut ? "secondary" : "default"}
              disabled={isPast || isSoldOut}
              size="default"
            >
              {isPast
                ? "Evento finalizado"
                : isSoldOut
                  ? "Agotado"
                  : "Ver evento"}
              {!isPast && !isSoldOut && (
                <ExternalLink className="ml-2 h-4 w-4" />
              )}
            </Button>
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
}
