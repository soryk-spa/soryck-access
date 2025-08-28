// src/lib/promo-codes.ts
import { prisma } from '@/lib/prisma';
import { PromoCodeType, PromoCodeStatus } from '@prisma/client';

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
      // Buscar el código promocional
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

      // Verificar estado
      if (promoCode.status !== PromoCodeStatus.ACTIVE) {
        return { isValid: false, error: 'Código promocional no está activo' };
      }

      // Verificar fechas de validez
      const now = new Date();
      if (promoCode.validFrom > now) {
        return { isValid: false, error: 'Código promocional aún no es válido' };
      }
      
      if (promoCode.validUntil && promoCode.validUntil < now) {
        return { isValid: false, error: 'Código promocional ha expirado' };
      }

      // Verificar límite de usos total
      if (promoCode.usageLimit && promoCode.usedCount >= promoCode.usageLimit) {
        return { isValid: false, error: 'Código promocional ha alcanzado su límite de usos' };
      }

      // Verificar límite de usos por usuario
      if (promoCode.usageLimitPerUser && promoCode.usages.length >= promoCode.usageLimitPerUser) {
        return { isValid: false, error: 'Has alcanzado el límite de usos para este código' };
      }

      // Obtener información del ticket type
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

      // Verificar restricciones de aplicabilidad
      if (promoCode.eventId && promoCode.eventId !== ticketType.eventId) {
        return { isValid: false, error: 'Este código no es válido para este evento' };
      }

      if (promoCode.categoryId && promoCode.categoryId !== ticketType.event.categoryId) {
        return { isValid: false, error: 'Este código no es válido para esta categoría de evento' };
      }

      if (promoCode.ticketTypeId && promoCode.ticketTypeId !== ticketTypeId) {
        return { isValid: false, error: 'Este código no es válido para este tipo de ticket' };
      }

      // Calcular descuento POR TICKET y luego multiplicar por cantidad
      const pricePerTicket = ticketType.price;
      const totalQuantity = quantity;
      
      // Verificar monto mínimo contra el total
      const totalBaseAmount = pricePerTicket * totalQuantity;
      if (promoCode.minOrderAmount && totalBaseAmount < promoCode.minOrderAmount) {
        return { 
          isValid: false, 
          error: `Monto mínimo requerido: $${promoCode.minOrderAmount.toLocaleString('es-CL')} ${promoCode.currency}` 
        };
      }

      // Calcular descuento por ticket individual
      const discountPerTicket = this.calculateDiscountPerTicket(pricePerTicket, promoCode);
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

  // Nuevo método: Calcular descuento por ticket individual
  static calculateDiscountPerTicket(
    ticketPrice: number, 
    promoCode: import('@prisma/client').PromoCode
  ): { discountAmount: number; finalAmount: number } {
    let discountAmount = 0;

    switch (promoCode.type) {
      case PromoCodeType.PERCENTAGE:
        discountAmount = (ticketPrice * promoCode.value) / 100;
        // Para porcentajes, aplicar límite máximo POR TICKET si existe
        if (promoCode.maxDiscountAmount) {
          discountAmount = Math.min(discountAmount, promoCode.maxDiscountAmount);
        }
        break;

      case PromoCodeType.FIXED_AMOUNT:
        // El descuento fijo se aplica POR TICKET (este era el bug principal)
        discountAmount = Math.min(promoCode.value, ticketPrice);
        break;

      case PromoCodeType.FREE:
        // Ticket gratuito
        discountAmount = ticketPrice;
        break;

      default:
        discountAmount = 0;
    }

    // Asegurar que el descuento no sea mayor al precio del ticket
    discountAmount = Math.min(discountAmount, ticketPrice);
    discountAmount = Math.max(0, discountAmount); // No permitir descuentos negativos

    const finalAmount = Math.max(0, ticketPrice - discountAmount);

    return {
      discountAmount: Math.round(discountAmount),
      finalAmount: Math.round(finalAmount)
    };
  }

  // Método original mantenido para compatibilidad con código existente
  static calculateDiscount(
    baseAmount: number, 
    promoCode: import('@prisma/client').PromoCode
  ): { discountAmount: number; finalAmount: number } {
    let discountAmount = 0;

    switch (promoCode.type) {
      case PromoCodeType.PERCENTAGE:
        discountAmount = (baseAmount * promoCode.value) / 100;
        // Aplicar límite máximo de descuento si existe
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

    // Asegurar que el descuento no sea mayor al monto base
    discountAmount = Math.min(discountAmount, baseAmount);
    discountAmount = Math.max(0, discountAmount); // No permitir descuentos negativos

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
      // Crear registro de uso
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

      // Incrementar contador de usos
      await tx.promoCode.update({
        where: { id: promoCodeId },
        data: { usedCount: { increment: 1 } }
      });

      // Actualizar orden con información del descuento
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