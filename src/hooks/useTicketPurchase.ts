

import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import type { Event, TicketType as BaseTicketType } from "@/types";
import { calculateTotalPrice } from "@/lib/commission";
import { getCurrentPrice, type TicketTypeWithPricing } from "@/lib/pricing";






export type TicketTypeWithCount = BaseTicketType;

export interface PromoCodeData {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE";
  name: string;
  description?: string;
  
  discountAmount: number;
  finalAmount: number;
  percentage: number;
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
  totalPrice: number; 
  savings: number;
}





export function useTicketPurchase(event: Event, ticketTypes: TicketTypeWithCount[]) {
  
  const [formData, setFormData] = useState<PurchaseFormData>({
    selectedTicketType: "",
    quantity: 1,
    agreeToTerms: false,
    promoCode: "",
  });

  
  const [appliedPromoCode, setAppliedPromoCode] = useState<PromoCodeData | null>(null);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);

  
  const selectedType = ticketTypes.find((t) => t.id === formData.selectedTicketType);
  const isEventPast = new Date(event.startDate) < new Date();
  
  const maxQuantityAllowed = 10; 

  
  const getCurrentDynamicPrice = useCallback((ticketType: BaseTicketType): number => {
    if (!ticketType.priceTiers || ticketType.priceTiers.length === 0) {
      return ticketType.price;
    }

    const ticketTypeWithPricing: TicketTypeWithPricing = {
      id: ticketType.id,
      name: ticketType.name,
      price: ticketType.price,
      currency: ticketType.currency,
      priceTiers: ticketType.priceTiers.map(tier => ({
        ...tier,
        startDate: new Date(tier.startDate),
        endDate: tier.endDate ? new Date(tier.endDate) : null,
      })),
    };

    const currentPriceInfo = getCurrentPrice(ticketTypeWithPricing);
    return currentPriceInfo.price;
  }, []);

  
  useEffect(() => {
    const firstAvailable = ticketTypes[0];
    if (firstAvailable && !formData.selectedTicketType) {
      setFormData(prev => ({ ...prev, selectedTicketType: firstAvailable.id }));
    }
  }, [ticketTypes, formData.selectedTicketType]);

  
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

    const currentPrice = getCurrentDynamicPrice(selectedType);
    const subtotal = currentPrice * formData.quantity;
    let discountAmount = 0;

    if (appliedPromoCode) {
      
      discountAmount = appliedPromoCode.discountAmount;
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
  }, [selectedType, formData.quantity, appliedPromoCode, getCurrentDynamicPrice])();

  
  const validatePromoCode = useCallback(async (code: string) => {
    if (!code.trim()) {
      setAppliedPromoCode(null);
      setPromoError(null);
      return;
    }

    setIsValidatingPromo(true);
    setPromoError(null);

    try {
      const response = await fetch(`/api/discount-codes/validate`, {
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
        const promoData: PromoCodeData = {
          id: data.promoCode.id,
          code: data.promoCode.code,
          type: data.promoCode.type,
          name: data.promoCode.name,
          description: data.promoCode.description,
          discountAmount: data.discount.amount,
          finalAmount: data.discount.finalAmount,
          percentage: data.discount.percentage,
        };
        setAppliedPromoCode(promoData);
        
        
        const codeTypeMessage = data.codeType === 'COURTESY_CODE' 
          ? '¡Código de cortesía aplicado!' 
          : '¡Código promocional aplicado!';
        toast.success(`${codeTypeMessage} ${data.promoCode.name}`);
      } else {
        setPromoError(data.error || "Código no válido");
        setAppliedPromoCode(null);
      }
    } catch (error) {
      console.error("Error validating discount code:", error);
      setPromoError("Error al validar el código");
      setAppliedPromoCode(null);
    } finally {
      setIsValidatingPromo(false);
    }
  }, [formData.selectedTicketType, formData.quantity]);

  
  const applyPromoCode = useCallback(() => {
    validatePromoCode(formData.promoCode);
  }, [formData.promoCode, validatePromoCode]);

  
  const removePromoCode = useCallback(() => {
    setFormData(prev => ({ ...prev, promoCode: "" }));
    setAppliedPromoCode(null);
    setPromoError(null);
  }, []);

  
  const updateFormData = useCallback((field: keyof PurchaseFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    
    if (field === "selectedTicketType" && appliedPromoCode) {
      validatePromoCode(formData.promoCode);
    }
  }, [appliedPromoCode, formData.promoCode, validatePromoCode]);

  
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

  
  const canPurchase = 
    formData.selectedTicketType &&
    formData.quantity > 0 &&
    formData.quantity <= maxQuantityAllowed &&
    formData.agreeToTerms &&
    !isEventPast;

  return {
    
    formData,
    updateFormData,
    
    
    selectedType,
    maxQuantityAllowed,
    
    
    appliedPromoCode,
    isValidatingPromo,
    promoError,
    applyPromoCode,
    removePromoCode,
    
    
    calculations,
    
    
    incrementQuantity,
    decrementQuantity,
    
    
    canPurchase,
    isEventPast,
  };
}





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





export function useTicketAvailability() {
  const getTicketAvailability = useCallback(() => {
    
    const status = "available";
    const badgeText = "";
    const badgeColor = "";

    return {
      status,
      badgeText,
      badgeColor,
      percentage: 0,
      available: 999, 
      sold: 0, 
    };
  }, []);

  const getAvailabilityStats = useCallback(() => {
    return {
      totalCapacity: 0,
      totalSold: 0,
      totalAvailable: 999,
      overallPercentage: 0,
    };
  }, []);

  return {
    getTicketAvailability,
    getAvailabilityStats,
  };
}
