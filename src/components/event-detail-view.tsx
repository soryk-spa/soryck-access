"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  User,
  Share2,
  Heart,
  Edit,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Ticket,
  DollarSign,
  ArrowLeft,
  Star,
  Building,
  Mail,
} from "lucide-react";
import TicketPurchaseSection from "./ticket-purchase-section";
import { UserRole } from "@prisma/client";

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
    imageUrl: string | null;
  };
  _count: {
    tickets: number;
    orders: number;
  };
}

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  imageUrl: string | null;
}

interface EventDetailViewProps {
  event: Event;
  user: User | null;
  userTicketsCount: number;
}

export default function EventDetailView({
  event,
  user,
  userTicketsCount,
}: EventDetailViewProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      full: date.toLocaleDateString("es-ES", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      day: date.getDate(),
      month: date.toLocaleDateString("es-ES", { month: "short" }),
      weekday: date.toLocaleDateString("es-ES", { weekday: "short" }),
      time: date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getOrganizerName = () => {
    if (event.organizer.firstName || event.organizer.lastName) {
      return `${event.organizer.firstName || ""} ${
        event.organizer.lastName || ""
      }`.trim();
    }
    return event.organizer.email.split("@")[0];
  };

  const getAvailability = () => {
    const available = event.capacity - event._count.tickets;
    const percentage = Math.round(
      (event._count.tickets / event.capacity) * 100
    );

    if (available === 0) {
      return {
        status: "sold-out",
        text: "Agotado",
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        available: 0,
      };
    } else if (percentage >= 90) {
      return {
        status: "almost-sold",
        text: "Últimas entradas",
        color:
          "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
        available,
      };
    } else if (percentage >= 70) {
      return {
        status: "filling-up",
        text: "Llenándose rápido",
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        available,
      };
    } else {
      return {
        status: "available",
        text: "Disponible",
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        available,
      };
    }
  };

  const isOwner = user && event.organizer.id === user.id;
  const isAdmin = user && user.role === "ADMIN";
  const canEdit = isOwner || isAdmin;
  const startDate = formatDate(event.startDate);
  const endDate = event.endDate ? formatDate(event.endDate) : null;
  const availability = getAvailability();
  const isEventPast = new Date(event.startDate) < new Date();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description || `Evento: ${event.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 pt-6">
        <Button variant="ghost" asChild className="mb-4 hover:bg-[#01CBFE]/10">
          <Link href="/events">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a Eventos
          </Link>
        </Button>
      </div>

      <div className="relative">
        <div className="container mx-auto px-4">
          <Card className="overflow-hidden border-0 shadow-xl">
            <div className="relative h-80 lg:h-96">
              {event.imageUrl ? (
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  className="object-cover"
                  priority
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    const fallback =
                      e.currentTarget.parentElement?.querySelector(
                        ".fallback-bg"
                      );
                    if (fallback) {
                      (fallback as HTMLElement).style.display = "flex";
                    }
                  }}
                />
              ) : null}

              <div
                className={`w-full h-full bg-gradient-to-br from-[#01CBFE]/20 via-[#0053CC]/20 to-[#CC66CC]/20 flex items-center justify-center fallback-bg ${
                  event.imageUrl ? "hidden" : "flex"
                }`}
              >
                <Calendar className="h-24 w-24 text-[#0053CC]/50" />
              </div>

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <div className="absolute top-6 left-6 bg-white/95 backdrop-blur rounded-xl p-4 shadow-xl">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#0053CC] mb-1">
                    {startDate.day}
                  </div>
                  <div className="text-sm text-muted-foreground uppercase font-medium">
                    {startDate.month}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {startDate.weekday}
                  </div>
                </div>
              </div>

              <div className="absolute top-6 right-6 flex flex-col gap-2">
                <Badge
                  variant="secondary"
                  className="bg-white/90 backdrop-blur text-[#0053CC] font-medium"
                >
                  {event.category.name}
                </Badge>
                {!event.isPublished && (
                  <Badge className="bg-yellow-500/90 text-white">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Borrador
                  </Badge>
                )}
                <Badge className={availability.color}>
                  {availability.text}
                </Badge>
              </div>

              <div className="absolute bottom-6 left-6 right-6 text-white">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 bg-black/30 backdrop-blur rounded-full px-3 py-1">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{startDate.time}</span>
                  </div>

                  <div className="flex items-center gap-2 bg-black/30 backdrop-blur rounded-full px-3 py-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm truncate max-w-48">
                      {event.location}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 bg-black/30 backdrop-blur rounded-full px-3 py-1">
                    <DollarSign className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {event.isFree ? "Gratis" : formatPrice(event.price)}
                    </span>
                  </div>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 leading-tight">
                  {event.title}
                </h1>

                <p className="text-lg text-white/90 capitalize mb-4">
                  {startDate.full}
                </p>

                {canEdit && (
                  <div className="flex gap-2">
                    <Button
                      asChild
                      size="sm"
                      className="bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] hover:from-[#FDBD00]/90 hover:to-[#FE4F00]/90"
                    >
                      <Link href={`/events/${event.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar Evento
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Ticket className="h-6 w-6 text-[#0053CC]" />
                    Acerca del Evento
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                      className="border-[#01CBFE] text-[#01CBFE] hover:bg-[#01CBFE] hover:text-white"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsFavorite(!isFavorite)}
                      className="border-[#FE4F00] text-[#FE4F00] hover:bg-[#FE4F00] hover:text-white"
                    >
                      <Heart
                        className={`h-4 w-4 mr-2 ${
                          isFavorite ? "fill-current" : ""
                        }`}
                      />
                      {isFavorite ? "Guardado" : "Guardar"}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="prose max-w-none">
                {event.description ? (
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {event.description}
                  </p>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                    <p className="text-muted-foreground italic">
                      El organizador no ha proporcionado una descripción para
                      este evento.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-6 w-6 text-[#0053CC]" />
                  Organizador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-[#01CBFE]/10 to-[#0053CC]/10 rounded-xl">
                  {event.organizer.imageUrl ? (
                    <Image
                      src={event.organizer.imageUrl}
                      alt={getOrganizerName()}
                      width={64}
                      height={64}
                      className="rounded-full object-cover border-2 border-[#01CBFE]"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-[#0053CC]">
                      {getOrganizerName()}
                    </h3>
                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                      <Mail className="h-4 w-4" />
                      <span className="text-sm">{event.organizer.email}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-6 w-6 text-[#FDBD00]" />
                  Estadísticas del Evento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-[#01CBFE]/10 to-[#0053CC]/10 rounded-xl">
                    <Ticket className="h-8 w-8 mx-auto mb-2 text-[#0053CC]" />
                    <div className="text-2xl font-bold text-[#0053CC]">
                      {event._count.tickets}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Tickets vendidos
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-[#FDBD00]/10 to-[#FE4F00]/10 rounded-xl">
                    <Users className="h-8 w-8 mx-auto mb-2 text-[#FE4F00]" />
                    <div className="text-2xl font-bold text-[#FE4F00]">
                      {availability.available}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Disponibles
                    </div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-[#CC66CC]/10 to-[#FE4F00]/10 rounded-xl">
                    <DollarSign className="h-8 w-8 mx-auto mb-2 text-[#CC66CC]" />
                    <div className="text-2xl font-bold text-[#CC66CC]">
                      {event._count.orders}
                    </div>
                    <div className="text-sm text-muted-foreground">Órdenes</div>
                  </div>

                  <div className="text-center p-4 bg-gradient-to-br from-[#FE4F00]/10 to-[#FDBD00]/10 rounded-xl">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-[#FDBD00]" />
                    <div className="text-2xl font-bold text-[#FDBD00]">
                      {Math.round(
                        (event._count.tickets / event.capacity) * 100
                      )}
                      %
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Ocupación
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between text-sm text-muted-foreground mb-2">
                    <span>Capacidad total: {event.capacity}</span>
                    <span>{event._count.tickets} vendidos</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-[#01CBFE] to-[#0053CC] h-3 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          (event._count.tickets / event.capacity) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {user && userTicketsCount > 0 && (
              <Card className="border-2 border-green-200 bg-green-50 dark:bg-green-950 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <CheckCircle className="h-5 w-5" />
                    Mis Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="text-3xl font-bold text-green-600">
                      {userTicketsCount}
                    </div>
                    <p className="text-green-700 dark:text-green-300">
                      Ticket{userTicketsCount > 1 ? "s" : ""} confirmado
                      {userTicketsCount > 1 ? "s" : ""}
                    </p>
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-green-600 to-green-700"
                    >
                      <Link href="/dashboard">
                        <Eye className="w-4 h-4 mr-2" />
                        Ver mis tickets
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {!isEventPast && event.isPublished && (
              <TicketPurchaseSection
                event={event}
                user={user}
                availability={availability}
                userTicketsCount={userTicketsCount}
              />
            )}

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#0053CC]" />
                  Detalles del Evento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between py-2 border-b border-muted">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha
                    </span>
                    <span className="font-medium text-right">
                      {startDate.full}
                    </span>
                  </div>

                  {endDate && (
                    <div className="flex items-start justify-between py-2 border-b border-muted">
                      <span className="text-muted-foreground flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Fin
                      </span>
                      <span className="font-medium text-right">
                        {endDate.full}
                      </span>
                    </div>
                  )}

                  <div className="flex items-start justify-between py-2 border-b border-muted">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Hora
                    </span>
                    <span className="font-medium">{startDate.time}</span>
                  </div>

                  <div className="flex items-start justify-between py-2 border-b border-muted">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Ubicación
                    </span>
                    <span className="font-medium text-right max-w-48">
                      {event.location}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-muted">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Precio
                    </span>
                    <span className="font-medium text-xl text-[#0053CC]">
                      {event.isFree ? "Gratis" : formatPrice(event.price)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-muted">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Capacidad
                    </span>
                    <span className="font-medium">
                      {event.capacity} personas
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2">
                    <span className="text-muted-foreground">Categoría</span>
                    <Badge className="bg-gradient-to-r from-[#01CBFE] to-[#0053CC] text-white">
                      {event.category.name}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isEventPast && (
              <Card className="border-2 border-orange-200 bg-orange-50 dark:bg-orange-950">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                    <AlertCircle className="h-5 w-5" />
                    <div>
                      <span className="font-medium">Evento Finalizado</span>
                      <p className="text-sm mt-1">
                        Este evento ya ha terminado.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!event.isPublished && !canEdit && (
              <Card className="border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                    <EyeOff className="h-5 w-5" />
                    <div>
                      <span className="font-medium">Evento No Publicado</span>
                      <p className="text-sm mt-1">
                        Este evento aún no está disponible públicamente.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
