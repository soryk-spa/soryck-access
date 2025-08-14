"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Minus,
  Plus,
  Shield,
  Info,
  Clock,
  MapPin,
  User,
  AlertCircle,
  Ticket,
  CheckCircle,
} from "lucide-react";
import { usePayment } from "@/hooks/use-payment";
import { calculateTotalPrice, formatPrice } from "@/lib/commission";
import PriceDisplay from "@/components/price-display";

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  capacity: number;
  _count: { tickets: number };
}

interface Event {
  id: string;
  title: string;
  description?: string | null;
  location: string;
  startDate: string;
  endDate?: string | null;
  imageUrl?: string | null;
  organizer: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  category: {
    name: string;
  };
  _count: {
    tickets: number;
  };
  // Para compatibilidad con la interfaz existente
  price?: number;
  currency?: string;
  isFree?: boolean;
  capacity?: number;
  // Nuevos campos para tipos de entrada
  ticketTypes?: TicketType[];
}

interface TicketPurchaseFormProps {
  event: Event;
  userTicketsCount?: number;
}

export default function TicketPurchaseForm({
  event,
  userTicketsCount = 0,
}: TicketPurchaseFormProps) {
  const [selectedTicketType, setSelectedTicketType] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [showPriceBreakdown] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const { processPayment, loading, error } = usePayment();

  // Usar ticketTypes si están disponibles, sino usar los valores legacy
  const ticketTypes = event.ticketTypes || [
    {
      id: "legacy",
      name: "Entrada General",
      description: null,
      price: event.price || 0,
      currency: event.currency || "CLP",
      capacity: event.capacity || 0,
      _count: { tickets: event._count.tickets },
    },
  ];

  const selectedType = ticketTypes.find((t) => t.id === selectedTicketType);
  const totalPrice = selectedType
    ? calculateTotalPrice(selectedType.price) * quantity
    : 0;
  const isFree = selectedType
    ? selectedType.price === 0
    : event.isFree || false;

  // Establecer el primer tipo disponible como seleccionado por defecto
  useState(() => {
    const firstAvailable = ticketTypes.find(
      (t) => t.capacity - t._count.tickets > 0
    );
    if (firstAvailable && !selectedTicketType) {
      setSelectedTicketType(firstAvailable.id);
    }
  });

  const availableTicketsForType = selectedType
    ? selectedType.capacity - selectedType._count.tickets
    : 0;

  const isEventFull = ticketTypes.every(
    (t) => t.capacity - t._count.tickets <= 0
  );
  const isEventPast = new Date(event.startDate) < new Date();
  const maxQuantityAllowed = Math.min(
    availableTicketsForType,
    10 - userTicketsCount
  );

  const organizerName = event.organizer.firstName
    ? `${event.organizer.firstName} ${event.organizer.lastName || ""}`.trim()
    : event.organizer.email.split("@")[0];

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantityAllowed) {
      setQuantity(newQuantity);
    }
  };

  const handlePurchase = async () => {
    if (!selectedType) {
      alert("Selecciona un tipo de entrada");
      return;
    }

    if (!agreeToTerms && !isFree) {
      alert("Debes aceptar los términos y condiciones");
      return;
    }

    await processPayment({
      ticketTypeId: selectedType.id,
      quantity,
    });
  };

  const formatEventDate = () => {
    const start = new Date(event.startDate);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return start.toLocaleDateString("es-ES", options);
  };

  const canPurchase =
    !isEventFull && !isEventPast && !loading && quantity > 0 && selectedType;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header del evento */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
              <Image
                src={event.imageUrl || "/default-event.png"}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="flex-1 space-y-2">
              <CardTitle className="text-2xl">{event.title}</CardTitle>
              <Badge variant="outline">{event.category.name}</Badge>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{formatEventDate()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Por {organizerName}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Alertas de estado */}
      {isEventPast && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Este evento ya finalizó. No es posible comprar tickets.
          </AlertDescription>
        </Alert>
      )}

      {isEventFull && !isEventPast && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Este evento está agotado. No hay tickets disponibles.
          </AlertDescription>
        </Alert>
      )}

      {userTicketsCount > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Ya tienes {userTicketsCount} ticket(s) para este evento. Puedes
            comprar hasta {10 - userTicketsCount} tickets adicionales.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Selección de tipo de entrada */}
      {canPurchase && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Selecciona tu entrada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={selectedTicketType}
              onValueChange={setSelectedTicketType}
              className="space-y-4"
            >
              {ticketTypes.map((ticketType) => {
                const typePrice = calculateTotalPrice(ticketType.price);
                const availableForType =
                  ticketType.capacity - ticketType._count.tickets;
                const isTypeSoldOut = availableForType <= 0;

                return (
                  <div
                    key={ticketType.id}
                    className={`relative p-4 border rounded-lg transition-all ${
                      selectedTicketType === ticketType.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    } ${isTypeSoldOut ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem
                        value={ticketType.id}
                        id={ticketType.id}
                        disabled={isTypeSoldOut}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <Label
                              htmlFor={ticketType.id}
                              className="text-lg font-semibold cursor-pointer"
                            >
                              {ticketType.name}
                            </Label>
                            {ticketType.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {ticketType.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
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
                            <div className="text-2xl font-bold text-primary">
                              {formatPrice(typePrice, ticketType.currency)}
                            </div>
                            {isTypeSoldOut && (
                              <Badge variant="destructive" className="mt-1">
                                Agotado
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    {selectedTicketType === ticketType.id && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </div>
                );
              })}
            </RadioGroup>

            {/* Selector de cantidad */}
            {selectedType && (
              <div className="space-y-4">
                <Separator />
                <div className="space-y-3">
                  <Label htmlFor="quantity">Cantidad de tickets</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1 || loading}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>

                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      max={maxQuantityAllowed}
                      value={quantity}
                      onChange={(e) =>
                        handleQuantityChange(parseInt(e.target.value) || 1)
                      }
                      className="w-24 text-center"
                      disabled={loading}
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= maxQuantityAllowed || loading}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>

                    <div className="text-sm text-muted-foreground">
                      <div>Máx: {maxQuantityAllowed}</div>
                      <div>{availableTicketsForType} disponibles</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Resumen de precio */}
            {selectedType && (
              <>
                <Separator />
                <PriceDisplay
                  basePrice={selectedType.price}
                  quantity={quantity}
                  currency={selectedType.currency}
                  showBreakdown={showPriceBreakdown}
                  variant="detailed"
                />
              </>
            )}

            {/* Información de pago seguro */}
            <div className="space-y-3">
              <Separator />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-green-600" />
                <span>Pago 100% seguro con Webpay</span>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline" className="text-xs">
                  Visa
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Mastercard
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Redcompra
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Débito
                </Badge>
              </div>
            </div>

            {/* Términos y condiciones */}
            {!isFree && (
              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground"
                >
                  Acepto los{" "}
                  <a href="/terms" className="text-primary hover:underline">
                    términos y condiciones
                  </a>{" "}
                  y la{" "}
                  <a href="/privacy" className="text-primary hover:underline">
                    política de privacidad
                  </a>
                  . Entiendo que los reembolsos están disponibles hasta 24 horas
                  antes del evento.
                </label>
              </div>
            )}

            {/* Botón de compra */}
            <Button
              onClick={handlePurchase}
              disabled={loading || (!agreeToTerms && !isFree) || !selectedType}
              className="w-full h-12 text-lg"
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Procesando...
                </>
              ) : isFree ? (
                `Registrarse Gratis ${
                  quantity > 1 ? `(${quantity} tickets)` : ""
                }`
              ) : (
                `Pagar ${formatPrice(totalPrice, selectedType?.currency)} ${
                  quantity > 1 ? `(${quantity} tickets)` : ""
                }`
              )}
            </Button>

            {/* Garantías */}
            <div className="text-xs text-muted-foreground space-y-2 pt-4 border-t">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-foreground mb-2">
                    ✅ Garantías
                  </h5>
                  <ul className="space-y-1">
                    <li>• Ticket digital instantáneo</li>
                    <li>• Código QR único e intransferible</li>
                    <li>• Validación en tiempo real</li>
                    {!isFree && <li>• Reembolsos hasta 24h antes</li>}
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-foreground mb-2">
                    📱 Recibirás
                  </h5>
                  <ul className="space-y-1">
                    <li>• Email de confirmación inmediata</li>
                    <li>• Ticket con código QR</li>
                    <li>• Recordatorios del evento</li>
                    <li>• Acceso desde cualquier dispositivo</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Descripción del evento */}
      {event.description && (
        <Card>
          <CardHeader>
            <CardTitle>Descripción del Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {event.description}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
