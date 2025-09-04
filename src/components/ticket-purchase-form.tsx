"use client";

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
} from "lucide-react";


import type { Event } from "@/types";
import { formatCurrency, formatDisplayDateTime } from "@/lib/utils";
import { usePayment } from "@/hooks/use-payment";
import {
  useTicketPurchase,
  usePromoCodeDisplay,
  useTicketAvailability,
  type TicketTypeWithCount,
  type PromoCodeData,
} from "@/hooks/useTicketPurchase";





interface TicketPurchaseFormProps {
  event: Event;
  ticketTypes: TicketTypeWithCount[];
}





const TicketTypeCard = ({
  ticketType,
  isSelected,
  onSelect,
  availability,
}: {
  ticketType: TicketTypeWithCount;
  isSelected: boolean;
  onSelect: () => void;
  availability: ReturnType<ReturnType<typeof useTicketAvailability>["getTicketAvailability"]>;
}) => {
  const isDisabled = availability.available === 0;

  return (
    <div
      className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
        isSelected
          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
          : "border-gray-200 hover:border-gray-300"
      } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
      onClick={!isDisabled ? onSelect : undefined}
    >
      <div className="flex items-center space-x-3">
        <RadioGroupItem
          value={ticketType.id}
          id={ticketType.id}
          disabled={isDisabled}
        />
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{ticketType.name}</h3>
              {ticketType.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {ticketType.description}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="font-semibold">
                {ticketType.price === 0 ? (
                  <span className="text-green-600">Gratis</span>
                ) : (
                  formatCurrency(ticketType.price)
                )}
              </p>
              <Badge className={`text-xs mt-1 ${availability.badgeColor}`}>
                {availability.badgeText}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PromoCodeInput = ({
  promoCode,
  onPromoCodeChange,
  onApplyPromoCode,
  onRemovePromoCode,
  isValidating,
  error,
  appliedPromoCode,
}: {
  promoCode: string;
  onPromoCodeChange: (code: string) => void;
  onApplyPromoCode: () => void;
  onRemovePromoCode: () => void;
  isValidating: boolean;
  error: string | null;
  appliedPromoCode: PromoCodeData | null;
}) => {
  const { getDiscountIcon } = usePromoCodeDisplay();

  return (
    <div className="space-y-3">
      {!appliedPromoCode ? (
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              placeholder="Código promocional"
              value={promoCode}
              onChange={(e) => onPromoCodeChange(e.target.value)}
              disabled={isValidating}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onApplyPromoCode}
            disabled={!promoCode.trim() || isValidating}
          >
            {isValidating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Aplicar"
            )}
          </Button>
        </div>
      ) : (
        <div className="p-3 bg-green-50 dark:bg-green-950 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getDiscountIcon(appliedPromoCode.type)}</span>
              <div>
                <p className="font-medium text-green-800 dark:text-green-200">
                  {appliedPromoCode.name}
                </p>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Descuento: {appliedPromoCode.type === "PERCENTAGE" 
                    ? `${appliedPromoCode.percentage.toFixed(1)}%` 
                    : appliedPromoCode.type === "FREE" 
                    ? "Gratis" 
                    : formatCurrency(appliedPromoCode.discountAmount)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onRemovePromoCode}
              className="text-green-700 hover:text-green-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {error && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-700 dark:text-red-200">
            {error}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};





export default function TicketPurchaseFormOptimized({
  event,
  ticketTypes,
}: TicketPurchaseFormProps) {
  
  const ticketPurchase = useTicketPurchase(event, ticketTypes);
  const availability = useTicketAvailability(ticketTypes);
  const { processPayment, loading: paymentLoading, error: paymentError } = usePayment();

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ticketPurchase.canPurchase) return;

    const purchaseData = {
      ticketTypeId: ticketPurchase.formData.selectedTicketType,
      quantity: ticketPurchase.formData.quantity,
      promoCode: ticketPurchase.appliedPromoCode?.code, 
    };

    await processPayment(purchaseData);
  };

  
  if (ticketPurchase.isEventPast) {
    return (
      <Card className="border-red-200 bg-red-50 dark:bg-red-950">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">
            Evento Finalizado
          </h3>
          <p className="text-red-600 dark:text-red-400">
            Este evento ya ha terminado y ya no se pueden comprar tickets.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (ticketPurchase.isEventFull) {
    return (
      <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
        <CardContent className="p-6 text-center">
          <Ticket className="h-12 w-12 text-orange-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-200 mb-2">
            Evento Agotado
          </h3>
          <p className="text-orange-600 dark:text-orange-400">
            Lo sentimos, todos los tickets para este evento se han agotado.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {event.imageUrl && (
              <div className="md:w-48 h-32 relative">
                <Image
                  src={event.imageUrl}
                  alt={event.title}
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {formatDisplayDateTime(event.startDate)}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {event.location}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {}
          <div className="lg:col-span-2 space-y-6">
            {}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5 text-blue-600" />
                  Selecciona tu tipo de ticket
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={ticketPurchase.formData.selectedTicketType}
                  onValueChange={(value) =>
                    ticketPurchase.updateFormData("selectedTicketType", value)
                  }
                  className="space-y-3"
                >
                  {ticketTypes.map((ticketType) => (
                    <TicketTypeCard
                      key={ticketType.id}
                      ticketType={ticketType}
                      isSelected={ticketPurchase.formData.selectedTicketType === ticketType.id}
                      onSelect={() =>
                        ticketPurchase.updateFormData("selectedTicketType", ticketType.id)
                      }
                      availability={availability.getTicketAvailability(ticketType)}
                    />
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {}
            {ticketPurchase.selectedType && (
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-green-600" />
                    Cantidad y descuentos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      Cantidad de tickets
                    </Label>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={ticketPurchase.decrementQuantity}
                        disabled={ticketPurchase.formData.quantity <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-medium">
                        {ticketPurchase.formData.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={ticketPurchase.incrementQuantity}
                        disabled={ticketPurchase.formData.quantity >= ticketPurchase.maxQuantityAllowed}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                        Máximo {ticketPurchase.maxQuantityAllowed} tickets
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {}
                  <div>
                    <Label className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      ¿Tienes un código promocional?
                    </Label>
                    <PromoCodeInput
                      promoCode={ticketPurchase.formData.promoCode}
                      onPromoCodeChange={(code) =>
                        ticketPurchase.updateFormData("promoCode", code)
                      }
                      onApplyPromoCode={ticketPurchase.applyPromoCode}
                      onRemovePromoCode={ticketPurchase.removePromoCode}
                      isValidating={ticketPurchase.isValidatingPromo}
                      error={ticketPurchase.promoError}
                      appliedPromoCode={ticketPurchase.appliedPromoCode}
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {}
          <div className="space-y-6">
            {}
            {ticketPurchase.selectedType && (
              <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-600" />
                    Resumen de compra
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>{ticketPurchase.selectedType.name}</span>
                      <span>{formatCurrency(ticketPurchase.selectedType.price)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Cantidad</span>
                      <span>×{ticketPurchase.formData.quantity}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(ticketPurchase.calculations.subtotal)}</span>
                    </div>

                    {ticketPurchase.appliedPromoCode && (
                      <div className="flex justify-between text-green-600">
                        <span>Descuento</span>
                        <span>-{formatCurrency(ticketPurchase.calculations.discountAmount)}</span>
                      </div>
                    )}

                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{formatCurrency(ticketPurchase.calculations.totalPrice)}</span>
                    </div>

                    {ticketPurchase.calculations.savings > 0 && (
                      <div className="text-center p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <span className="text-sm text-green-700 dark:text-green-300">
                          ¡Ahorras {formatCurrency(ticketPurchase.calculations.savings)}!
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    checked={ticketPurchase.formData.agreeToTerms}
                    onChange={(e) =>
                      ticketPurchase.updateFormData("agreeToTerms", e.target.checked)
                    }
                    className="mt-1"
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm text-gray-600 dark:text-gray-400">
                    Acepto los{" "}
                    <a href="/terms" className="text-blue-600 hover:underline">
                      términos y condiciones
                    </a>{" "}
                    y la{" "}
                    <a href="/privacy" className="text-blue-600 hover:underline">
                      política de privacidad
                    </a>
                  </Label>
                </div>
              </CardContent>
            </Card>

            {}
            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold"
              disabled={!ticketPurchase.canPurchase || paymentLoading}
            >
              {paymentLoading ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Comprar tickets
                </>
              )}
            </Button>

            {paymentError && (
              <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700 dark:text-red-200">
                  {paymentError}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </form>

      {}
      <Card className="border-0 shadow-lg bg-blue-50 dark:bg-blue-950">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Información importante:</p>
              <ul className="space-y-1 text-xs">
                <li>• Los tickets son válidos únicamente para la fecha del evento</li>
                <li>• Una vez comprados, los tickets no son reembolsables</li>
                <li>• Recibirás un código QR por email para acceder al evento</li>
                <li>• El código QR debe presentarse en formato digital o impreso</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
