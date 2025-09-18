

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
  price: number; 
  currency: string;
  priceTiers?: PriceTier[];
}


export function getCurrentPrice(ticketType: TicketTypeWithPricing, currentDate: Date = new Date()): {
  price: number;
  tierName?: string;
  isEarlyBird?: boolean;
} {
  
  if (!ticketType.priceTiers || ticketType.priceTiers.length === 0) {
    return { price: ticketType.price };
  }

  
  const validTiers = ticketType.priceTiers
    .filter(tier => {
      if (!tier.isActive) return false;
      
      
      const isAfterStart = currentDate >= tier.startDate;
      const isBeforeEnd = !tier.endDate || currentDate <= tier.endDate;
      
      return isAfterStart && isBeforeEnd;
    })
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  
  if (validTiers.length === 0) {
    return { price: ticketType.price };
  }

  
  const currentTier = validTiers[validTiers.length - 1];
  
  
  const isEarlyBird = currentTier.price < ticketType.price;
  
  return {
    price: currentTier.price,
    tierName: currentTier.name,
    isEarlyBird
  };
}


export function getNextPriceChange(ticketType: TicketTypeWithPricing, currentDate: Date = new Date()): {
  nextTier?: PriceTier;
  timeUntilChange?: number; 
} | null {
  if (!ticketType.priceTiers || ticketType.priceTiers.length === 0) {
    return null;
  }

  
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


export function createDefaultPriceTiers(
  basePrice: number,
  currency: string,
  eventStartDate: Date
): Omit<PriceTier, 'id'>[] {
  const eventDate = new Date(eventStartDate);
  
  
  const earlyBirdStart = new Date(eventDate);
  earlyBirdStart.setDate(earlyBirdStart.getDate() - 30);
  
  
  const regularStart = new Date(eventDate);
  regularStart.setDate(regularStart.getDate() - 7);
  
  
  const lastMinuteStart = new Date(eventDate);
  lastMinuteStart.setDate(lastMinuteStart.getDate() - 1);

  return [
    {
      name: "Early Bird",
      price: Math.round(basePrice * 0.8), 
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
      price: Math.round(basePrice * 1.25), 
      currency,
      startDate: lastMinuteStart,
      endDate: null, 
      isActive: true
    }
  ];
}
