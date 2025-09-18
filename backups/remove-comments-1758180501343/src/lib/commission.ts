export const COMMISSION_RATE = 0.06; 

export interface PriceBreakdown {
  basePrice: number;
  commission: number;
  totalPrice: number;
  currency: string;
  originalAmount?: number;
  discountAmount?: number;
  promoCode?: string;
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
      currency,
      originalAmount: 0,
      discountAmount: 0
    };
  }

  const commission = Math.round(basePrice * COMMISSION_RATE);
  const totalPrice = basePrice + commission;

  return {
    basePrice,
    commission,
    totalPrice,
    currency,
    originalAmount: basePrice, 
    discountAmount: 0 
  };
}

export function calculatePriceBreakdownWithDiscount(
  originalAmount: number,
  discountAmount: number,
  currency: string = 'CLP'
): PriceBreakdown {
  const discountedAmount = Math.max(0, originalAmount - discountAmount);
  const breakdown = calculatePriceBreakdown(discountedAmount, currency);
  
  return {
    ...breakdown,
    originalAmount,
    discountAmount
  };
}

export function calculateBasePriceFromTotal(totalPrice: number): number {
  if (totalPrice === 0) return 0;
  return Math.round(totalPrice / (1 + COMMISSION_RATE));
}

export function formatPrice(price: number, currency?: string): string {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ = currency; 
  
  if (price === 0) return 'Gratis';
  
  
  
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };
  
  return `$${formatNumber(Math.round(price))}`;
}

export function formatPriceBreakdown(breakdown: PriceBreakdown): {
  basePrice: string;
  commission: string;
  totalPrice: string;
  commissionPercentage: string;
} {
  return {
    basePrice: formatPrice(breakdown.basePrice),
    commission: formatPrice(breakdown.commission),
    totalPrice: formatPrice(breakdown.totalPrice),
    commissionPercentage: `${(COMMISSION_RATE * 100).toFixed(0)}%`
  };
}

export function formatPriceBreakdownWithDiscount(breakdown: PriceBreakdown): {
  originalAmount: string;
  discountAmount: string;
  basePrice: string;
  commission: string;
  totalPrice: string;
  commissionPercentage: string;
  savingsPercentage?: string;
} {
  const formatted = formatPriceBreakdown(breakdown);
  
  return {
    ...formatted,
    originalAmount: formatPrice(breakdown.originalAmount || 0),
    discountAmount: formatPrice(breakdown.discountAmount || 0),
    savingsPercentage: breakdown.originalAmount && breakdown.discountAmount 
      ? `${Math.round((breakdown.discountAmount / breakdown.originalAmount) * 100)}%`
      : undefined
  };
}