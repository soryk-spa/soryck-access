export const COMMISSION_RATE = 0.06; // 6%

export interface PriceBreakdown {
  basePrice: number;
  commission: number;
  totalPrice: number;
  currency: string;
}

export function calculateTotalPrice(basePrice: number): number {
  if (basePrice === 0) return 0;
  return Math.round(basePrice * (1 + COMMISSION_RATE));
}

export function calculatePriceBreakdown(
  basePrice: number, 
  currency: string = 'CLP'
): PriceBreakdown {
  if (basePrice === 0) {
    return {
      basePrice: 0,
      commission: 0,
      totalPrice: 0,
      currency
    };
  }

  const commission = Math.round(basePrice * COMMISSION_RATE);
  const totalPrice = basePrice + commission;

  return {
    basePrice,
    commission,
    totalPrice,
    currency
  };
}

export function calculateBasePriceFromTotal(totalPrice: number): number {
  if (totalPrice === 0) return 0;
  return Math.round(totalPrice / (1 + COMMISSION_RATE));
}

export function formatPrice(price: number, currency: string = 'CLP'): string {
  if (price === 0) return 'Gratis';
  
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

export function formatPriceBreakdown(breakdown: PriceBreakdown): {
  basePrice: string;
  commission: string;
  totalPrice: string;
  commissionPercentage: string;
} {
  return {
    basePrice: formatPrice(breakdown.basePrice, breakdown.currency),
    commission: formatPrice(breakdown.commission, breakdown.currency),
    totalPrice: formatPrice(breakdown.totalPrice, breakdown.currency),
    commissionPercentage: `${(COMMISSION_RATE * 100).toFixed(0)}%`
  };
}