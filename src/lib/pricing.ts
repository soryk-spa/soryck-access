/**
 * Utilities for dynamic pricing functionality
 */

export interface PriceTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
}

export interface TicketTypeWithPricing {
  id: string;
  name: string;
  price: number; // Precio base
  currency: string;
  priceTiers?: PriceTier[];
}

/**
 * Calcula el precio actual de un ticket type basado en la fecha/hora actual
 */
export function getCurrentPrice(ticketType: TicketTypeWithPricing, currentDate: Date = new Date()): {
  price: number;
  tierName?: string;
  isEarlyBird?: boolean;
} {
  // Si no hay price tiers, usar el precio base
  if (!ticketType.priceTiers || ticketType.priceTiers.length === 0) {
    return { price: ticketType.price };
  }

  // Filtrar tiers activos y válidos para la fecha actual
  const validTiers = ticketType.priceTiers
    .filter(tier => {
      if (!tier.isActive) return false;
      
      // Verificar que esté dentro del rango de fechas
      const isAfterStart = currentDate >= tier.startDate;
      const isBeforeEnd = !tier.endDate || currentDate <= tier.endDate;
      
      return isAfterStart && isBeforeEnd;
    })
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  // Si no hay tiers válidos, usar precio base
  if (validTiers.length === 0) {
    return { price: ticketType.price };
  }

  // Usar el último tier que haya comenzado (el más reciente)
  const currentTier = validTiers[validTiers.length - 1];
  
  // Determinar si es "early bird" (precio menor al base)
  const isEarlyBird = currentTier.price < ticketType.price;
  
  return {
    price: currentTier.price,
    tierName: currentTier.name,
    isEarlyBird
  };
}

/**
 * Obtiene el próximo cambio de precio para un ticket type
 */
export function getNextPriceChange(ticketType: TicketTypeWithPricing, currentDate: Date = new Date()): {
  nextTier?: PriceTier;
  timeUntilChange?: number; // milisegundos
} | null {
  if (!ticketType.priceTiers || ticketType.priceTiers.length === 0) {
    return null;
  }

  // Encontrar el próximo tier que va a activarse
  const upcomingTiers = ticketType.priceTiers
    .filter(tier => tier.isActive && tier.startDate > currentDate)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  if (upcomingTiers.length === 0) {
    return null;
  }

  const nextTier = upcomingTiers[0];
  const timeUntilChange = nextTier.startDate.getTime() - currentDate.getTime();

  return {
    nextTier,
    timeUntilChange
  };
}

/**
 * Formatea el tiempo restante hasta el próximo cambio de precio
 */
export function formatTimeUntilPriceChange(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / (24 * 3600));
  const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

/**
 * Crea un price tier por defecto para un ticket type
 */
export function createDefaultPriceTiers(
  basePrice: number,
  currency: string,
  eventStartDate: Date
): Omit<PriceTier, 'id'>[] {
  const eventDate = new Date(eventStartDate);
  
  // Early Bird: 30 días antes del evento
  const earlyBirdStart = new Date(eventDate);
  earlyBirdStart.setDate(earlyBirdStart.getDate() - 30);
  
  // Regular: 7 días antes del evento
  const regularStart = new Date(eventDate);
  regularStart.setDate(regularStart.getDate() - 7);
  
  // Last Minute: 1 día antes del evento
  const lastMinuteStart = new Date(eventDate);
  lastMinuteStart.setDate(lastMinuteStart.getDate() - 1);

  return [
    {
      name: "Early Bird",
      price: Math.round(basePrice * 0.8), // 20% descuento
      currency,
      startDate: earlyBirdStart,
      endDate: regularStart,
      isActive: true
    },
    {
      name: "Precio Regular",
      price: basePrice,
      currency,
      startDate: regularStart,
      endDate: lastMinuteStart,
      isActive: true
    },
    {
      name: "Last Minute",
      price: Math.round(basePrice * 1.25), // 25% incremento
      currency,
      startDate: lastMinuteStart,
      endDate: null, // Hasta el final del evento
      isActive: true
    }
  ];
}
