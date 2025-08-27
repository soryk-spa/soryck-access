/**
 * Custom hooks para el formulario de compra de tickets
 * Maneja selección de tickets, códigos promocionales y validaciones
 */

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { Event, TicketType as BaseTicketType } from "@/types";
import { calculateTotalPrice } from "@/lib/commission";

// ============================================================================
// TIPOS PARA EL FORMULARIO DE COMPRA
// ============================================================================

// Extender TicketType para incluir conteo de tickets vendidos
export interface TicketTypeWithCount extends BaseTicketType {
  _count: { tickets: number };
}

export interface PromoCodeData {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE";
  value: number;
  name: string;
  description?: string;
  validFrom: string;
  validUntil?: string;
  usageLimit?: number;
  usedCount: number;
}

export interface TicketSelection {
  ticketTypeId: string;
  quantity: number;
  unitPrice: number;
  ticketTypeName: string;
}

export interface PurchaseFormData {
  selectedTicketType: string;
  quantity: number;
  agreeToTerms: boolean;
  promoCode: string;
}

export interface PurchaseCalculation {
  subtotal: number;
  discountAmount: number;
  finalAmount: number;
  totalPrice: number; // Con comisiones
  savings: number;
}

// ============================================================================
// HOOK PRINCIPAL PARA COMPRA DE TICKETS
// ============================================================================

export function useTicketPurchase(event: Event, ticketTypes: TicketTypeWithCount[]) {
  // Estado del formulario
  const [formData, setFormData] = useState<PurchaseFormData>({
    selectedTicketType: "",
    quantity: 1,
    agreeToTerms: false,
    promoCode: "",
  });

  // Estado de validación de código promocional
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCodeData | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Estados derivados
  const selectedType = ticketTypes.find((t) => t.id === formData.selectedTicketType);
  const isEventFull = ticketTypes.every(
    (type) => type._count.tickets >= type.capacity
  );
  const isEventPast = new Date(event.startDate) < new Date();
  
  const maxQuantityAllowed = selectedType
    ? Math.min(10, selectedType.capacity - selectedType._count.tickets)
    : 0;

  // Configuración inicial automática
  useEffect(() => {
    const firstAvailable = ticketTypes.find(
      (type) => type._count.tickets < type.capacity
    );
    if (firstAvailable && !formData.selectedTicketType) {
      setFormData(prev => ({ ...prev, selectedTicketType: firstAvailable.id }));
    }
  }, [ticketTypes, formData.selectedTicketType]);

  // Cálculos de precios
  const calculations: PurchaseCalculation = useCallback(() => {
    if (!selectedType) {
      return {
        subtotal: 0,
        discountAmount: 0,
        finalAmount: 0,
        totalPrice: 0,
        savings: 0,
      };
    }

    const subtotal = selectedType.price * formData.quantity;
    let discountAmount = 0;

    if (appliedPromoCode) {
      switch (appliedPromoCode.type) {
        case "PERCENTAGE":
          discountAmount = (subtotal * appliedPromoCode.value) / 100;
          break;
        case "FIXED_AMOUNT":
          discountAmount = Math.min(appliedPromoCode.value, subtotal);
          break;
        case "FREE":
          discountAmount = subtotal;
          break;
      }
    }

    const finalAmount = Math.max(0, subtotal - discountAmount);
    const totalPrice = calculateTotalPrice(finalAmount);
    const savings = subtotal - finalAmount;

    return {
      subtotal,
      discountAmount,
      finalAmount,
      totalPrice,
      savings,
    };
  }, [selectedType, formData.quantity, appliedPromoCode])();

  // Validar código promocional
  const validatePromoCode = useCallback(async (code: string) => {
    if (!code.trim()) {
      setAppliedPromoCode(null);
      setPromoError(null);
      return;
    }

    setIsValidatingPromo(true);
    setPromoError(null);

    try {
      const response = await fetch(`/api/promo-codes/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          ticketTypeId: formData.selectedTicketType,
          quantity: formData.quantity,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setAppliedPromoCode(data.promoCode);
        toast.success(`¡Código promocional aplicado! ${data.promoCode.name}`);
      } else {
        setPromoError(data.error || "Código promocional inválido");
        setAppliedPromoCode(null);
      }
    } catch (error) {
      console.error("Error validating promo code:", error);
      setPromoError("Error al validar el código promocional");
      setAppliedPromoCode(null);
    } finally {
      setIsValidatingPromo(false);
    }
  }, [formData.selectedTicketType, formData.quantity]);

  // Aplicar código promocional
  const applyPromoCode = useCallback(() => {
    validatePromoCode(formData.promoCode);
  }, [formData.promoCode, validatePromoCode]);

  // Remover código promocional
  const removePromoCode = useCallback(() => {
    setFormData(prev => ({ ...prev, promoCode: "" }));
    setAppliedPromoCode(null);
    setPromoError(null);
  }, []);

  // Manejar cambios en el formulario
  const updateFormData = useCallback((field: keyof PurchaseFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Si cambia el tipo de ticket, validar nuevamente el promo code
    if (field === "selectedTicketType" && appliedPromoCode) {
      validatePromoCode(formData.promoCode);
    }
  }, [appliedPromoCode, formData.promoCode, validatePromoCode]);

  // Incrementar/decrementar cantidad
  const incrementQuantity = useCallback(() => {
    if (formData.quantity < maxQuantityAllowed) {
      updateFormData("quantity", formData.quantity + 1);
    }
  }, [formData.quantity, maxQuantityAllowed, updateFormData]);

  const decrementQuantity = useCallback(() => {
    if (formData.quantity > 1) {
      updateFormData("quantity", formData.quantity - 1);
    }
  }, [formData.quantity, updateFormData]);

  // Validaciones
  const canPurchase = 
    formData.selectedTicketType &&
    formData.quantity > 0 &&
    formData.quantity <= maxQuantityAllowed &&
    formData.agreeToTerms &&
    !isEventFull &&
    !isEventPast;

  return {
    // Estado del formulario
    formData,
    updateFormData,
    
    // Información del ticket seleccionado
    selectedType,
    maxQuantityAllowed,
    
    // Códigos promocionales
    appliedPromoCode,
    isValidatingPromo,
    promoError,
    applyPromoCode,
    removePromoCode,
    
    // Cálculos
    calculations,
    
    // Controles de cantidad
    incrementQuantity,
    decrementQuantity,
    
    // Validaciones
    canPurchase,
    isEventFull,
    isEventPast,
  };
}

// ============================================================================
// HOOK PARA FORMATEO DE DESCUENTOS
// ============================================================================

export function usePromoCodeDisplay() {
  const formatDiscount = useCallback((type: string, value: number): string => {
    switch (type) {
      case "PERCENTAGE":
        return `${value}%`;
      case "FIXED_AMOUNT":
        return `$${value.toLocaleString()}`;
      case "FREE":
        return "Gratis";
      default:
        return value.toString();
    }
  }, []);

  const getDiscountIcon = useCallback((type: string) => {
    switch (type) {
      case "PERCENTAGE":
        return "🔥";
      case "FIXED_AMOUNT":
        return "💰";
      case "FREE":
        return "🎁";
      default:
        return "🏷️";
    }
  }, []);

  return {
    formatDiscount,
    getDiscountIcon,
  };
}

// ============================================================================
// HOOK PARA DISPONIBILIDAD DE TICKETS
// ============================================================================

export function useTicketAvailability(ticketTypes: TicketTypeWithCount[]) {
  const getTicketAvailability = useCallback((ticketType: TicketTypeWithCount) => {
    const sold = ticketType._count.tickets;
    const capacity = ticketType.capacity;
    const available = capacity - sold;
    const percentage = capacity > 0 ? (sold / capacity) * 100 : 0;

    let status: "available" | "limited" | "sold-out" = "available";
    let badgeText = "";
    let badgeColor = "";

    if (available === 0) {
      status = "sold-out";
      badgeText = "Agotado";
      badgeColor = "bg-red-100 text-red-800";
    } else if (percentage >= 90) {
      status = "limited";
      badgeText = `Solo ${available} disponibles`;
      badgeColor = "bg-orange-100 text-orange-800";
    } else {
      status = "available";
      badgeText = `${available} disponibles`;
      badgeColor = "bg-green-100 text-green-800";
    }

    return {
      sold,
      capacity,
      available,
      percentage,
      status,
      badgeText,
      badgeColor,
    };
  }, []);

  const getAvailabilityStats = useCallback(() => {
    const totalCapacity = ticketTypes.reduce((sum, type) => sum + type.capacity, 0);
    const totalSold = ticketTypes.reduce((sum, type) => sum + type._count.tickets, 0);
    const totalAvailable = totalCapacity - totalSold;
    const overallPercentage = totalCapacity > 0 ? (totalSold / totalCapacity) * 100 : 0;

    return {
      totalCapacity,
      totalSold,
      totalAvailable,
      overallPercentage,
    };
  }, [ticketTypes]);

  return {
    getTicketAvailability,
    getAvailabilityStats,
  };
}
