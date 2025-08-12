"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  calculatePriceBreakdown,
  formatPriceBreakdown,
} from "@/lib/commission";

interface PaymentData {
  eventId: string;
  quantity: number;
}

interface PaymentResponse {
  success: boolean;
  orderId: string;
  paymentUrl?: string;
  token?: string;
  isFree?: boolean;
  ticketsGenerated?: number;
  priceBreakdown?: {
    baseAmount: number;
    commission: number;
    totalAmount: number;
    commissionRate: string;
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
        if (data.isFree) {
          toast.success(
            `¡Registro exitoso! Se generaron ${data.ticketsGenerated} ticket(s).`
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

  const updatePrice = (newBasePrice: number, newQuantity: number = 1) => {
    const breakdown = calculatePriceBreakdown(
      newBasePrice * newQuantity,
      currency
    );
    setPriceData({
      breakdown,
      formatted: formatPriceBreakdown(breakdown),
      isFree: newBasePrice === 0,
    });
  };

  return {
    ...priceData,
    updatePrice,
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
