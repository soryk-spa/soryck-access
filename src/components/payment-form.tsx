import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Minus, Plus, CreditCard, Shield, Info } from "lucide-react";
import PriceDisplay from "@/components/price-display";
import { usePriceCalculation } from "@/components/price-display";

interface PaymentFormProps {
  event: {
    id: string;
    title: string;
    price: number;
    currency: string;
    isFree: boolean;
    capacity: number;
    location: string;
    startDate: string;
    imageUrl?: string;
  };
  availableTickets: number;
  onPaymentSubmit: (data: { eventId: string; quantity: number }) => void;
  loading?: boolean;
}

export default function PaymentForm({
  event,
  availableTickets,
  onPaymentSubmit,
  loading = false,
}: PaymentFormProps) {
  const [quantity, setQuantity] = useState(1);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const { formatted, isFree } = usePriceCalculation(
    event.price,
    quantity,
    event.currency
  );

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= Math.min(availableTickets, 10)) {
      setQuantity(newQuantity);
    }
  };

  const handleSubmit = () => {
    onPaymentSubmit({
      eventId: event.id,
      quantity,
    });
  };

  const isUnavailable = availableTickets <= 0;
  const maxQuantity = Math.min(availableTickets, 10);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {isFree ? "Registro Gratuito" : "Comprar Tickets"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <Image
              src={event.imageUrl || "/placeholder.png"}
              alt={event.title}
              width={64}
              height={64}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{event.title}</h3>
              <p className="text-muted-foreground text-sm">{event.location}</p>
              <p className="text-muted-foreground text-sm">
                {new Date(event.startDate).toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {isUnavailable ? (
            <Alert>
              <AlertDescription>
                Lo sentimos, este evento está agotado.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="quantity">Cantidad de tickets</Label>
                <div className="flex items-center gap-3">
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
                    max={maxQuantity}
                    value={quantity}
                    onChange={(e) =>
                      handleQuantityChange(parseInt(e.target.value) || 1)
                    }
                    className="w-20 text-center"
                    disabled={loading}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= maxQuantity || loading}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>

                  <span className="text-sm text-muted-foreground">
                    (máx. {maxQuantity})
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600"
                >
                  {availableTickets} disponibles
                </Badge>
                {availableTickets <= 10 && (
                  <Badge
                    variant="outline"
                    className="text-orange-600 border-orange-600"
                  >
                    ¡Últimos tickets!
                  </Badge>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {!isUnavailable && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Resumen del pedido</CardTitle>
              {!isFree && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="text-sm"
                >
                  <Info className="h-4 w-4 mr-2" />
                  {showBreakdown ? "Ocultar" : "Ver"} desglose
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isFree ? (
              <div className="text-center py-4">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  Evento Gratuito
                </div>
                <p className="text-muted-foreground text-sm">
                  {quantity === 1 ? "1 ticket" : `${quantity} tickets`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {showBreakdown ? (
                  <PriceDisplay
                    basePrice={event.price}
                    quantity={quantity}
                    currency={event.currency}
                    showBreakdown={true}
                  />
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>
                        {quantity === 1 ? "1 ticket" : `${quantity} tickets`}
                      </span>
                      <span className="font-medium">
                        {formatted.totalPrice}
                      </span>
                    </div>

                    <div className="text-xs text-muted-foreground p-2 bg-muted rounded">
                      Precio incluye comisión del 6% de SorykPass
                    </div>
                  </div>
                )}
                <Separator />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="h-4 w-4" />
                    <span>Pago seguro con Webpay</span>
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
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {!isUnavailable && (
        <Button
          onClick={handleSubmit}
          disabled={loading || quantity <= 0}
          className="w-full h-12 text-lg"
          size="lg"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Procesando...
            </>
          ) : isFree ? (
            `Registrarse ${quantity > 1 ? `(${quantity} tickets)` : ""}`
          ) : (
            `Pagar ${formatted.totalPrice} ${
              quantity > 1 ? `(${quantity} tickets)` : ""
            }`
          )}
        </Button>
      )}
      <div className="text-xs text-muted-foreground space-y-2">
        <p>✓ Recibirás tu ticket por email inmediatamente después del pago</p>
        <p>✓ Ticket válido para una sola entrada</p>
        {!isFree && (
          <p>✓ Reembolsos disponibles hasta 24 horas antes del evento</p>
        )}
      </div>
    </div>
  );
}
