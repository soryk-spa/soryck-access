"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface PaymentData {
  ticketTypeId: string;
  quantity: number;
  promoCode?: string;
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
          
          
          const redirectUrl = new URL("/payment/redirect", window.location.origin);
          redirectUrl.searchParams.set("token", data.token);
          redirectUrl.searchParams.set("url", data.paymentUrl);
          
          
          if (data.priceBreakdown) {
            redirectUrl.searchParams.set("amount", data.priceBreakdown.totalAmount.toString());
            if (data.priceBreakdown.discountAmount > 0) {
              redirectUrl.searchParams.set("discount", data.priceBreakdown.discountAmount.toString());
              if (data.priceBreakdown.promoCode) {
                redirectUrl.searchParams.set("promoCode", data.priceBreakdown.promoCode);
              }
            }
          }
          
          
          router.push(redirectUrl.toString());
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

export function usePromoCode() {
  const [loading, setLoading] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    name: string;
    discountAmount: number;
    finalAmount: number;
    percentage: number;
    type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE";
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
        type: data.promoCode.type,
        discountAmount: data.discount.amount,
        finalAmount: data.discount.finalAmount,
        percentage: data.discount.percentage,
      };

      setAppliedPromo(promoData);
      toast.success(
        `¡Código aplicado! Ahorras ${promoData.discountAmount.toLocaleString("es-CL")}`
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

export function useRealTimePrice(
  basePrice: number,
  quantity: number = 1,
) {
  const [priceData, setPriceData] = useState(() => {
    const originalAmount = basePrice * quantity;
    return {
      originalAmount,
      discountAmount: 0,
      finalAmount: originalAmount,
      isFree: basePrice === 0,
    };
  });

  const updatePrice = (
    newBasePrice: number, 
    newQuantity: number = 1, 
    discountAmount: number = 0
  ) => {
    const originalAmount = newBasePrice * newQuantity;
    const finalAmount = Math.max(0, originalAmount - discountAmount);

    setPriceData({
      originalAmount,
      discountAmount,
      finalAmount,
      isFree: newBasePrice === 0 || finalAmount === 0,
    });
  };

  const applyDiscount = (discountAmount: number) => {
    const originalAmount = basePrice * quantity;
    const finalAmount = Math.max(0, originalAmount - discountAmount);
    
    setPriceData({
      originalAmount,
      discountAmount,
      finalAmount,
      isFree: finalAmount === 0,
    });
  };

  const clearDiscount = () => {
    const originalAmount = basePrice * quantity;
    setPriceData({
      originalAmount,
      discountAmount: 0,
      finalAmount: originalAmount,
      isFree: basePrice === 0,
    });
  };

  return {
    ...priceData,
    updatePrice,
    applyDiscount,
    clearDiscount,
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