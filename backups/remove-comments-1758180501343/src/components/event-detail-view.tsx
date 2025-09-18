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
  Shield,
  CheckCircle,
  Copy,
  Globe,
  X,
  Sparkles,
  Award,
} from "lucide-react";
import { calculateTotalPrice, formatPrice } from "@/lib/commission";
import { getCurrentPrice, type TicketTypeWithPricing } from "@/lib/pricing";
import TicketPurchaseForm from "@/components/ticket-purchase-form";
import PurchaseFlow from "@/components/purchase-flow";
import { formatFullDateTime } from "@/lib/date";
import { toast } from "sonner";

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
    allowCourtesy: boolean;
    hasSeatingPlan?: boolean;
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
      priceTiers?: Array<{
        id: string;
        name: string;
        price: number;
        currency: string;
        startDate: string;
        endDate?: string;
        isActive: boolean;
      }>;
    }>;
    sections?: Array<{
      id: string;
      name: string;
      color: string;
      basePrice: number;
      seatCount: number;
      rowCount: number;
      seatsPerRow: number;
      hasSeats: boolean;
      description?: string;
      seats: Array<{
        id: string;
        row: string;
        number: string;
        displayName: string;
        price: number;
        status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
        isAccessible: boolean;
        isReserved?: boolean;
        isAvailable?: boolean;
      }>;
    }>;
    _count: {
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
  const [showPurchaseFlow, setShowPurchaseFlow] = useState(false);
  const [isPublished, setIsPublished] = useState(event.isPublished);
  const [loadingPublish, setLoadingPublish] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const startDate = new Date(event.startDate);
  const endDate = event.endDate ? new Date(event.endDate) : null;
  const isPast = startDate < new Date();
  const isOwner = user && event.organizer.id === user.id;
  const isAdmin = user && user.role === "ADMIN";

  const displayPrice = getEventPriceDisplay(event.ticketTypes);

  function getEventPriceDisplay(
    ticketTypes: EventDetailViewProps["event"]["ticketTypes"]
  ) {
    if (!ticketTypes.length) return "No disponible";
    
    // Calcular precios dinámicos para cada ticket type
    const dynamicPrices = ticketTypes.map((t) => {
      if (!t.priceTiers || t.priceTiers.length === 0) {
        return calculateTotalPrice(t.price);
      }

      const ticketTypeWithPricing: TicketTypeWithPricing = {
        id: t.id,
        name: t.name,
        price: t.price,
        currency: t.currency,
        priceTiers: t.priceTiers.map(tier => ({
          ...tier,
          startDate: new Date(tier.startDate),
          endDate: tier.endDate ? new Date(tier.endDate) : null,
        })),
      };

      const currentPriceInfo = getCurrentPrice(ticketTypeWithPricing);
      return calculateTotalPrice(currentPriceInfo.price);
    });

    const min = Math.min(...dynamicPrices);
    const max = Math.max(...dynamicPrices);
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
    } catch {
      toast.error("Error de red al intentar actualizar el evento.");
    } finally {
      setLoadingPublish(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: `¡Mira este evento increíble! ${event.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("¡Enlace copiado al portapapeles!");
    }
  };

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    toast.success(
      isFavorited ? "Eliminado de favoritos" : "Agregado a favoritos"
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0053CC]/5 via-[#01CBFE]/5 to-[#CC66CC]/5 border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge
                    variant="outline"
                    className="bg-gradient-to-r from-[#0053CC] to-[#01CBFE] text-white border-0 px-4 py-2"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {event.category.name}
                  </Badge>

                  {!isPublished && (
                    <Badge variant="secondary" className="px-4 py-2">
                      <Edit className="w-4 h-4 mr-2" />
                      Borrador
                    </Badge>
                  )}

                  {isPast && (
                    <Badge variant="destructive" className="px-4 py-2">
                      <Clock className="w-4 h-4 mr-2" />
                      Finalizado
                    </Badge>
                  )}

                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                    {event.title}
                  </h1>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-lg">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] rounded-xl flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {formatFullDateTime(startDate)}
                        </p>
                        {endDate && (
                          <p className="text-sm text-muted-foreground">
                            Hasta {formatFullDateTime(endDate)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-lg">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#FE4F00] to-[#CC66CC] rounded-xl flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {event.location}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Ubicación del evento
                        </p>
                      </div>
                    </div>


                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-6">
                    <div className="space-y-2">
                      <div className="text-4xl font-bold bg-gradient-to-r from-[#0053CC] to-[#01CBFE] bg-clip-text text-transparent">
                        {displayPrice}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {displayPrice.startsWith("Desde")
                          ? "Precios desde"
                          : "Precio final incluye comisiones"}
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleFavorite}
                        className="border-2 hover:border-[#0053CC] transition-colors"
                      >
                        <Heart
                          className={`h-5 w-5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`}
                        />
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={handleShare}
                        className="border-2 hover:border-[#0053CC] transition-colors"
                      >
                        <Share2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                {event.imageUrl ? (
                  <div className="relative w-full max-w-2xl mx-auto">
                    <div className="relative aspect-square w-full rounded-2xl overflow-hidden shadow-2xl">
                      <div className="absolute -inset-4 bg-gradient-to-r from-[#0053CC] via-[#01CBFE] to-[#CC66CC] rounded-2xl opacity-20 blur-xl"></div>
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        className="object-contain relative z-10 rounded-2xl bg-white"
                        priority
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                      />
                    </div>

                  </div>
                ) : (
                  <div className="relative w-full max-w-2xl mx-auto">
                    <div className="aspect-square w-full rounded-2xl bg-gradient-to-br from-muted/50 to-muted flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <Calendar className="h-16 w-16 mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground font-medium">
                          Imagen del evento
                        </p>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-r from-[#01CBFE] to-[#0053CC] rounded-full opacity-10 blur-2xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-[#CC66CC] to-[#FE4F00] rounded-full opacity-10 blur-xl"></div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {event.description && (
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
                      <CardTitle className="flex items-center gap-3 text-xl">
                        <div className="w-10 h-10 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] rounded-lg flex items-center justify-center">
                          <ExternalLink className="h-5 w-5 text-white" />
                        </div>
                        Sobre este evento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="prose prose-gray max-w-none">
                        <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-wrap">
                          {event.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      Organizador
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <div className="flex items-start gap-6">
                      <Avatar className="h-20 w-20 border-4 border-gradient-to-r from-[#0053CC] to-[#01CBFE]">
                        <AvatarImage
                          src={event.organizer.imageUrl}
                          alt={organizerName}
                        />
                        <AvatarFallback className="text-2xl font-bold bg-gradient-to-r from-[#0053CC] to-[#01CBFE] text-white">
                          {organizerName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 space-y-3">
                        <div>
                          <h3 className="text-2xl font-bold">
                            {organizerName}
                          </h3>
                          <p className="text-muted-foreground">
                            Organizador de eventos
                          </p>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          <span>{event.organizer.email}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            Verificado
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <Shield className="w-3 h-3 mr-1" />
                            Confiable
                          </Badge>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="hover:border-[#0053CC] transition-colors"
                        >
                          <Link href={`/organizer/${event.organizer.id}`}>
                            <Globe className="h-4 w-4 mr-2" />
                            Ver perfil del organizador
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="sticky top-6 border-0 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-[#0053CC]/10 to-[#01CBFE]/10">
                    <CardTitle className="text-center text-2xl">
                      {isPast ? "Evento finalizado" : "Reserva tu lugar"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-6">
                    <div className="text-center p-6 bg-gradient-to-br from-[#0053CC]/5 to-[#01CBFE]/5 rounded-xl border-2 border-[#0053CC]/20">
                      <div className="text-4xl font-bold bg-gradient-to-r from-[#0053CC] to-[#01CBFE] bg-clip-text text-transparent mb-2">
                        {displayPrice}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {displayPrice.startsWith("Desde")
                          ? "Precios desde"
                          : "Precio final con comisiones"}
                      </div>
                      {!displayPrice.includes("Gratis") && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Incluye 6% de comisión de la plataforma
                        </p>
                      )}
                    </div>

                    {(isOwner || isAdmin) && (
                      <div className="space-y-4 p-4 bg-gradient-to-r from-muted/30 to-transparent rounded-xl border">
                        <div className="flex items-center gap-2">
                          <Settings className="h-5 w-5 text-[#0053CC]" />
                          <span className="font-semibold">
                            Panel de organizador
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="border-2 hover:border-[#0053CC]"
                          >
                            <Link href={`/organizer/events/${event.id}/edit`}>
                              <Edit className="h-4 w-4 mr-1" />
                              Editar
                            </Link>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="border-2 hover:border-[#0053CC]"
                          >
                            <Link href={`/dashboard/events/${event.id}`}>
                              <Settings className="h-4 w-4 mr-1" />
                              Gestión
                            </Link>
                          </Button>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePublishToggle}
                          disabled={loadingPublish}
                          className="w-full border-2 hover:border-[#0053CC]"
                        >
                          {loadingPublish ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : isPublished ? (
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
                        </Button>
                      </div>
                    )}

                    {}
                    <div className="space-y-4">
                      {isPast ? (
                        <Button disabled className="w-full" size="lg">
                          <Clock className="h-5 w-5 mr-2" />
                          Evento finalizado
                        </Button>
                      ) : user ? (
                        event.hasSeatingPlan ? (
                          <div className="space-y-3">
                            <Button
                              asChild
                              className="w-full bg-gradient-to-r from-[#0053CC] to-[#01CBFE] hover:from-[#0053CC]/90 hover:to-[#01CBFE]/90"
                              size="lg"
                            >
                              <Link href={`/events/${event.id}/tickets/seating`}>
                                <Ticket className="h-5 w-5 mr-2" />
                                Seleccionar Asientos
                              </Link>
                            </Button>
                            <Button
                              onClick={() => event.hasSeatingPlan && event.sections && event.sections.length > 0 
                                ? setShowPurchaseFlow(true) 
                                : setShowPurchaseForm(true)
                              }
                              variant="outline"
                              className="w-full"
                              size="lg"
                            >
                              <Ticket className="h-5 w-5 mr-2" />
                              {event.hasSeatingPlan && event.sections && event.sections.length > 0 
                                ? "Compra con Selección de Asientos"
                                : "Compra Rápida (Sin Asiento Específico)"
                              }
                            </Button>
                          </div>
                        ) : (
                          <Button
                            onClick={() => event.hasSeatingPlan && event.sections && event.sections.length > 0 
                              ? setShowPurchaseFlow(true) 
                              : setShowPurchaseForm(true)
                            }
                            className="w-full bg-gradient-to-r from-[#0053CC] to-[#01CBFE] hover:from-[#0053CC]/90 hover:to-[#01CBFE]/90"
                            size="lg"
                          >
                            <Ticket className="h-5 w-5 mr-2" />
                            Comprar Entradas
                          </Button>
                        )
                      ) : (
                        <Button
                          asChild
                          className="w-full bg-gradient-to-r from-[#0053CC] to-[#01CBFE] hover:from-[#0053CC]/90 hover:to-[#01CBFE]/90"
                          size="lg"
                        >
                          <Link href="/sign-in">
                            <Ticket className="h-5 w-5 mr-2" />
                            Iniciar sesión para comprar
                          </Link>
                        </Button>
                      )}

                      {user && userTicketsCount > 0 && (
                        <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                          <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300 font-medium mb-2">
                            <CheckCircle className="h-5 w-5" />
                            <span>¡Ya tienes entradas!</span>
                          </div>
                          <p className="text-sm text-green-600 dark:text-green-400 mb-3">
                            Tienes {userTicketsCount} entrada
                            {userTicketsCount > 1 ? "s" : ""} para este evento
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                            className="border-green-300 hover:border-green-400 text-green-700 hover:text-green-800"
                          >
                            <Link href="/tickets">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver mis tickets
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#CC66CC] to-[#FE4F00] rounded-lg flex items-center justify-center">
                        <Calendar className="h-4 w-4 text-white" />
                      </div>
                      Información del evento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-muted/50">
                        <span className="text-muted-foreground">Categoría</span>
                        <Badge
                          variant="outline"
                          className="bg-gradient-to-r from-[#0053CC] to-[#01CBFE] text-white border-0"
                        >
                          {event.category.name}
                        </Badge>
                      </div>

                      <div className="flex justify-between items-center py-2 border-b border-muted/50">
                        <span className="text-muted-foreground">
                          Órdenes realizadas
                        </span>
                        <span className="font-semibold">
                          {event._count.orders.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-2">
                        <span className="text-muted-foreground">Estado</span>
                        <Badge
                          variant={
                            isPast
                              ? "destructive"
                              : isPublished
                                ? "default"
                                : "secondary"
                          }
                          className={
                            isPublished && !isPast
                              ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-0"
                              : ""
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

                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#01CBFE] to-[#CC66CC] rounded-lg flex items-center justify-center">
                        <Shield className="h-4 w-4 text-white" />
                      </div>
                      Garantías SorykPass
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] rounded-full"></div>
                        <span className="text-sm">
                          Ticket digital instantáneo
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-[#FE4F00] to-[#CC66CC] rounded-full"></div>
                        <span className="text-sm">
                          Código QR único e intransferible
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] rounded-full"></div>
                        <span className="text-sm">
                          Validación en tiempo real
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-[#CC66CC] to-[#01CBFE] rounded-full"></div>
                        <span className="text-sm">Soporte técnico 24/7</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-[#01CBFE] to-[#0053CC] rounded-full"></div>
                        <span className="text-sm">
                          Transacciones 100% seguras
                        </span>
                      </div>
                      {!displayPrice.includes("Gratis") && (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-gradient-to-r from-[#FE4F00] to-[#FDBD00] rounded-full"></div>
                          <span className="text-sm">
                            Reembolsos hasta 24h antes del evento
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-[#0053CC]/5 to-[#01CBFE]/5 rounded-lg border border-[#0053CC]/20">
                      <div className="flex items-center gap-2 text-sm font-medium text-[#0053CC] mb-2">
                        <Sparkles className="h-4 w-4" />
                        Compra protegida
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Tu compra está protegida por las políticas de seguridad
                        de SorykPass. Compra con confianza y disfruta tu evento.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
                    <CardTitle className="flex items-center gap-3 text-lg">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#FDBD00] to-[#CC66CC] rounded-lg flex items-center justify-center">
                        <Share2 className="h-4 w-4 text-white" />
                      </div>
                      Compartir evento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full justify-start border-2 hover:border-[#0053CC] transition-colors"
                        onClick={handleShare}
                      >
                        <Copy className="h-4 w-4 mr-3" />
                        Copiar enlace
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showPurchaseForm && user && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-background rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border-2 shadow-2xl">
            <div className="sticky top-0 bg-background/95 backdrop-blur-sm p-6 border-b z-10">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-[#0053CC] to-[#01CBFE] bg-clip-text text-transparent">
                    Comprar Entradas
                  </h2>
                  <p className="text-muted-foreground">
                    {event.title} • {formatFullDateTime(startDate)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPurchaseForm(false)}
                  className="h-12 w-12 rounded-full hover:bg-muted"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>

            <div className="p-6">
              <TicketPurchaseForm
                event={{
                  ...event,
                  capacity: 0,
                  price: event.ticketTypes.length > 0 ? Math.min(...event.ticketTypes.map(t => t.price)) : 0,
                  currency: event.ticketTypes.length > 0 ? event.ticketTypes[0].currency : "CLP",
                  isFree: event.ticketTypes.every(t => t.price === 0),
                  categoryId: event.category.name,
                  organizerId: event.organizer.id,
                  description: event.description ?? "",
                  category: {
                    id: event.category.name,
                    name: event.category.name,
                  },
                  organizer: {
                    ...event.organizer,
                    firstName: event.organizer.firstName ?? null,
                    lastName: event.organizer.lastName ?? null,
                    role: "ORGANIZER" as const,
                  },
                  ticketTypes: event.ticketTypes.map((t) => ({
                    id: t.id,
                    name: t.name,
                    description: t.description ?? undefined,
                    price: t.price,
                    capacity: t.capacity,
                    currency: t.currency,
                    eventId: event.id,
                    ticketsGenerated: 1,
                  })),
                }}
                ticketTypes={event.ticketTypes.map((t) => ({
                  id: t.id,
                  name: t.name,
                  description: t.description ?? undefined,
                  price: t.price,
                  capacity: t.capacity,
                  currency: t.currency,
                  eventId: event.id,
                  ticketsGenerated: 1,
                }))}
              />
            </div>
          </div>
        </div>
      )}

      {/* New Purchase Flow with Seat Selection */}
      {showPurchaseFlow && event.sections && (
        <PurchaseFlow
          event={{
            id: event.id,
            title: event.title,
            startDate: event.startDate,
            location: event.location,
            hasSeatingPlan: event.hasSeatingPlan || false
          }}
          eventId={event.id}
          sections={event.sections}
          isOpen={showPurchaseFlow}
          onClose={() => setShowPurchaseFlow(false)}
        />
      )}
    </div>
  );
}
