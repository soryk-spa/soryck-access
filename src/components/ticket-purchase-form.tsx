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
  Tag,
  X,
  Loader2,
  Percent,
  DollarSign,
  Gift,
} from "lucide-react";
import { usePayment } from "@/hooks/use-payment";
import { calculateTotalPrice, formatPrice } from "@/lib/commission";
import PriceDisplay from "@/components/price-display";
import { toast } from "sonner";

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
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // Promo code states
  const [promoCode, setPromoCode] = useState("");
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    name: string;
    discountAmount: number;
    finalAmount: number;
    percentage: number;
    type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE";
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  const { processPayment, loading, error } = usePayment();

  const ticketTypes = event.ticketTypes || [
    {
      id: "legacy",
      name: "Entrada General",
      description: null,
      price: 0,
      currency: "CLP",
      capacity: 0,
      _count: { tickets: event._count.tickets },
    },
  ];

  const selectedType = ticketTypes.find((t) => t.id === selectedTicketType);

  const baseAmount = selectedType ? selectedType.price * quantity : 0;
  const discountAmount = appliedPromo?.discountAmount || 0;
  const finalAmount = appliedPromo?.finalAmount || baseAmount;

  const totalPrice = calculateTotalPrice(finalAmount);
  const isFree = finalAmount === 0;

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
      if (appliedPromo) {
        validatePromoCode(promoCode, newQuantity);
      }
    }
  };

  const validatePromoCode = async (code: string, qty: number = quantity) => {
    if (!code.trim() || !selectedType) return;

    setIsValidatingPromo(true);
    setPromoError(null);

    try {
      const response = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          ticketTypeId: selectedType.id,
          quantity: qty,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPromoError(data.error || "Error al validar el código");
        setAppliedPromo(null);
        return;
      }

      const promoData = {
        code: data.promoCode.code,
        name: data.promoCode.name,
        type: data.promoCode.type,
        discountAmount: data.discount.amount,
        finalAmount: data.discount.finalAmount,
        percentage: data.discount.percentage,
      };

      setAppliedPromo(promoData);
      setPromoError(null);
      toast.success(
        `¡Código aplicado! Ahorras $${promoData.discountAmount.toLocaleString("es-CL")}`
      );
    } catch (error) {
      console.error("Error validating promo code:", error);
      setPromoError("Error al validar el código promocional");
      setAppliedPromo(null);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError(null);
    toast.info("Código promocional removido");
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
      promoCode: appliedPromo?.code, // Incluir código promocional
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

  const getDiscountIcon = (type: string) => {
    switch (type) {
      case "PERCENTAGE":
        return <Percent className="h-4 w-4" />;
      case "FIXED_AMOUNT":
        return <DollarSign className="h-4 w-4" />;
      case "FREE":
        return <Gift className="h-4 w-4" />;
      default:
        return <Tag className="h-4 w-4" />;
    }
  };

  const formatDiscount = (promo: typeof appliedPromo) => {
    if (!promo) return "";
    switch (promo.type) {
      case "PERCENTAGE":
        return `${Math.round(promo.percentage)}% de descuento`;
      case "FIXED_AMOUNT":
        return `$${promo.discountAmount.toLocaleString("es-CL")} de descuento`;
      case "FREE":
        return "¡Gratis!";
      default:
        return "Descuento aplicado";
    }
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
              onValueChange={(value) => {
                setSelectedTicketType(value);
                // Limpiar promo code al cambiar tipo de ticket
                if (appliedPromo) {
                  setAppliedPromo(null);
                  setPromoCode("");
                  setPromoError(null);
                }
              }}
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

            {/* Código promocional */}
            {selectedType && (
              <>
                <Separator />
                {appliedPromo ? (
                  <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500 rounded-full">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className="text-green-700 border-green-300"
                              >
                                {appliedPromo.code}
                              </Badge>
                              {getDiscountIcon(appliedPromo.type)}
                            </div>
                            <p className="text-sm font-medium text-green-800 dark:text-green-300">
                              {appliedPromo.name}
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              {formatDiscount(appliedPromo)}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removePromoCode}
                          className="text-green-700 hover:text-green-800 hover:bg-green-100"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-blue-500" />
                          <Label
                            htmlFor="promo-code"
                            className="text-sm font-medium"
                          >
                            ¿Tienes un código promocional?
                          </Label>
                        </div>

                        <div className="flex gap-2">
                          <div className="flex-1">
                            <Input
                              id="promo-code"
                              placeholder="Ingresa tu código"
                              value={promoCode}
                              onChange={(e) => {
                                setPromoCode(e.target.value.toUpperCase());
                                setPromoError(null);
                              }}
                              className={promoError ? "border-red-300" : ""}
                              disabled={isValidatingPromo}
                            />
                            {promoError && (
                              <p className="text-xs text-red-600 mt-1">
                                {promoError}
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={() => validatePromoCode(promoCode)}
                            disabled={isValidatingPromo || !promoCode.trim()}
                            size="default"
                          >
                            {isValidatingPromo ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Aplicar"
                            )}
                          </Button>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          Los códigos promocionales se aplicarán automáticamente
                          al total.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Resumen de precio */}
            {selectedType && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">Resumen de compra</h4>

                  {appliedPromo ? (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span className="line-through text-gray-500">
                          {formatPrice(baseAmount, selectedType.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Descuento ({appliedPromo.code}):</span>
                        <span>
                          -{formatPrice(discountAmount, selectedType.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Subtotal con descuento:</span>
                        <span>
                          {formatPrice(finalAmount, selectedType.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Comisión SorykPass (6%):</span>
                        <span>
                          {formatPrice(
                            totalPrice - finalAmount,
                            selectedType.currency
                          )}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total a pagar:</span>
                        <span className="text-primary">
                          {formatPrice(totalPrice, selectedType.currency)}
                        </span>
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        ¡Ahorras{" "}
                        {formatPrice(discountAmount, selectedType.currency)}!
                      </div>
                    </div>
                  ) : (
                    <PriceDisplay
                      basePrice={selectedType.price}
                      quantity={quantity}
                      currency={selectedType.currency}
                      showBreakdown={true}
                      variant="detailed"
                    />
                  )}
                </div>
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
