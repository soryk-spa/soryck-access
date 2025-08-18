"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Ticket,
  Check,
  X,
  Loader2,
  Tag,
  Percent,
  DollarSign,
  Gift,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

interface PromoCodeInputProps {
  ticketTypeId: string;
  quantity: number;
  onPromoCodeApplied?: (discount: PromoCodeDiscount | null) => void;
  className?: string;
  disabled?: boolean;
}

interface PromoCodeDiscount {
  code: string;
  name: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE";
  discountAmount: number;
  finalAmount: number;
  percentage: number;
}

export default function PromoCodeInputStandalone({
  ticketTypeId,
  quantity,
  onPromoCodeApplied,
  className = "",
  disabled = false,
}: PromoCodeInputProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [appliedDiscount, setAppliedDiscount] =
    useState<PromoCodeDiscount | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validatePromoCode = async () => {
    if (!code.trim()) {
      setError("Ingresa un código promocional");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/promo-codes/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          ticketTypeId,
          quantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al validar el código");
        return;
      }

      const discount: PromoCodeDiscount = {
        code: code.trim().toUpperCase(),
        name: data.promoCode.name,
        description: data.promoCode.description,
        type: data.promoCode.type,
        discountAmount: data.discount.amount,
        finalAmount: data.discount.finalAmount,
        percentage: data.discount.percentage,
      };

      setAppliedDiscount(discount);
      onPromoCodeApplied?.(discount);

      toast.success(
        `¡Código aplicado! Ahorras $${discount.discountAmount.toLocaleString("es-CL")}`
      );
    } catch (error) {
      console.error("Error validating promo code:", error);
      setError("Error al validar el código promocional");
    } finally {
      setLoading(false);
    }
  };

  const removePromoCode = () => {
    setAppliedDiscount(null);
    setCode("");
    setError(null);
    onPromoCodeApplied?.(null);
    toast.info("Código promocional removido");
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

  const formatDiscount = (discount: PromoCodeDiscount) => {
    switch (discount.type) {
      case "PERCENTAGE":
        return `${Math.round(discount.percentage)}% de descuento`;
      case "FIXED_AMOUNT":
        return `$${discount.discountAmount.toLocaleString("es-CL")} de descuento`;
      case "FREE":
        return "¡Gratis!";
      default:
        return "Descuento aplicado";
    }
  };

  if (appliedDiscount) {
    return (
      <Card
        className={`border-green-200 bg-green-50 dark:bg-green-950/20 ${className}`}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-full">
                <Check className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-green-700 border-green-300"
                  >
                    {appliedDiscount.code}
                  </Badge>
                  {getDiscountIcon(appliedDiscount.type)}
                </div>
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  {appliedDiscount.name}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {formatDiscount(appliedDiscount)}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={removePromoCode}
              className="text-green-700 hover:text-green-800 hover:bg-green-100"
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-3 pt-3 border-t border-green-200">
            <div className="flex justify-between text-sm">
              <span className="text-green-700">
                Ahorras: $
                {appliedDiscount.discountAmount.toLocaleString("es-CL")}
              </span>
              <span className="text-green-600">
                ({Math.round(appliedDiscount.percentage)}% de descuento)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-blue-500" />
            <Label htmlFor="promo-code" className="text-sm font-medium">
              ¿Tienes un código promocional?
            </Label>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                id="promo-code"
                placeholder="Ingresa tu código"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setError(null);
                }}
                className={error ? "border-red-300" : ""}
                disabled={loading || disabled}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && code.trim()) {
                    validatePromoCode();
                  }
                }}
              />
              {error && (
                <div className="flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3 text-red-600" />
                  <p className="text-xs text-red-600">{error}</p>
                </div>
              )}
            </div>
            <Button
              onClick={validatePromoCode}
              disabled={loading || !code.trim() || disabled}
              size="default"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Aplicar"
              )}
            </Button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Tip:</strong> Los códigos promocionales pueden ofrecer
              descuentos por porcentaje, monto fijo o entrada gratuita.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
