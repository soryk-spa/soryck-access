

import type { CreateEventData, CreatePromoCodeData, UpdateUserProfileData } from '@/types';





interface EventValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

function validateEventForm(data: Partial<CreateEventData>): EventValidationResult {
  const errors: Record<string, string> = {};

  
  if (!data.title?.trim()) {
    errors.title = 'El título es requerido';
  } else if (data.title.length < 5) {
    errors.title = 'El título debe tener al menos 5 caracteres';
  } else if (data.title.length > 100) {
    errors.title = 'El título no puede exceder 100 caracteres';
  }

  
  if (!data.description?.trim()) {
    errors.description = 'La descripción es requerida';
  } else if (data.description.length < 20) {
    errors.description = 'La descripción debe tener al menos 20 caracteres';
  } else if (data.description.length > 2000) {
    errors.description = 'La descripción no puede exceder 2000 caracteres';
  }

  
  if (!data.startDate) {
    errors.startDate = 'La fecha de inicio es requerida';
  } else {
    const startDate = new Date(data.startDate);
    const now = new Date();
    if (startDate <= now) {
      errors.startDate = 'La fecha de inicio debe ser futura';
    }
  }

  
  if (data.endDate) {
    const startDate = new Date(data.startDate || '');
    const endDate = new Date(data.endDate);
    if (endDate <= startDate) {
      errors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
  }

  
  if (!data.location?.trim()) {
    errors.location = 'La ubicación es requerida';
  } else if (data.location.length < 5) {
    errors.location = 'La ubicación debe tener al menos 5 caracteres';
  }

  
  if (!data.categoryId) {
    errors.categoryId = 'La categoría es requerida';
  }

  
  if (!data.ticketTypes || data.ticketTypes.length === 0) {
    errors.ticketTypes = 'Debe agregar al menos un tipo de ticket';
  } else {
    data.ticketTypes.forEach((ticket, index) => {
      if (!ticket.name?.trim()) {
        errors[`ticketTypes.${index}.name`] = 'El nombre del ticket es requerido';
      }
      if (ticket.price < 0) {
        errors[`ticketTypes.${index}.price`] = 'El precio no puede ser negativo';
      }
      if (ticket.capacity <= 0) {
        errors[`ticketTypes.${index}.capacity`] = 'La capacidad debe ser mayor a 0';
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}





function validatePromoCodeForm(data: Partial<CreatePromoCodeData>): EventValidationResult {
  const errors: Record<string, string> = {};

  
  if (!data.code?.trim()) {
    errors.code = 'El código es requerido';
  } else if (data.code.length < 3) {
    errors.code = 'El código debe tener al menos 3 caracteres';
  } else if (data.code.length > 20) {
    errors.code = 'El código no puede exceder 20 caracteres';
  } else if (!/^[A-Z0-9]+$/.test(data.code)) {
    errors.code = 'El código solo puede contener letras mayúsculas y números';
  }

  
  if (!data.name?.trim()) {
    errors.name = 'El nombre es requerido';
  } else if (data.name.length < 5) {
    errors.name = 'El nombre debe tener al menos 5 caracteres';
  }

  
  if (!data.type) {
    errors.type = 'El tipo de descuento es requerido';
  } else {
    if (data.value === undefined || data.value === null) {
      errors.value = 'El valor del descuento es requerido';
    } else if (data.value <= 0) {
      errors.value = 'El valor debe ser mayor a 0';
    } else if (data.type === 'PERCENTAGE' && data.value > 100) {
      errors.value = 'El porcentaje no puede ser mayor a 100%';
    } else if (data.type === 'FIXED_AMOUNT' && data.value > 1000000) {
      errors.value = 'El monto fijo no puede exceder $1,000,000';
    }
  }

  
  if (!data.validFrom) {
    errors.validFrom = 'La fecha de inicio es requerida';
  }

  if (data.validFrom && data.validUntil) {
    const fromDate = new Date(data.validFrom);
    const untilDate = new Date(data.validUntil);
    if (untilDate <= fromDate) {
      errors.validUntil = 'La fecha de fin debe ser posterior a la fecha de inicio';
    }
  }

  
  if (data.usageLimit !== undefined && data.usageLimit <= 0) {
    errors.usageLimit = 'El límite de uso debe ser mayor a 0';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}





function validateUserProfileForm(data: Partial<UpdateUserProfileData>): EventValidationResult {
  const errors: Record<string, string> = {};

  
  if (data.firstName !== undefined) {
    if (!data.firstName?.trim()) {
      errors.firstName = 'El nombre es requerido';
    } else if (data.firstName.length < 2) {
      errors.firstName = 'El nombre debe tener al menos 2 caracteres';
    } else if (data.firstName.length > 50) {
      errors.firstName = 'El nombre no puede exceder 50 caracteres';
    }
  }

  
  if (data.lastName !== undefined) {
    if (!data.lastName?.trim()) {
      errors.lastName = 'El apellido es requerido';
    } else if (data.lastName.length < 2) {
      errors.lastName = 'El apellido debe tener al menos 2 caracteres';
    } else if (data.lastName.length > 50) {
      errors.lastName = 'El apellido no puede exceder 50 caracteres';
    }
  }

  
  if (data.bio !== undefined && data.bio.length > 500) {
    errors.bio = 'La biografía no puede exceder 500 caracteres';
  }

  
  if (data.website !== undefined && data.website) {
    const urlRegex = /^https?:\/\/.+\..+/;
    if (!urlRegex.test(data.website)) {
      errors.website = 'El sitio web debe ser una URL válida';
    }
  }

  
  if (data.phone !== undefined && data.phone) {
    const phoneRegex = /^\+?[\d\s-()]{8,15}$/;
    if (!phoneRegex.test(data.phone)) {
      errors.phone = 'El teléfono debe tener un formato válido';
    }
  }

  
  if (data.socialLinks) {
    const urlRegex = /^https?:\/\/.+/;
    
    if (data.socialLinks.twitter && !urlRegex.test(data.socialLinks.twitter)) {
      errors['socialLinks.twitter'] = 'La URL de Twitter debe ser válida';
    }
    
    if (data.socialLinks.facebook && !urlRegex.test(data.socialLinks.facebook)) {
      errors['socialLinks.facebook'] = 'La URL de Facebook debe ser válida';
    }
    
    if (data.socialLinks.instagram && !urlRegex.test(data.socialLinks.instagram)) {
      errors['socialLinks.instagram'] = 'La URL de Instagram debe ser válida';
    }
    
    if (data.socialLinks.linkedin && !urlRegex.test(data.socialLinks.linkedin)) {
      errors['socialLinks.linkedin'] = 'La URL de LinkedIn debe ser válida';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}





describe('Validación de Formularios de Eventos', () => {
  const validEventData: CreateEventData = {
    title: 'Evento de Prueba',
    description: 'Esta es una descripción válida con más de 20 caracteres',
    startDate: '2025-12-31T20:00:00Z',
    location: 'Santiago, Chile',
    categoryId: 'music',
    ticketTypes: [
      {
        name: 'General',
        price: 25000,
        capacity: 100,
        currency: 'CLP',
      },
    ],
  };

  it('valida un evento correcto', () => {
    const result = validateEventForm(validEventData);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('rechaza título vacío', () => {
    const result = validateEventForm({ ...validEventData, title: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe('El título es requerido');
  });

  it('rechaza título muy corto', () => {
    const result = validateEventForm({ ...validEventData, title: 'Hi' });
    expect(result.isValid).toBe(false);
    expect(result.errors.title).toBe('El título debe tener al menos 5 caracteres');
  });

  it('rechaza descripción muy corta', () => {
    const result = validateEventForm({ ...validEventData, description: 'Corto' });
    expect(result.isValid).toBe(false);
    expect(result.errors.description).toBe('La descripción debe tener al menos 20 caracteres');
  });

  it('rechaza fecha de inicio en el pasado', () => {
    const result = validateEventForm({ 
      ...validEventData, 
      startDate: '2020-01-01T20:00:00Z' 
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.startDate).toBe('La fecha de inicio debe ser futura');
  });

  it('rechaza fecha de fin anterior a fecha de inicio', () => {
    const result = validateEventForm({ 
      ...validEventData,
      startDate: '2025-12-31T20:00:00Z',
      endDate: '2025-12-31T19:00:00Z'
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.endDate).toBe('La fecha de fin debe ser posterior a la fecha de inicio');
  });

  it('rechaza eventos sin tipos de ticket', () => {
    const result = validateEventForm({ ...validEventData, ticketTypes: [] });
    expect(result.isValid).toBe(false);
    expect(result.errors.ticketTypes).toBe('Debe agregar al menos un tipo de ticket');
  });

  it('valida múltiples errores simultáneamente', () => {
    const result = validateEventForm({
      title: '',
      description: 'Corto',
      startDate: '',
      location: '',
      categoryId: '',
      ticketTypes: [],
    });
    expect(result.isValid).toBe(false);
    expect(Object.keys(result.errors)).toHaveLength(6);
  });
});

describe('Validación de Formularios de Códigos Promocionales', () => {
  const validPromoData: CreatePromoCodeData = {
    code: 'SUMMER2024',
    name: 'Descuento de Verano',
    type: 'PERCENTAGE',
    value: 20,
    validFrom: '2024-01-01',
  };

  it('valida un código promocional correcto', () => {
    const result = validatePromoCodeForm(validPromoData);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('rechaza código vacío', () => {
    const result = validatePromoCodeForm({ ...validPromoData, code: '' });
    expect(result.isValid).toBe(false);
    expect(result.errors.code).toBe('El código es requerido');
  });

  it('rechaza código con caracteres inválidos', () => {
    const result = validatePromoCodeForm({ ...validPromoData, code: 'summer-2024' });
    expect(result.isValid).toBe(false);
    expect(result.errors.code).toBe('El código solo puede contener letras mayúsculas y números');
  });

  it('rechaza porcentaje mayor a 100', () => {
    const result = validatePromoCodeForm({ 
      ...validPromoData, 
      type: 'PERCENTAGE',
      value: 150 
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.value).toBe('El porcentaje no puede ser mayor a 100%');
  });

  it('rechaza monto fijo muy alto', () => {
    const result = validatePromoCodeForm({ 
      ...validPromoData, 
      type: 'FIXED_AMOUNT',
      value: 2000000 
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.value).toBe('El monto fijo no puede exceder $1,000,000');
  });

  it('valida fechas correctamente', () => {
    const result = validatePromoCodeForm({ 
      ...validPromoData,
      validFrom: '2024-12-31',
      validUntil: '2024-01-01'
    });
    expect(result.isValid).toBe(false);
    expect(result.errors.validUntil).toBe('La fecha de fin debe ser posterior a la fecha de inicio');
  });
});

describe('Validación de Formularios de Perfil de Usuario', () => {
  const validProfileData: UpdateUserProfileData = {
    firstName: 'Juan',
    lastName: 'Pérez',
    bio: 'Desarrollador apasionado por la tecnología',
    website: 'https://juanperez.dev',
    phone: '+56912345678',
    socialLinks: {
      twitter: 'https://twitter.com/juanperez',
      linkedin: 'https://linkedin.com/in/juanperez',
    },
  };

  it('valida un perfil correcto', () => {
    const result = validateUserProfileForm(validProfileData);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('rechaza nombre muy corto', () => {
    const result = validateUserProfileForm({ ...validProfileData, firstName: 'J' });
    expect(result.isValid).toBe(false);
    expect(result.errors.firstName).toBe('El nombre debe tener al menos 2 caracteres');
  });

  it('rechaza biografía muy larga', () => {
    const longBio = 'A'.repeat(501);
    const result = validateUserProfileForm({ ...validProfileData, bio: longBio });
    expect(result.isValid).toBe(false);
    expect(result.errors.bio).toBe('La biografía no puede exceder 500 caracteres');
  });

  it('rechaza URL de website inválida', () => {
    const result = validateUserProfileForm({ ...validProfileData, website: 'not-a-url' });
    expect(result.isValid).toBe(false);
    expect(result.errors.website).toBe('El sitio web debe ser una URL válida');
  });

  it('rechaza teléfono inválido', () => {
    const result = validateUserProfileForm({ ...validProfileData, phone: '123' });
    expect(result.isValid).toBe(false);
    expect(result.errors.phone).toBe('El teléfono debe tener un formato válido');
  });

  it('valida URLs de redes sociales', () => {
    const result = validateUserProfileForm({ 
      ...validProfileData, 
      socialLinks: {
        twitter: 'not-a-url',
        linkedin: 'https://linkedin.com/valid',
      }
    });
    expect(result.isValid).toBe(false);
    expect(result.errors['socialLinks.twitter']).toBe('La URL de Twitter debe ser válida');
    expect(result.errors['socialLinks.linkedin']).toBeUndefined();
  });

  it('permite campos opcionales vacíos', () => {
    const result = validateUserProfileForm({
      firstName: 'Juan',
      lastName: 'Pérez',
    });
    expect(result.isValid).toBe(true);
  });

  it('valida múltiples redes sociales inválidas', () => {
    const result = validateUserProfileForm({ 
      ...validProfileData, 
      socialLinks: {
        twitter: 'invalid-twitter',
        facebook: 'invalid-facebook',
        instagram: 'invalid-instagram',
        linkedin: 'invalid-linkedin',
      }
    });
    expect(result.isValid).toBe(false);
    expect(Object.keys(result.errors)).toHaveLength(4);
  });
});
