
import { prisma } from '@/lib/prisma';
import { PromoCodeType, PromoCodeStatus } from '@prisma/client';


export interface PromoCodeDynamicConfig {
  enabled: boolean;
  validUntil?: Date | null;
  priceAfter?: number | null;
}


export function getPromoCodeDynamicPrice(
  promoCode: import('@prisma/client').PromoCode,
  currentDate: Date = new Date()
): number | 'free' | null {
  
  if (!promoCode.priceAfter || !promoCode.validUntil) {
    return null; 
  }

  
  if (currentDate <= promoCode.validUntil) {
    return 'free'; 
  }

  
  return promoCode.priceAfter;
}


export function isPromoCodeDynamic(promoCode: import('@prisma/client').PromoCode): boolean {
  return !!(promoCode.priceAfter && promoCode.validUntil);
}


export function getPromoCodeCurrentState(
  promoCode: import('@prisma/client').PromoCode,
  currentDate: Date = new Date()
): 'discount' | 'fixed-price' | 'expired' {
  if (!isPromoCodeDynamic(promoCode)) {
    return 'discount'; 
  }

  if (!promoCode.validUntil) {
    return 'expired';
  }

  if (currentDate <= promoCode.validUntil) {
    return 'discount'; 
  }

  return 'fixed-price'; 
}

export interface PromoCodeValidationResult {
  isValid: boolean;
  error?: string;
  promoCode?: import('@prisma/client').PromoCode;
  discountAmount?: number;
  finalAmount?: number;
  discountPercentage?: number;
}

export interface ApplyPromoCodeData {
  ticketTypeId: string;
  quantity: number;
  userId: string;
  promoCode: string;
}

export interface PriceCalculation {
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  commissionAmount: number;
  totalAmount: number;
}

export class PromoCodeService {
  
  static async validatePromoCode(
    code: string,
    userId: string,
    ticketTypeId: string,
    quantity: number
  ): Promise<PromoCodeValidationResult> {
    try {
      
      const promoCode = await prisma.promoCode.findUnique({
        where: { code: code.toUpperCase() },
        include: {
          event: {
            include: {
              ticketTypes: true
            }
          },
          category: true,
          ticketType: true,
          usages: {
            where: { userId },
            select: { id: true }
          }
        }
      });

      if (!promoCode) {
        return { isValid: false, error: 'Código promocional no válido' };
      }

      
      if (promoCode.status !== PromoCodeStatus.ACTIVE) {
        return { isValid: false, error: 'Código promocional no está activo' };
      }

      
      const now = new Date();
      if (promoCode.validFrom > now) {
        return { isValid: false, error: 'Código promocional aún no es válido' };
      }
      
      if (promoCode.validUntil && promoCode.validUntil < now) {
        return { isValid: false, error: 'Código promocional ha expirado' };
      }

      
      if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
        return { isValid: false, error: 'Código promocional ha alcanzado su límite de usos' };
      }

      
      if (promoCode.usageLimitPerUser && promoCode.usages.length >= promoCode.usageLimitPerUser) {
        return { isValid: false, error: 'Has alcanzado el límite de usos para este código' };
      }

      
      const ticketType = await prisma.ticketType.findUnique({
        where: { id: ticketTypeId },
        include: {
          event: {
            include: {
              category: true
            }
          }
        }
      });

      if (!ticketType) {
        return { isValid: false, error: 'Tipo de ticket no encontrado' };
      }

      
      if (promoCode.eventId && promoCode.eventId !== ticketType.eventId) {
        return { isValid: false, error: 'Este código no es válido para este evento' };
      }

      if (promoCode.categoryId && promoCode.categoryId !== ticketType.event.categoryId) {
        return { isValid: false, error: 'Este código no es válido para esta categoría de evento' };
      }

      if (promoCode.ticketTypeId && promoCode.ticketTypeId !== ticketTypeId) {
        return { isValid: false, error: 'Este código no es válido para este tipo de ticket' };
      }

      
      const pricePerTicket = ticketType.price;
      const totalQuantity = quantity;
      
      
      const totalBaseAmount = pricePerTicket * totalQuantity;
      if (promoCode.minOrderAmount && totalBaseAmount < promoCode.minOrderAmount) {
        return { 
          isValid: false, 
          error: `Monto mínimo requerido: $${promoCode.minOrderAmount.toLocaleString('es-CL')} ${promoCode.currency}` 
        };
      }

      
      const discountPerTicket = this.calculateDiscountPerTicket(pricePerTicket, promoCode, now);
      const totalDiscountAmount = discountPerTicket.discountAmount * totalQuantity;
      const finalAmountPerTicket = discountPerTicket.finalAmount;
      const totalFinalAmount = finalAmountPerTicket * totalQuantity;

      return {
        isValid: true,
        promoCode,
        discountAmount: totalDiscountAmount,
        finalAmount: totalFinalAmount,
        discountPercentage: totalDiscountAmount > 0 ? (totalDiscountAmount / totalBaseAmount) * 100 : 0
      };

    } catch (error) {
      console.error('Error validating promo code:', error);
      return { isValid: false, error: 'Error al validar el código promocional' };
    }
  }

  
  static calculateDiscountPerTicket(
    ticketPrice: number, 
    promoCode: import('@prisma/client').PromoCode,
    currentDate: Date = new Date()
  ): { discountAmount: number; finalAmount: number; isDynamic?: boolean; isFixedPrice?: boolean } {
    
    const dynamicPrice = getPromoCodeDynamicPrice(promoCode, currentDate);
    
    if (dynamicPrice === 'free') {
      
      return this.calculateOriginalDiscount(ticketPrice, promoCode);
    } else if (typeof dynamicPrice === 'number') {
      
      const fixedPrice = dynamicPrice;
      const discountAmount = Math.max(0, ticketPrice - fixedPrice);
      return {
        discountAmount: Math.round(discountAmount),
        finalAmount: Math.round(fixedPrice),
        isDynamic: true,
        isFixedPrice: true
      };
    }
    
    
    return this.calculateOriginalDiscount(ticketPrice, promoCode);
  }

  private static calculateOriginalDiscount(
    ticketPrice: number, 
    promoCode: import('@prisma/client').PromoCode
  ): { discountAmount: number; finalAmount: number; isDynamic?: boolean } {
    let discountAmount = 0;

    switch (promoCode.type) {
      case PromoCodeType.PERCENTAGE:
        discountAmount = (ticketPrice * promoCode.value) / 100;
        
        if (promoCode.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, promoCode.maxDiscountAmount);
        }
        break;

      case PromoCodeType.FIXED_AMOUNT:
        
        discountAmount = Math.min(promoCode.value, ticketPrice);
        break;

      case PromoCodeType.FREE:
        
        discountAmount = ticketPrice;
        break;

      default:
        discountAmount = 0;
    }

    
    discountAmount = Math.min(discountAmount, ticketPrice);
    discountAmount = Math.max(0, discountAmount); 

    const finalAmount = Math.max(0, ticketPrice - discountAmount);

    return {
      discountAmount: Math.round(discountAmount),
      finalAmount: Math.round(finalAmount)
    };
  }

  
  static calculateDiscount(
    baseAmount: number, 
    promoCode: import('@prisma/client').PromoCode
  ): { discountAmount: number; finalAmount: number } {
    let discountAmount = 0;

    switch (promoCode.type) {
      case PromoCodeType.PERCENTAGE:
        discountAmount = (baseAmount * promoCode.value) / 100;
        
        if (promoCode.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, promoCode.maxDiscountAmount);
        }
        break;

      case PromoCodeType.FIXED_AMOUNT:
        discountAmount = Math.min(promoCode.value, baseAmount);
        break;

      case PromoCodeType.FREE:
        discountAmount = baseAmount;
        break;

      default:
        discountAmount = 0;
    }

    
    discountAmount = Math.min(discountAmount, baseAmount);
    discountAmount = Math.max(0, discountAmount); 

    const finalAmount = Math.max(0, baseAmount - discountAmount);

    return {
      discountAmount: Math.round(discountAmount),
      finalAmount: Math.round(finalAmount)
    };
  }

  static async applyPromoCodeToOrder(
    promoCodeId: string,
    userId: string,
    orderId: string,
    discountAmount: number,
    originalAmount: number,
    finalAmount: number
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      
      await tx.promoCodeUsage.create({
        data: {
          promoCodeId,
          userId,
          orderId,
          discountAmount,
          originalAmount,
          finalAmount
        }
      });

      
      await tx.promoCode.update({
        where: { id: promoCodeId },
        data: { usedCount: { increment: 1 } }
      });

      
      await tx.order.update({
        where: { id: orderId },
        data: {
          discountAmount,
          originalAmount
        }
      });
    });
  }

  static async getActivePromoCodes(eventId?: string, categoryId?: string) {
    const now = new Date();
    
    return await prisma.promoCode.findMany({
      where: {
        status: PromoCodeStatus.ACTIVE,
        validFrom: { lte: now },
        OR: [
          { validUntil: null },
          { validUntil: { gte: now } }
        ],
        ...(eventId && { 
          OR: [
            { eventId },
            { eventId: null }
          ]
        }),
        ...(categoryId && {
          OR: [
            { categoryId },
            { categoryId: null }
          ]
        })
      },
      include: {
        event: {
          select: { title: true }
        },
        category: {
          select: { name: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  static formatDiscountDescription(promoCode: import('@prisma/client').PromoCode): string {
    switch (promoCode.type) {
      case PromoCodeType.PERCENTAGE:
        return `${promoCode.value}% de descuento`;
      case PromoCodeType.FIXED_AMOUNT:
        return `$${promoCode.value.toLocaleString('es-CL')} de descuento`;
      case PromoCodeType.FREE:
        return 'Gratis';
      default:
        return 'Descuento';
    }
  }

  static generatePromoCode(prefix: string = 'SP'): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const codeLength = 8;
    let result = prefix;
    
    for (let i = 0; i < codeLength - prefix.length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  static async isCodeUnique(code: string): Promise<boolean> {
    const existing = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() }
    });
    return !existing;
  }
}