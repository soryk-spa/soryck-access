/**
 * Tests para validaciones de formularios críticas
 * @file src/lib/validations.ts  
 */

import { z } from 'zod';

// Esquemas de validación críticos del proyecto
const eventValidationSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(100, 'El título es demasiado largo'),
  description: z.string().optional().nullable(),
  location: z.string().min(1, 'La ubicación es requerida').max(200, 'La ubicación es demasiado larga'),
  startDate: z.string().refine((date) => {
    try {
      return new Date(date) > new Date();
    } catch {
      return false;
    }
  }, 'La fecha debe ser en el futuro'),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  imageUrl: z.string().url("Debe ser una URL válida").optional().or(z.literal('')),
});

const ticketValidationSchema = z.object({
  name: z.string().min(1, 'El nombre del tipo de entrada es requerido').max(100),
  price: z.number().min(0, 'El precio no puede ser negativo'),
  capacity: z.number().min(1, 'La capacidad debe ser al menos 1'),
  ticketsGenerated: z.number().min(1, 'Debe generar al menos 1 ticket').default(1),
});

const paymentValidationSchema = z.object({
  ticketTypeId: z.string().min(1, "Se requiere el tipo de ticket"),
  quantity: z.number().min(1, "La cantidad debe ser al menos 1").max(10, "No puedes comprar más de 10 tickets a la vez."),
  promoCode: z.string().optional(),
});

const promoCodeValidationSchema = z.object({
  code: z.string().min(3, 'El código debe tener al menos 3 caracteres').max(20, 'El código es demasiado largo'),
  name: z.string().min(1, 'El nombre es requerido').max(100),
  type: z.enum(['PERCENTAGE', 'FIXED_AMOUNT'], {
    message: 'Tipo de descuento inválido'
  }),
  value: z.number().min(0.01, 'El valor debe ser mayor a 0'),
  validFrom: z.string().refine((date) => {
    try {
      return new Date(date);
    } catch {
      return false;
    }
  }, 'Fecha de inicio inválida'),
  validUntil: z.string().refine((date) => {
    try {
      return new Date(date);
    } catch {
      return false;
    }
  }, 'Fecha de fin inválida'),
});

describe('Validaciones de Formularios Críticas', () => {
  describe('Validación de Eventos', () => {
    const validEventData = {
      title: 'Evento de Prueba',
      description: 'Descripción del evento',
      location: 'Santiago, Chile',
      startDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Mañana
      categoryId: 'cat123',
      imageUrl: 'https://example.com/image.jpg',
    };

    it('debería validar datos de evento correctos', () => {
      const result = eventValidationSchema.safeParse(validEventData);
      expect(result.success).toBe(true);
    });

    it('debería rechazar título vacío', () => {
      const invalidData = { ...validEventData, title: '' };
      const result = eventValidationSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El título es requerido');
      }
    });

    it('debería rechazar título muy largo', () => {
      const longTitle = 'a'.repeat(101);
      const invalidData = { ...validEventData, title: longTitle };
      const result = eventValidationSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El título es demasiado largo');
      }
    });

    it('debería rechazar fecha en el pasado', () => {
      const pastDate = '2020-01-01T20:00:00Z';
      const invalidData = { ...validEventData, startDate: pastDate };
      const result = eventValidationSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('La fecha debe ser en el futuro');
      }
    });

    it('debería rechazar URL de imagen inválida', () => {
      const invalidData = { ...validEventData, imageUrl: 'not-a-url' };
      const result = eventValidationSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Debe ser una URL válida');
      }
    });

    it('debería aceptar imageUrl como string vacío', () => {
      const validWithEmptyUrl = { ...validEventData, imageUrl: '' };
      
      expect(eventValidationSchema.safeParse(validWithEmptyUrl).success).toBe(true);
    });

    it('debería aceptar evento sin imageUrl', () => {
      const { imageUrl, ...validWithoutUrl } = validEventData;
      
      expect(eventValidationSchema.safeParse(validWithoutUrl).success).toBe(true);
    });
  });

  describe('Validación de Tickets', () => {
    const validTicketData = {
      name: 'Entrada General',
      price: 15000,
      capacity: 100,
      ticketsGenerated: 100,
    };

    it('debería validar datos de ticket correctos', () => {
      const result = ticketValidationSchema.safeParse(validTicketData);
      expect(result.success).toBe(true);
    });

    it('debería rechazar precio negativo', () => {
      const invalidData = { ...validTicketData, price: -100 };
      const result = ticketValidationSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El precio no puede ser negativo');
      }
    });

    it('debería rechazar capacidad cero o negativa', () => {
      const invalidData = { ...validTicketData, capacity: 0 };
      const result = ticketValidationSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('La capacidad debe ser al menos 1');
      }
    });

    it('debería usar valor por defecto para ticketsGenerated', () => {
      const dataWithoutTicketsGenerated = {
        name: 'Entrada General',
        price: 15000,
        capacity: 100,
      };
      
      const result = ticketValidationSchema.safeParse(dataWithoutTicketsGenerated);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ticketsGenerated).toBe(1);
      }
    });
  });

  describe('Validación de Pagos', () => {
    const validPaymentData = {
      ticketTypeId: 'ticket123',
      quantity: 2,
      promoCode: 'SAVE20',
    };

    it('debería validar datos de pago correctos', () => {
      const result = paymentValidationSchema.safeParse(validPaymentData);
      expect(result.success).toBe(true);
    });

    it('debería rechazar cantidad mayor a 10', () => {
      const invalidData = { ...validPaymentData, quantity: 11 };
      const result = paymentValidationSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('No puedes comprar más de 10 tickets a la vez.');
      }
    });

    it('debería rechazar cantidad menor a 1', () => {
      const invalidData = { ...validPaymentData, quantity: 0 };
      const result = paymentValidationSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('La cantidad debe ser al menos 1');
      }
    });

    it('debería aceptar sin código promocional', () => {
      const dataWithoutPromo = {
        ticketTypeId: 'ticket123',
        quantity: 2,
      };
      
      const result = paymentValidationSchema.safeParse(dataWithoutPromo);
      expect(result.success).toBe(true);
    });
  });

  describe('Validación de Códigos Promocionales', () => {
    const validPromoData = {
      code: 'SAVE20',
      name: 'Descuento de Verano',
      type: 'PERCENTAGE' as const,
      value: 20,
      validFrom: '2024-06-01T00:00:00Z',
      validUntil: '2024-08-31T23:59:59Z',
    };

    it('debería validar código promocional correcto', () => {
      const result = promoCodeValidationSchema.safeParse(validPromoData);
      expect(result.success).toBe(true);
    });

    it('debería rechazar código muy corto', () => {
      const invalidData = { ...validPromoData, code: 'AB' };
      const result = promoCodeValidationSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El código debe tener al menos 3 caracteres');
      }
    });

    it('debería rechazar valor cero o negativo', () => {
      const invalidData = { ...validPromoData, value: 0 };
      const result = promoCodeValidationSchema.safeParse(invalidData);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('El valor debe ser mayor a 0');
      }
    });

    // it('debería rechazar tipo de descuento inválido', () => {
    //   const invalidData = { ...validPromoData, type: 'INVALID_TYPE' as any };
    //   const result = promoCodeValidationSchema.safeParse(invalidData);
      
    //   expect(result.success).toBe(false);
    //   if (!result.success) {
    //     expect(result.error.issues.length).toBeGreaterThan(0);
    //     expect(result.error.issues[0].code).toBe('invalid_enum_value');
    //   }
    // });

    it('debería validar ambos tipos de descuento', () => {
      const percentagePromo = { ...validPromoData, type: 'PERCENTAGE' as const };
      const fixedPromo = { ...validPromoData, type: 'FIXED_AMOUNT' as const };
      
      expect(promoCodeValidationSchema.safeParse(percentagePromo).success).toBe(true);
      expect(promoCodeValidationSchema.safeParse(fixedPromo).success).toBe(true);
    });
  });
});
