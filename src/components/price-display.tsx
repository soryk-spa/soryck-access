"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Info, ChevronDown, ChevronUp } from "lucide-react";
import {
  calculatePriceBreakdown,
  formatPriceBreakdown,
  formatPrice,
} from "@/lib/commission";

interface PriceDisplayProps {
  basePrice: number;
  quantity: number;
  currency: string;
  showBreakdown?: boolean;
  variant?: "default" | "compact" | "detailed";
  className?: string;
}

export default function PriceDisplay({
  basePrice,
  quantity,
  currency,
  showBreakdown = false,
  variant = "default",
  className = "",
}: PriceDisplayProps) {
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(showBreakdown);

  const breakdown = calculatePriceBreakdown(basePrice * quantity, currency);
  const formatted = formatPriceBreakdown(breakdown);
  const isFree = basePrice === 0;

  if (isFree) {
    return (
      <div className={`text-center ${className}`}>
        <div className="text-2xl font-bold text-green-600 mb-1">
          Evento Gratuito
        </div>
        <p className="text-muted-foreground text-sm">
          {quantity === 1 ? "1 entrada" : `${quantity} entradas`}
        </p>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={`flex items-center justify-between ${className}`}>
        <span className="text-sm text-muted-foreground">
          {quantity === 1 ? "1 entrada" : `${quantity} entradas`}
        </span>
        <span className="font-bold text-lg text-primary">
          {formatted.totalPrice}
        </span>
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <Card className={className}>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg">Resumen de compra</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsBreakdownOpen(!isBreakdownOpen)}
                className="text-muted-foreground"
              >
                <Info className="h-4 w-4 mr-1" />
                Desglose
                {isBreakdownOpen ? (
                  <ChevronUp className="h-4 w-4 ml-1" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-1" />
                )}
              </Button>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  {quantity === 1 ? "1 entrada" : `${quantity} entradas`}
                </span>
                <span className="font-semibold text-xl text-primary">
                  {formatted.totalPrice}
                </span>
              </div>

              {isBreakdownOpen && (
                <>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Precio base:
                      </span>
                      <span>{formatPrice(basePrice * quantity, currency)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Comisión SorykPass ({formatted.commissionPercentage}):
                      </span>
                      <span>{formatted.commission}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total a pagar:</span>
                      <span className="text-primary">
                        {formatted.totalPrice}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium mb-1">Precio incluye:</p>
                  <ul className="space-y-1">
                    <li>• Entrada al evento</li>
                    <li>• Comisión de procesamiento</li>
                    <li>• Código QR único</li>
                    <li>• Soporte 24/7</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex justify-between items-center text-lg">
        <span className="text-muted-foreground">
          {quantity === 1 ? "1 entrada" : `${quantity} entradas`}
        </span>
        <span className="font-bold text-primary">{formatted.totalPrice}</span>
      </div>

      {showBreakdown && (
        <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-4 w-4" />
            <span className="font-medium">Desglose de precio:</span>
          </div>
          <div className="space-y-1 ml-6">
            <div className="flex justify-between">
              <span>Precio del evento:</span>
              <span>{formatPrice(basePrice * quantity, currency)}</span>
            </div>
            <div className="flex justify-between">
              <span>
                Comisión SorykPass ({formatted.commissionPercentage}):
              </span>
              <span>{formatted.commission}</span>
            </div>
            <Separator className="my-1" />
            <div className="flex justify-between font-semibold">
              <span>Total a pagar:</span>
              <span>{formatted.totalPrice}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-1">
        <Badge variant="outline" className="text-xs">
          ✅ Pago seguro
        </Badge>
        <Badge variant="outline" className="text-xs">
          📱 Ticket digital
        </Badge>
        <Badge variant="outline" className="text-xs">
          🔒 Código único
        </Badge>
      </div>
    </div>
  );
}

// Hook personalizado para cálculos de precio en tiempo real
export function usePriceCalculation(
  basePrice: number,
  quantity: number,
  currency: string
) {
  const breakdown = calculatePriceBreakdown(basePrice * quantity, currency);
  const formatted = formatPriceBreakdown(breakdown);
  const isFree = basePrice === 0;

  return {
    breakdown,
    formatted,
    isFree,
    totalPrice: breakdown.totalPrice,
    baseTotal: basePrice * quantity,
    commission: breakdown.commission,
  };
}
