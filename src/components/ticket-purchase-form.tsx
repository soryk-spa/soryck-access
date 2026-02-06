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
import { TicketTypePriceDisplay } from "@/components/ticket-type-price-display";





interface TicketPurchaseFormProps {
  event: Event;
  ticketTypes: TicketTypeWithCount[];
}





const TicketTypeCard = ({
  ticketType,
  isSelected,
  availability,
}: {
  ticketType: TicketTypeWithCount;
  isSelected: boolean;
  availability: ReturnType<ReturnType<typeof useTicketAvailability>["getTicketAvailability"]>;
}) => {
  const isDisabled = availability.available === 0;

  return (
    <div
      className={`relative p-5 border-2 rounded-xl transition-all duration-300 cursor-pointer group ${
        isSelected
          ? "border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 shadow-md scale-[1.02]"
          : "border-gray-200 hover:border-blue-300 hover:shadow-sm dark:border-gray-700"
      } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isSelected && (
        <div className="absolute top-3 right-3">
          <div className="bg-blue-500 text-white rounded-full p-1">
            <CheckCircle className="h-4 w-4" />
          </div>
        </div>
      )}
      
      <div className="flex items-center space-x-4">
        <RadioGroupItem
          value={ticketType.id}
          id={ticketType.id}
          disabled={isDisabled}
          className="w-5 h-5"
        />
        <label
          htmlFor={ticketType.id}
          className={`flex-1 ${!isDisabled ? "cursor-pointer" : "cursor-not-allowed"}`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className={`font-semibold text-lg ${isSelected ? "text-blue-700 dark:text-blue-300" : ""}`}>
                {ticketType.name}
              </h3>
              {ticketType.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                  {ticketType.description}
                </p>
              )}
            </div>
            <div className="text-right ml-4">
              <TicketTypePriceDisplay 
                ticketType={ticketType}
                showEarlyBirdBadge={true}
                showNextPriceChange={false}
                className="font-bold text-lg"
              />
            </div>
          </div>
        </label>
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
  const availability = useTicketAvailability();
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

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {}
          <div className="lg:col-span-8 space-y-6">
            {}
            <Card className="border-0 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                <div className="flex flex-col md:flex-row gap-4 items-start">
                  {event.imageUrl && (
                    <div className="w-full md:w-32 h-24 relative rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl md:text-2xl font-bold mb-3 truncate">{event.title}</h1>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{formatDisplayDateTime(event.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{event.location}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {}
            <Card className="border-0 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Ticket className="h-6 w-6 text-blue-600" />
                  Selecciona tu tipo de entrada
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <RadioGroup
                  value={ticketPurchase.formData.selectedTicketType}
                  onValueChange={(value) =>
                    ticketPurchase.updateFormData("selectedTicketType", value)
                  }
                  className="space-y-4"
                >
                  {ticketTypes.map((ticketType) => (
                    <TicketTypeCard
                      key={ticketType.id}
                      ticketType={ticketType}
                      isSelected={ticketPurchase.formData.selectedTicketType === ticketType.id}
                      availability={availability.getTicketAvailability()}
                    />
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {}
            {ticketPurchase.selectedType && (
              <Card className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <User className="h-6 w-6 text-green-600" />
                    Personaliza tu compra
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {}
                  <div>
                    <Label className="text-base font-semibold mb-3 block">
                      ¿Cuántas entradas necesitas?
                    </Label>
                    <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={ticketPurchase.decrementQuantity}
                        disabled={ticketPurchase.formData.quantity <= 1}
                        className="h-12 w-12 rounded-full"
                      >
                        <Minus className="h-5 w-5" />
                      </Button>
                      <div className="flex-1 text-center">
                        <span className="text-3xl font-bold text-blue-600">
                          {ticketPurchase.formData.quantity}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          {ticketPurchase.formData.quantity === 1 ? "entrada" : "entradas"}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={ticketPurchase.incrementQuantity}
                        disabled={ticketPurchase.formData.quantity >= ticketPurchase.maxQuantityAllowed}
                        className="h-12 w-12 rounded-full"
                      >
                        <Plus className="h-5 w-5" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Máximo {ticketPurchase.maxQuantityAllowed} entradas por compra
                    </p>
                  </div>

                  <Separator />

                  {}
                  <div>
                    <Label className="text-base font-semibold mb-3 flex items-center gap-2">
                      <Tag className="h-5 w-5 text-purple-600" />
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

            {}
            <Card className="border-0 shadow-lg bg-blue-50 dark:bg-blue-950 lg:hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-2">Información importante:</p>
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

          {}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-6 space-y-4">
              {ticketPurchase.selectedType && (
                <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Tu Compra
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Tipo de entrada</span>
                        <span className="font-medium text-right">{ticketPurchase.selectedType.name}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Precio unitario</span>
                        <TicketTypePriceDisplay 
                          ticketType={ticketPurchase.selectedType}
                          showEarlyBirdBadge={false}
                          showNextPriceChange={false}
                          className="font-medium"
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 dark:text-gray-400">Cantidad</span>
                        <span className="font-medium">× {ticketPurchase.formData.quantity}</span>
                      </div>
                      
                      <Separator />
                      
                      <div className="flex justify-between text-base">
                        <span>Subtotal</span>
                        <span className="font-semibold">{formatCurrency(ticketPurchase.calculations.subtotal)}</span>
                      </div>

                      {ticketPurchase.appliedPromoCode && (
                        <div className="flex justify-between text-green-600 bg-green-50 dark:bg-green-900/20 p-2 rounded">
                          <span className="flex items-center gap-1">
                            <Tag className="h-4 w-4" />
                            Descuento
                          </span>
                          <span className="font-semibold">-{formatCurrency(ticketPurchase.calculations.discountAmount)}</span>
                        </div>
                      )}

                      <Separator className="my-4" />
                      
                      <div className="flex justify-between items-center text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        <span>Total</span>
                        <span>{formatCurrency(ticketPurchase.calculations.totalPrice)}</span>
                      </div>

                      {ticketPurchase.calculations.savings > 0 && (
                        <div className="text-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <span className="text-sm font-medium text-green-700 dark:text-green-300">
                            ✨ ¡Ahorras {formatCurrency(ticketPurchase.calculations.savings)}!
                          </span>
                        </div>
                      )}
                    </div>

                    <Separator className="my-4" />

                    {}
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <input
                          type="checkbox"
                          id="agreeToTerms"
                          checked={ticketPurchase.formData.agreeToTerms}
                          onChange={(e) =>
                            ticketPurchase.updateFormData("agreeToTerms", e.target.checked)
                          }
                          className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <Label htmlFor="agreeToTerms" className="text-xs text-gray-600 dark:text-gray-400 cursor-pointer">
                          Acepto los{" "}
                          <a href="/terms" className="text-blue-600 hover:underline font-medium">
                            términos y condiciones
                          </a>{" "}
                          y la{" "}
                          <a href="/privacy" className="text-blue-600 hover:underline font-medium">
                            política de privacidad
                          </a>
                        </Label>
                      </div>

                      {}
                      <Button
                        type="submit"
                        className="w-full h-14 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300"
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
                            Confirmar y Pagar
                          </>
                        )}
                      </Button>

                      {paymentError && (
                        <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-red-700 dark:text-red-200 text-sm">
                            {paymentError}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {}
              <Card className="border-0 shadow-lg bg-blue-50 dark:bg-blue-950 hidden lg:block">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-medium mb-2">Información importante:</p>
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
          </div>
        </div>
      </form>
    </div>
  );
}
