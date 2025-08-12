import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Minus,
  Plus,
  CreditCard,
  Shield,
  Info,
  Clock,
  MapPin,
  User,
  AlertCircle,
} from "lucide-react";
import { usePayment } from "@/hooks/use-payment";
import { usePriceCalculation } from "@/components/price-display";
import PriceDisplay from "@/components/price-display";

interface Event {
  id: string;
  title: string;
  description?: string;
  location: string;
  startDate: string;
  endDate?: string;
  price: number;
  currency: string;
  isFree: boolean;
  capacity: number;
  imageUrl?: string;
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
}

interface TicketPurchaseFormProps {
  event: Event;
  userTicketsCount?: number;
}

export default function TicketPurchaseForm({
  event,
  userTicketsCount = 0,
}: TicketPurchaseFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const { processPayment, loading, error } = usePayment();
  const { breakdown, formatted, isFree } = usePriceCalculation(
    event.price,
    quantity,
    event.currency
  );

  const availableTickets = event.capacity - event._count.tickets;
  const isEventFull = availableTickets <= 0;
  const isEventPast = new Date(event.startDate) < new Date();
  const maxQuantityAllowed = Math.min(availableTickets, 10 - userTicketsCount);

  const organizerName = event.organizer.firstName
    ? `${event.organizer.firstName} ${event.organizer.lastName || ""}`.trim()
    : event.organizer.email.split("@")[0];

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantityAllowed) {
      setQuantity(newQuantity);
    }
  };

  const handlePurchase = async () => {
    if (!agreeToTerms && !isFree) {
      alert("Debes aceptar los términos y condiciones");
      return;
    }

    await processPayment({
      eventId: event.id,
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

  const canPurchase = !isEventFull && !isEventPast && !loading && quantity > 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Image
              src={event.imageUrl || "/default-event.png"}
              alt={event.title}
              width={80}
              height={80}
              className="w-20 h-20 rounded-lg object-cover"
              style={{ objectFit: "cover" }}
              priority
            />
            <div className="flex-1">
              <CardTitle className="text-xl mb-2">{event.title}</CardTitle>
              <Badge variant="outline" className="mb-2">
                {event.category.name}
              </Badge>

              <div className="space-y-1 text-sm text-muted-foreground">
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
                  <span>Organizado por {organizerName}</span>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

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

      {availableTickets <= 10 && availableTickets > 0 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            ¡Últimos {availableTickets} tickets disponibles! No te quedes sin el
            tuyo.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {canPurchase && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {isFree ? "Registro Gratuito" : "Comprar Tickets"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
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
                  <div>{availableTickets} disponibles</div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Resumen del pedido</h4>
                {!isFree && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                  >
                    <Info className="h-4 w-4 mr-2" />
                    {showPriceBreakdown ? "Ocultar" : "Ver"} desglose
                  </Button>
                )}
              </div>

              {isFree ? (
                <div className="text-center py-4">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    Evento Gratuito
                  </div>
                  <p className="text-muted-foreground">
                    {quantity === 1 ? "1 ticket" : `${quantity} tickets`}
                  </p>
                </div>
              ) : showPriceBreakdown ? (
                <PriceDisplay
                  basePrice={event.price}
                  quantity={quantity}
                  currency={event.currency}
                  showBreakdown={true}
                />
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-lg">
                    <span>
                      {quantity === 1 ? "1 ticket" : `${quantity} tickets`}
                    </span>
                    <span className="font-bold text-primary">
                      {formatted.totalPrice}
                    </span>
                  </div>

                  <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Info className="h-4 w-4" />
                      <span className="font-medium">Precio incluye:</span>
                    </div>
                    <ul className="ml-6 space-y-1">
                      <li>
                        • Precio del evento:{" "}
                        {formatPrice(event.price * quantity, event.currency)}
                      </li>
                      <li>
                        • Comisión SorykPass (6%):{" "}
                        {formatPrice(breakdown.commission, event.currency)}
                      </li>
                      <li>
                        • <strong>Total a pagar: {formatted.totalPrice}</strong>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

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

            <Button
              onClick={handlePurchase}
              disabled={loading || (!agreeToTerms && !isFree)}
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
                `Pagar ${formatted.totalPrice} ${
                  quantity > 1 ? `(${quantity} tickets)` : ""
                }`
              )}
            </Button>

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

function formatPrice(price: number, currency: string = "CLP"): string {
  if (price === 0) return "Gratis";

  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}
