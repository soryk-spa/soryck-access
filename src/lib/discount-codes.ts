import { prisma } from "@/lib/prisma";
import { PromoCodeService } from "./promo-codes";
import type { PromoCode, CourtesyRequest } from "@prisma/client";

export interface UnifiedDiscountResult {
  isValid: boolean;
  error?: string;
  type: 'PROMO_CODE' | 'COURTESY_CODE';
  code: string;
  name: string;
  description: string;
  discountAmount: number;
  finalAmount: number;
  discountPercentage: number;
  codeData?: PromoCode | CourtesyRequest; 
}

export class DiscountCodeService {
  
  static async validateDiscountCode(
    code: string,
    userId: string,
    ticketTypeId: string,
    quantity: number
  ): Promise<UnifiedDiscountResult> {
    
    const promoResult = await PromoCodeService.validatePromoCode(
      code,
      userId,
      ticketTypeId,
      quantity
    );

    if (promoResult.isValid) {
      return {
        isValid: true,
        type: 'PROMO_CODE',
        code: promoResult.promoCode!.code,
        name: promoResult.promoCode!.name,
        description: promoResult.promoCode!.description || '',
        discountAmount: promoResult.discountAmount!,
        finalAmount: promoResult.finalAmount!,
        discountPercentage: promoResult.discountPercentage!,
        codeData: promoResult.promoCode
      };
    }

    
    const courtesyResult = await this.validateCourtesyCode(
      code,
      ticketTypeId,
      quantity
    );

    if (courtesyResult.isValid) {
      return courtesyResult;
    }

    
    return {
      isValid: false,
      error: promoResult.error || "Código no válido",
      type: 'PROMO_CODE',
      code: '',
      name: '',
      description: '',
      discountAmount: 0,
      finalAmount: 0,
      discountPercentage: 0
    };
  }

  
  static async validateCourtesyCode(
    code: string,
    ticketTypeId: string,
    quantity: number
  ): Promise<UnifiedDiscountResult> {
    try {
      
      const ticketType = await prisma.ticketType.findUnique({
        where: { id: ticketTypeId },
        include: {
          event: true
        }
      });

      if (!ticketType) {
        return {
          isValid: false,
          error: 'Tipo de ticket no encontrado',
          type: 'COURTESY_CODE',
          code: '',
          name: '',
          description: '',
          discountAmount: 0,
          finalAmount: 0,
          discountPercentage: 0
        };
      }

      
      const courtesyRequest = await prisma.courtesyRequest.findFirst({
        where: {
          code: code.toUpperCase(),
          eventId: ticketType.eventId,
          status: 'APPROVED',
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              price: true,
            },
          },
        },
      });

      if (!courtesyRequest) {
        return {
          isValid: false,
          error: 'Código de cortesía no encontrado o no válido',
          type: 'COURTESY_CODE',
          code: '',
          name: '',
          description: '',
          discountAmount: 0,
          finalAmount: 0,
          discountPercentage: 0
        };
      }

      
      if (courtesyRequest.expiresAt && new Date() > courtesyRequest.expiresAt) {
        
        await prisma.courtesyRequest.update({
          where: { id: courtesyRequest.id },
          data: { status: 'EXPIRED' },
        });

        return {
          isValid: false,
          error: 'El código de cortesía ha expirado',
          type: 'COURTESY_CODE',
          code: '',
          name: '',
          description: '',
          discountAmount: 0,
          finalAmount: 0,
          discountPercentage: 0
        };
      }

      
      if (courtesyRequest.status === 'USED') {
        return {
          isValid: false,
          error: 'Este código de cortesía ya ha sido utilizado',
          type: 'COURTESY_CODE',
          code: '',
          name: '',
          description: '',
          discountAmount: 0,
          finalAmount: 0,
          discountPercentage: 0
        };
      }

      
      const pricePerTicket = ticketType.price;
      const totalQuantity = quantity;
      
      let discountPerTicket = 0;
      
      if (courtesyRequest.codeType === 'FREE') {
        discountPerTicket = pricePerTicket; 
      } else if (courtesyRequest.codeType === 'DISCOUNT' && courtesyRequest.discountValue) {
        discountPerTicket = Math.min(courtesyRequest.discountValue, pricePerTicket);
      }

      const totalDiscountAmount = discountPerTicket * totalQuantity;
      const finalAmountPerTicket = pricePerTicket - discountPerTicket;
      const totalFinalAmount = finalAmountPerTicket * totalQuantity;
      const totalBaseAmount = pricePerTicket * totalQuantity;

      const discountPercentage = totalBaseAmount > 0 ? (totalDiscountAmount / totalBaseAmount) * 100 : 0;

      return {
        isValid: true,
        type: 'COURTESY_CODE',
        code: courtesyRequest.code!,
        name: `Cortesía - ${courtesyRequest.event.title}`,
        description: courtesyRequest.codeType === 'FREE' 
          ? 'Entrada gratuita' 
          : `Descuento de $${courtesyRequest.discountValue} CLP`,
        discountAmount: totalDiscountAmount,
        finalAmount: totalFinalAmount,
        discountPercentage,
        codeData: courtesyRequest
      };

    } catch (error) {
      console.error('Error validating courtesy code:', error);
      return {
        isValid: false,
        error: 'Error al validar el código de cortesía',
        type: 'COURTESY_CODE',
        code: '',
        name: '',
        description: '',
        discountAmount: 0,
        finalAmount: 0,
        discountPercentage: 0
      };
    }
  }

  
  static async applyCodeUsage(
    result: UnifiedDiscountResult,
    userId: string,
    orderId: string,
    originalAmount: number,
    finalAmount: number
  ): Promise<void> {
    if (!result.codeData) {
      throw new Error('Datos del código no disponibles');
    }

    if (result.type === 'PROMO_CODE') {
      
      await PromoCodeService.applyPromoCodeToOrder(
        (result.codeData as PromoCode).id,
        userId,
        orderId,
        result.discountAmount,
        originalAmount,
        finalAmount
      );
    } else if (result.type === 'COURTESY_CODE') {
      
      await prisma.courtesyRequest.update({
        where: { id: (result.codeData as CourtesyRequest).id },
        data: {
          status: 'USED',
          usedAt: new Date(),
        },
      });
    }
  }
}
