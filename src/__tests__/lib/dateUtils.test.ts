


export const formatEventDate = (date: string | Date): string => {
  const eventDate = new Date(date);
  
  if (isNaN(eventDate.getTime())) {
    return 'Fecha inválida';
  }
  
  return eventDate.toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const isEventInFuture = (date: string | Date): boolean => {
  const eventDate = new Date(date);
  const now = new Date();
  
  return eventDate > now;
};

export const getEventTimeRemaining = (date: string | Date): string => {
  const eventDate = new Date(date);
  const now = new Date();
  const diff = eventDate.getTime() - now.getTime();
  
  if (diff <= 0) {
    return 'Evento finalizado';
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days} día${days !== 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `${hours} hora${hours !== 1 ? 's' : ''}`;
  } else {
    return `${minutes} minuto${minutes !== 1 ? 's' : ''}`;
  }
};

export const isEventToday = (date: string | Date): boolean => {
  const eventDate = new Date(date);
  const today = new Date();
  
  return eventDate.toDateString() === today.toDateString();
};

export const getEventWeekday = (date: string | Date): string => {
  const eventDate = new Date(date);
  
  return eventDate.toLocaleDateString('es-CL', { weekday: 'long' });
};


export const calculateDiscountedPrice = (
  originalPrice: number, 
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT',
  discountValue: number
): number => {
  if (originalPrice < 0 || discountValue < 0) {
    return originalPrice;
  }
  
  if (discountType === 'PERCENTAGE') {
    const discount = Math.min(discountValue, 100); 
    return Math.max(0, originalPrice - (originalPrice * discount / 100));
  } else {
    return Math.max(0, originalPrice - discountValue);
  }
};


export const generateTicketCode = (eventId: string, ticketTypeId: string, index: number): string => {
  const prefix = eventId.substring(0, 8).toUpperCase();
  const middle = ticketTypeId.substring(0, 8).toUpperCase();
  const suffix = index.toString().padStart(3, '0');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  return `${prefix}-${middle}-${suffix}-${random}`;
};

describe('Utilidades de Fecha y Tiempo Críticas', () => {
  describe('formatEventDate', () => {
    it('debería formatear correctamente una fecha válida', () => {
      const testDate = new Date('2024-12-15T20:30:00');
      const result = formatEventDate(testDate);
      
      expect(result).toContain('2024');
      expect(result).toContain('diciembre');
      expect(result).toContain('15');
    });

    it('debería manejar fecha inválida', () => {
      const result = formatEventDate('fecha-invalida');
      expect(result).toBe('Fecha inválida');
    });

    it('debería funcionar con string de fecha ISO', () => {
      const result = formatEventDate('2024-12-15T20:30:00Z');
      expect(result).toContain('2024');
    });
  });

  describe('isEventInFuture', () => {
    it('debería retornar true para fecha futura', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); 
      expect(isEventInFuture(futureDate)).toBe(true);
    });

    it('debería retornar false para fecha pasada', () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); 
      expect(isEventInFuture(pastDate)).toBe(false);
    });

    it('debería funcionar con string de fecha', () => {
      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      expect(isEventInFuture(futureDate)).toBe(true);
    });
  });

  describe('getEventTimeRemaining', () => {
    it('debería retornar días para evento distante', () => {
      const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); 
      const result = getEventTimeRemaining(futureDate);
      
      expect(result).toContain('día');
      
      const now = new Date();
      const expectedDays = Math.floor((futureDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      const digitsMatch = result.match(/(\d+)/);
      expect(digitsMatch).not.toBeNull();
      const numberInResult = parseInt(digitsMatch![0], 10);
      
      expect(numberInResult === expectedDays || numberInResult === expectedDays - 1).toBe(true);
    });

    it('debería retornar horas para evento cercano', () => {
      const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000); 
      const result = getEventTimeRemaining(futureDate);
      
      expect(result).toContain('hora');
      expect(result).toContain('2');
    });

    it('debería retornar minutos para evento muy cercano', () => {
      const futureDate = new Date(Date.now() + 30 * 60 * 1000); 
      const result = getEventTimeRemaining(futureDate);
      
      expect(result).toContain('minuto');
    });

    it('debería retornar "Evento finalizado" para fecha pasada', () => {
      const pastDate = new Date(Date.now() - 60 * 1000); 
      const result = getEventTimeRemaining(pastDate);
      
      expect(result).toBe('Evento finalizado');
    });

    it('debería manejar plural correctamente', () => {
      const oneDay = new Date(Date.now() + 25 * 60 * 60 * 1000); 
      const twoDays = new Date(Date.now() + 49 * 60 * 60 * 1000); 
      
      const result1 = getEventTimeRemaining(oneDay);
      const result2 = getEventTimeRemaining(twoDays);
      
      expect(result1).toContain('día');
      expect(result2).toContain('días');
    });
  });

  describe('isEventToday', () => {
    it('debería retornar true para evento hoy', () => {
      const today = new Date();
      expect(isEventToday(today)).toBe(true);
    });

    it('debería retornar false para evento mañana', () => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      expect(isEventToday(tomorrow)).toBe(false);
    });

    it('debería retornar false para evento ayer', () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
      expect(isEventToday(yesterday)).toBe(false);
    });
  });

  describe('getEventWeekday', () => {
    it('debería retornar día de la semana en español', () => {
      
      const sunday = new Date('2024-12-15T10:00:00');
      const result = getEventWeekday(sunday);
      
      expect(result).toBe('domingo');
    });

    it('debería funcionar con diferentes días', () => {
      const monday = new Date('2024-12-16T10:00:00');
      expect(getEventWeekday(monday)).toBe('lunes');
    });
  });
});

describe('Utilidades de Precios y Descuentos', () => {
  describe('calculateDiscountedPrice', () => {
    it('debería calcular descuento porcentual correctamente', () => {
      const originalPrice = 10000;
      const result = calculateDiscountedPrice(originalPrice, 'PERCENTAGE', 20);
      
      expect(result).toBe(8000); 
    });

    it('debería calcular descuento fijo correctamente', () => {
      const originalPrice = 10000;
      const result = calculateDiscountedPrice(originalPrice, 'FIXED_AMOUNT', 2000);
      
      expect(result).toBe(8000); 
    });

    it('debería manejar descuento mayor al precio (porcentual)', () => {
      const originalPrice = 1000;
      const result = calculateDiscountedPrice(originalPrice, 'PERCENTAGE', 150);
      
      expect(result).toBe(0); 
    });

    it('debería manejar descuento mayor al precio (fijo)', () => {
      const originalPrice = 1000;
      const result = calculateDiscountedPrice(originalPrice, 'FIXED_AMOUNT', 1500);
      
      expect(result).toBe(0); 
    });

    it('debería limitar descuento porcentual a 100%', () => {
      const originalPrice = 10000;
      const result = calculateDiscountedPrice(originalPrice, 'PERCENTAGE', 150);
      
      expect(result).toBe(0); 
    });

    it('debería manejar valores negativos', () => {
      expect(calculateDiscountedPrice(-100, 'PERCENTAGE', 20)).toBe(-100);
      expect(calculateDiscountedPrice(100, 'PERCENTAGE', -20)).toBe(100);
    });

    it('debería manejar precio cero', () => {
      const result = calculateDiscountedPrice(0, 'PERCENTAGE', 20);
      expect(result).toBe(0);
    });
  });
});

describe('Utilidades de Generación de Códigos', () => {
  describe('generateTicketCode', () => {
    it('debería generar código con formato correcto', () => {
      const code = generateTicketCode('event123456789', 'ticket987654321', 1);
      
      expect(code).toMatch(/^[A-Z0-9]{8}-[A-Z0-9]{8}-\d{3}-[A-Z0-9]{6}$/);
    });

    it('debería usar los primeros 8 caracteres del eventId', () => {
      const code = generateTicketCode('myevent12345', 'ticket123', 1);
      
      expect(code.startsWith('MYEVENT1')).toBe(true);
    });

    it('debería formatear el índice con ceros', () => {
      const code1 = generateTicketCode('event123', 'ticket123', 1);
      const code5 = generateTicketCode('event123', 'ticket123', 5);
      const code100 = generateTicketCode('event123', 'ticket123', 100);
      
      expect(code1).toContain('-001-');
      expect(code5).toContain('-005-');
      expect(code100).toContain('-100-');
    });

    it('debería generar códigos únicos', () => {
      const code1 = generateTicketCode('event123', 'ticket123', 1);
      const code2 = generateTicketCode('event123', 'ticket123', 1);
      
      
      expect(code1).not.toBe(code2);
    });

    it('debería convertir a mayúsculas', () => {
      const code = generateTicketCode('myevent', 'myticket', 1);
      
      expect(code).toMatch(/^[A-Z0-9-]+$/);
    });
  });
});
