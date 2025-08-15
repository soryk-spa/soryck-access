"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Share2,
  Heart,
  ExternalLink,
  Ticket,
  Mail,
  Edit,
  Eye,
  Settings,
  EyeOff,
  Loader2,
} from "lucide-react";
import { calculateTotalPrice, formatPrice } from "@/lib/commission";
import TicketPurchaseForm from "@/components/ticket-purchase-form";
import { formatFullDateTime } from "@/lib/date"; // Importación actualizada
import { toast } from "sonner";

// Define the props type for EventDetailView
type EventDetailViewProps = {
  event: {
    id: string;
    title: string;
    description?: string;
    startDate: string;
    endDate?: string;
    location: string;
    imageUrl?: string;
    isPublished: boolean;
    category: { name: string };
    organizer: {
      id: string;
      firstName?: string;
      lastName?: string;
      email: string;
      imageUrl?: string;
    };
    ticketTypes: Array<{
      id: string;
      name: string;
      description?: string;
      price: number;
      currency: string;
      capacity: number;
      _count: { tickets: number };
    }>;
    _count: {
      tickets: number;
      orders: number;
    };
  };
  user?: {
    id: string;
    role: string;
    email: string;
  } | null;
  userTicketsCount: number;
};

export default function EventDetailView({
  event,
  user,
  userTicketsCount,
}: EventDetailViewProps) {
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);
  const [isPublished, setIsPublished] = useState(event.isPublished);
  const [loadingPublish, setLoadingPublish] = useState(false);

  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;
  const isPast = startDate < new Date();
  const isOwner = user && event.organizer.id === user.id;
  const isAdmin = user && user.role === "ADMIN";

  const totalCapacity = event.ticketTypes.reduce(
    (sum, type) => sum + type.capacity,
    0
  );
  const availableTickets = totalCapacity - event._count.tickets;
  const isSoldOut = availableTickets <= 0;

  const displayPrice = getEventPriceDisplay(event.ticketTypes);

  // Helper to display event price range or "Gratis"
  function getEventPriceDisplay(
    ticketTypes: EventDetailViewProps["event"]["ticketTypes"]
  ) {
    if (!ticketTypes.length) return "No disponible";
    const prices = ticketTypes.map((t) => calculateTotalPrice(t.price));
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const currency = ticketTypes[0].currency;
    if (min === 0 && max === 0) return "Gratis";
    if (min === max) return formatPrice(min, currency);
    return `Desde ${formatPrice(min, currency)}`;
  }
  const organizerName = event.organizer.firstName
    ? `${event.organizer.firstName} ${event.organizer.lastName || ""}`.trim()
    : event.organizer.email.split("@")[0];

  const handlePublishToggle = async () => {
    setLoadingPublish(true);
    try {
      const response = await fetch(`/api/events/${event.id}/publish`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublished: !isPublished }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsPublished(!isPublished);
        toast.success(data.message);
      } else {
        toast.error(data.error || "Error al actualizar el evento");
      }
    } catch (error) {
      toast.error("Error de red al intentar actualizar el evento.");
    } finally {
      setLoadingPublish(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="relative mb-8 rounded-2xl overflow-hidden bg-gradient-to-r from-background to-muted/50">
          <div className="grid lg:grid-cols-2 gap-8 items-center p-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm">
                    {event.category.name}
                  </Badge>
                  {!isPublished && <Badge variant="secondary">Borrador</Badge>}
                  {isPast && <Badge variant="destructive">Finalizado</Badge>}
                  {isSoldOut && !isPast && (
                    <Badge variant="destructive">Agotado</Badge>
                  )}
                </div>

                <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
                  {event.title}
                </h1>

                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <span className="text-lg">
                      {formatFullDateTime(startDate)}
                    </span>
                  </div>
                  {endDate && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span>Hasta {formatFullDateTime(endDate)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span className="text-lg">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    <span>
                      {isSoldOut
                        ? "Agotado"
                        : `${availableTickets} tickets disponibles`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4">
                  <div className="text-3xl font-bold text-primary">
                    {displayPrice}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              {event.imageUrl && (
                <div className="relative h-80 lg:h-96 rounded-xl overflow-hidden shadow-2xl">
                  <Image
                    src={event.imageUrl}
                    alt={event.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Descripción */}
            {event.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="h-5 w-5" />
                    Sobre este evento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {event.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tipos de entrada */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Entradas Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.ticketTypes.map((ticketType) => {
                  const typePrice = calculateTotalPrice(ticketType.price);
                  const ticketsSoldForType = ticketType._count.tickets;
                  const availableForType =
                    ticketType.capacity - ticketsSoldForType;
                  const isTypeSoldOut = availableForType <= 0;

                  return (
                    <div
                      key={ticketType.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="font-semibold text-lg">
                          {ticketType.name}
                        </p>
                        {ticketType.description && (
                          <p className="text-sm text-muted-foreground">
                            {ticketType.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>
                            {isTypeSoldOut
                              ? "Agotado"
                              : `${availableForType} disponibles`}
                          </span>
                          <span>•</span>
                          <span>de {ticketType.capacity} totales</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-2xl text-primary">
                          {formatPrice(typePrice, ticketType.currency)}
                        </p>
                        {isTypeSoldOut && (
                          <Badge variant="destructive" className="mt-1">
                            Agotado
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Organizador */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Organizador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={event.organizer.imageUrl}
                      alt={organizerName}
                    />
                    <AvatarFallback className="text-lg font-semibold">
                      {organizerName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{organizerName}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{event.organizer.email}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Organizador de eventos en SorykPass
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Panel de compra */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-center">
                  {isPast ? "Evento finalizado" : "Comprar Entradas"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {displayPrice}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {displayPrice.startsWith("Desde")
                      ? "Precios desde"
                      : "Precio final con comisiones"}
                  </div>
                </div>

                {/* Acciones según estado y permisos */}
                <div className="space-y-3">
                  {(isOwner || isAdmin) && (
                    <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm font-medium">
                        Panel de organizador:
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/events/${event.id}/edit`}>
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a href={`/dashboard/events/${event.id}`}>
                            <Settings className="h-4 w-4 mr-1" />
                            Gestión
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePublishToggle}
                          disabled={loadingPublish}
                        >
                          {loadingPublish ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : isPublished ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-1" />
                              Borrador
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-1" />
                              Publicar
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}

                  {isPast ? (
                    <Button disabled className="w-full" size="lg">
                      <Clock className="h-4 w-4 mr-2" />
                      Evento finalizado
                    </Button>
                  ) : isSoldOut ? (
                    <Button disabled className="w-full" size="lg">
                      <Ticket className="h-4 w-4 mr-2" />
                      Agotado
                    </Button>
                  ) : user ? (
                    <div className="space-y-2">
                      <Button
                        onClick={() => setShowPurchaseForm(true)}
                        className="w-full"
                        size="lg"
                      >
                        <Ticket className="h-4 w-4 mr-2" />
                        Comprar Entradas
                      </Button>
                    </div>
                  ) : (
                    <Button asChild className="w-full" size="lg">
                      <Link href="/sign-in">
                        <Ticket className="h-4 w-4 mr-2" />
                        Iniciar sesión para comprar
                      </Link>
                    </Button>
                  )}

                  {user && userTicketsCount > 0 && (
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-sm font-medium text-green-700 dark:text-green-300">
                        Ya tienes {userTicketsCount} ticket
                        {userTicketsCount > 1 ? "s" : ""} para este evento
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        asChild
                      >
                        <a href="/tickets">
                          <Eye className="h-4 w-4 mr-1" />
                          Ver mis tickets
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Información adicional */}
            <Card>
              <CardHeader>
                <CardTitle>Información del evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Categoría:</span>
                    <Badge variant="outline">{event.category.name}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Capacidad total:
                    </span>
                    <span className="font-medium">
                      {totalCapacity} personas
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Tickets vendidos:
                    </span>
                    <span className="font-medium">{event._count.tickets}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Órdenes realizadas:
                    </span>
                    <span className="font-medium">{event._count.orders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estado:</span>
                    <Badge
                      variant={
                        isPast
                          ? "destructive"
                          : isPublished
                            ? "default"
                            : "secondary"
                      }
                    >
                      {isPast
                        ? "Finalizado"
                        : isPublished
                          ? "Publicado"
                          : "Borrador"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Garantías */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Garantías SorykPass</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Ticket digital instantáneo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Código QR único e intransferible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Validación en tiempo real</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Soporte 24/7</span>
                  </div>
                  {!displayPrice.includes("Gratis") && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Reembolsos hasta 24h antes</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal de compra */}
        {showPurchaseForm && user && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold">Comprar Entradas</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPurchaseForm(false)}
                    className="h-10 w-10"
                  >
                    ✕
                  </Button>
                </div>
                <TicketPurchaseForm
                  event={{
                    ...event,
                    organizer: {
                      ...event.organizer,
                      firstName: event.organizer.firstName ?? null,
                      lastName: event.organizer.lastName ?? null,
                    },
                    // Mantener compatibilidad con el formulario existente
                    price: event.ticketTypes[0]?.price ?? 0,
                    currency: event.ticketTypes[0]?.currency ?? "CLP",
                    isFree: event.ticketTypes.every((t) => t.price === 0),
                    capacity: totalCapacity,
                    ticketTypes: event.ticketTypes.map((t) => ({
                      ...t,
                      description: t.description ?? null,
                    })),
                  }}
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
