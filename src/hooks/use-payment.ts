// src/hooks/use-payment.ts - VERSIÓN COMPLETA CON PROMO CODES
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  calculatePriceBreakdown,
  formatPriceBreakdown,
  calculatePriceBreakdownWithDiscount,
} from "@/lib/commission";

interface PaymentData {
  ticketTypeId: string;
  quantity: number;
  promoCode?: string; // ✅ NUEVO: Campo opcional para código promocional
}

interface PaymentResponse {
  success: boolean;
  orderId: string;
  paymentUrl?: string;
  token?: string;
  isFree?: boolean;
  ticketsGenerated?: number;
  priceBreakdown?: {
    originalAmount: number;
    discountAmount: number;
    baseAmount: number;
    commission: number;
    totalAmount: number;
    commissionRate: string;
    promoCode?: string;
  };
  error?: string;
}

export function usePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const processPayment = async (
    paymentData: PaymentData
  ): Promise<PaymentResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/payments/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al procesar el pago");
      }

      if (data.success) {
        if (data.priceBreakdown?.discountAmount > 0) {
          const savings = data.priceBreakdown.discountAmount;
          const promoText = data.priceBreakdown.promoCode 
            ? ` con código ${data.priceBreakdown.promoCode}` 
            : '';
          
          toast.success(
            `¡Descuento aplicado${promoText}! Ahorras $${savings.toLocaleString('es-CL')}`
          );
        }

        if (data.isFree) {
          const ticketsText = data.ticketsGenerated === 1 
            ? "ticket" 
            : `${data.ticketsGenerated} tickets`;
          
          toast.success(
            `¡Registro exitoso! Se generó ${ticketsText}.`
          );
          router.push(`/payment/success?orderId=${data.orderId}`);
        } else if (data.paymentUrl && data.token) {
          toast.info("Redirigiendo a la pasarela de pago...");
          
          const form = document.createElement("form");
          form.method = "POST";
          form.action = data.paymentUrl;
          form.style.display = "none";

          const tokenInput = document.createElement("input");
          tokenInput.type = "hidden";
          tokenInput.name = "token_ws";
          tokenInput.value = data.token;

          form.appendChild(tokenInput);
          document.body.appendChild(form);
          form.submit();
        }
      }

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error desconocido";
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    processPayment,
    loading,
    error,
    clearError,
  };
}

export function useRealTimePrice(
  basePrice: number,
  quantity: number = 1,
  currency: string = "CLP"
) {
  const [priceData, setPriceData] = useState(() => {
    const breakdown = calculatePriceBreakdown(basePrice * quantity, currency);
    return {
      breakdown,
      formatted: formatPriceBreakdown(breakdown),
      isFree: basePrice === 0,
    };
  });

  const updatePrice = (
    newBasePrice: number, 
    newQuantity: number = 1, 
    discountAmount: number = 0
  ) => {
    const originalAmount = newBasePrice * newQuantity;
    
    let breakdown;
    if (discountAmount > 0) {
      breakdown = calculatePriceBreakdownWithDiscount(
        originalAmount,
        discountAmount,
        currency
      );
    } else {
      breakdown = calculatePriceBreakdown(originalAmount, currency);
    }

    setPriceData({
      breakdown,
      formatted: formatPriceBreakdown(breakdown),
      isFree: newBasePrice === 0 || breakdown.totalPrice === 0,
    });
  };

  const applyDiscount = (discountAmount: number, promoCode?: string) => {
    const originalAmount = basePrice * quantity;
    const breakdown = calculatePriceBreakdownWithDiscount(
      originalAmount,
      discountAmount,
      currency
    );
    
    const enhancedBreakdown = {
      ...breakdown,
      promoCode
    };

    setPriceData({
      breakdown: enhancedBreakdown,
      formatted: formatPriceBreakdown(enhancedBreakdown),
      isFree: enhancedBreakdown.totalPrice === 0,
    });
  };

  return {
    ...priceData,
    updatePrice,
    applyDiscount,
  };
}

export function usePaymentStatus(orderId?: string) {
  const [status, setStatus] = useState<
    "loading" | "success" | "error" | "not-found"
  >("loading");
  const [orderData, setOrderData] = useState<Record<string, unknown> | null>(
    null
  );

  const checkStatus = async () => {
    if (!orderId) {
      setStatus("not-found");
      return;
    }

    try {
      const response = await fetch(`/api/orders/${orderId}`);
      const data = await response.json();

      if (response.ok) {
        setOrderData(data.order);
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      setStatus("error");
    }
  };

  return {
    status,
    orderData,
    checkStatus,
  };
}

export function usePromoCode() {
  const [loading, setLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    name: string;
    discountAmount: number;
    finalAmount: number;
    percentage: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const validatePromoCode = async (
    code: string,
    ticketTypeId: string,
    quantity: number
  ) => {
    if (!code.trim()) {
      setError("Ingresa un código promocional");
      return null;
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
        return null;
      }

      const promoData = {
        code: data.promoCode.code,
        name: data.promoCode.name,
        discountAmount: data.discount.amount,
        finalAmount: data.discount.finalAmount,
        percentage: data.discount.percentage,
      };

      setAppliedPromo(promoData);
      toast.success(
        `¡Código aplicado! Ahorras $${promoData.discountAmount.toLocaleString("es-CL")}`
      );

      return promoData;
    } catch (error) {
      console.error("Error validating promo code:", error);
      setError("Error al validar el código promocional");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
    setError(null);
    toast.info("Código promocional removido");
  };

  const clearError = () => setError(null);

  return {
    validatePromoCode,
    removePromoCode,
    clearError,
    loading,
    appliedPromo,
    error,
  };
}