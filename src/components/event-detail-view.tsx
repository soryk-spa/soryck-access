"use client"
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  MapPin,
  User,
  Clock,
  Users,
  Share2,
  Edit,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { calculateTotalPrice, formatPrice } from "@/lib/commission";
import TicketPurchaseForm from "@/components/ticket-purchase-form";

interface EventDetailViewProps {
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
      imageUrl?: string;
    };
    _count: {
      tickets: number;
      orders: number;
    };
  };
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  } | null;
  userTicketsCount: number;
}

export default function EventDetailView({
  event,
  user,
  userTicketsCount,
}: EventDetailViewProps) {
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);

  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;
  const isUpcoming = startDate > new Date();
  const isPast = startDate < new Date();
  const availableTickets = event.capacity - event._count.tickets;
  const isSoldOut = availableTickets <= 0;
  const isOwner = user && event.organizer.id === user.id;
  const isAdmin = user && user.role === "ADMIN";
  const canManage = isOwner || isAdmin;

  const finalPrice = event.isFree ? 0 : calculateTotalPrice(event.price);
  const displayPrice = formatPrice(finalPrice, event.currency);

  const organizerName = event.organizer.firstName
    ? `${event.organizer.firstName} ${event.organizer.lastName || ""}`.trim()
    : event.organizer.email.split("@")[0];

  const formatEventDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `¡Mira este evento! ${event.title}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("¡Enlace copiado al portapapeles!");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="relative">
          {event.imageUrl && (
            <div className="relative h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden">
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-black/30" />

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <Badge className="mb-3 bg-white/20 text-white border-white/30">
                  {event.category.name}
                </Badge>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                  {event.title}
                </h1>

                <div className="flex items-center gap-4">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                    <div className="text-2xl font-bold">{displayPrice}</div>
                    {!event.isFree && (
                      <div className="text-sm opacity-90">Precio final</div>
                    )}
                  </div>

                  {!isPast && !isSoldOut && (
                    <Button
                      size="lg"
                      onClick={() => setShowPurchaseForm(true)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {event.isFree
                        ? "Registrarse Gratis"
                        : `Comprar desde ${displayPrice}`}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="absolute top-6 right-6 flex flex-col gap-2">
            {!event.isPublished && <Badge variant="secondary">Borrador</Badge>}
            {isPast && (
              <Badge variant="outline" className="bg-white/90">
                Evento finalizado
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
                ¡Últimos {availableTickets} tickets!
              </Badge>
            )}
          </div>
        </div>

        {!event.imageUrl && (
          <div className="text-center space-y-4">
            <Badge variant="outline" className="mb-2">
              {event.category.name}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold">{event.title}</h1>
            <div className="text-3xl font-bold text-primary">
              {displayPrice}
            </div>
            {!event.isFree && (
              <p className="text-muted-foreground">Precio final</p>
            )}
          </div>
        )}

        {canManage && (
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link href={`/events/${event.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Evento
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/dashboard/events/${event.id}/analytics`}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/dashboard/events/${event.id}/attendees`}>
                    <Users className="h-4 w-4 mr-2" />
                    Asistentes
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Detalles del Evento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Fecha de inicio</div>
                      <div className="text-muted-foreground">
                        {formatEventDate(startDate)}
                      </div>
                    </div>
                  </div>

                  {endDate && (
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Fecha de fin</div>
                        <div className="text-muted-foreground">
                          {formatEventDate(endDate)}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Ubicación</div>
                      <div className="text-muted-foreground">
                        {event.location}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Disponibilidad</div>
                      <div className="text-muted-foreground">
                        {availableTickets} de {event.capacity} disponibles
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {event.description && (
              <Card>
                <CardHeader>
                  <CardTitle>Descripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap text-muted-foreground">
                      {event.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Organizador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/organizer/${event.organizer.id}`} className="group">
                  <div className="flex items-center gap-4">
                      {event.organizer.imageUrl && (
                        <Image
                          src={event.organizer.imageUrl}
                          alt={organizerName}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{organizerName}</div>
                        <div className="text-sm text-muted-foreground">
                          Organizador del evento
                        </div>
                      </div>
                  </div>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-center">
                  {event.isFree ? "Registro Gratuito" : "Información de Compra"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {displayPrice}
                  </div>
                  {!event.isFree && (
                    <div className="text-sm text-muted-foreground">
                      Precio final (incluye comisión)
                    </div>
                  )}
                </div>

                <div className="text-center">
                  {isUpcoming ? (
                    <>
                      <div className="text-2xl font-bold text-green-600">
                        {availableTickets}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        tickets disponibles
                      </div>
                      {availableTickets <= 10 && availableTickets > 0 && (
                        <div className="text-sm text-orange-600 font-medium mt-1">
                          ¡Últimos tickets!
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-muted-foreground">
                      {event._count.tickets} personas asistieron
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-3">
                  {isPast ? (
                    <Button disabled className="w-full">
                      Evento finalizado
                    </Button>
                  ) : isSoldOut ? (
                    <Button disabled className="w-full">
                      Agotado
                    </Button>
                  ) : !user ? (
                    <div className="space-y-2">
                      <Button asChild className="w-full">
                        <Link href="/sign-in">Inicia sesión para comprar</Link>
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        ¿No tienes cuenta?{" "}
                        <Link
                          href="/sign-up"
                          className="text-primary hover:underline"
                        >
                          Regístrate gratis
                        </Link>
                      </p>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setShowPurchaseForm(true)}
                      className="w-full"
                      size="lg"
                    >
                      {event.isFree
                        ? "Registrarse Gratis"
                        : `Comprar Tickets - ${displayPrice}`}
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="w-full"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir evento
                  </Button>
                </div>

                {userTicketsCount > 0 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Ya tienes {userTicketsCount} ticket
                      {userTicketsCount > 1 ? "s" : ""} para este evento
                    </div>
                  </div>
                )}

                <div className="text-xs text-muted-foreground space-y-1">
                  <div>✓ Confirmación instantánea</div>
                  <div>✓ Tickets digitales seguros</div>
                  {!event.isFree && <div>✓ Reembolso hasta 24h antes</div>}
                  <div>✓ Soporte técnico 24/7</div>
                </div>
              </CardContent>
            </Card>

            {canManage && (
              <Card>
                <CardHeader>
                  <CardTitle>Estadísticas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Tickets vendidos:
                    </span>
                    <span className="font-medium">{event._count.tickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Órdenes totales:
                    </span>
                    <span className="font-medium">{event._count.orders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ocupación:</span>
                    <span className="font-medium">
                      {((event._count.tickets / event.capacity) * 100).toFixed(
                        1
                      )}
                      %
                    </span>
                  </div>
                  {!event.isFree && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Ingresos base:
                        </span>
                        <span className="font-medium">
                          {formatPrice(
                            event.price * event._count.tickets,
                            event.currency
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Ingresos totales:
                        </span>
                        <span className="font-medium text-green-600">
                          {formatPrice(
                            finalPrice * event._count.tickets,
                            event.currency
                          )}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {showPurchaseForm && user && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">
                    {event.isFree ? "Registro Gratuito" : "Comprar Tickets"}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPurchaseForm(false)}
                  >
                    ✕
                  </Button>
                </div>

                <TicketPurchaseForm
                  event={event}
                  userTicketsCount={userTicketsCount}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
