import {
  formatCurrency,
  formatPriceRange,
  formatNumber,
  formatPercentage,
  isValidEmail,
  isValidUrl,
  capitalize,
  slugify,
  truncate,
  getInitials,
} from '@/lib/utils';

describe('Utilidades de formateo', () => {
  describe('formatCurrency', () => {
    it('formatea montos correctamente en CLP', () => {
      expect(formatCurrency(1000)).toBe('$1.000');
      expect(formatCurrency(1500, 'CLP')).toBe('$1.500');
      expect(formatCurrency(0)).toBe('Gratis');
    });

    it('formatea montos con decimales', () => {
      expect(formatCurrency(1500.50)).toBe('$1.501');
      expect(formatCurrency(999.99)).toBe('$1.000');
    });

    it('maneja montos negativos', () => {
      expect(formatCurrency(-1000)).toBe('$-1.000');
    });

    it('formatea en diferentes monedas', () => {
      expect(formatCurrency(1000, 'USD')).toBe('US$1.000');
      expect(formatCurrency(1000, 'EUR')).toContain('EUR');
      expect(formatCurrency(1000, 'EUR')).toContain('1.000');
    });
  });

  describe('formatPriceRange', () => {
    it('formatea rangos de precios correctamente', () => {
      expect(formatPriceRange(1000, 5000)).toBe('Desde $1.000');
      expect(formatPriceRange(0, 1000)).toBe('Desde Gratis');
    });

    it('maneja precios iguales', () => {
      expect(formatPriceRange(1000, 1000)).toBe('$1.000');
    });

    it('maneja ambos precios en cero', () => {
      expect(formatPriceRange(0, 0)).toBe('Gratis');
    });
  });

  describe('formatNumber', () => {
    it('formatea números grandes con sufijos', () => {
      expect(formatNumber(999)).toBe('999');
      expect(formatNumber(1000)).toBe('1.0K');
      expect(formatNumber(1500)).toBe('1.5K');
      expect(formatNumber(1000000)).toBe('1.0M');
      expect(formatNumber(1500000)).toBe('1.5M');
      expect(formatNumber(1000000000)).toBe('1.0B');
    });

    it('maneja números pequeños', () => {
      expect(formatNumber(500)).toBe('500');
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('formatPercentage', () => {
    it('formatea porcentajes correctamente', () => {
      expect(formatPercentage(50)).toBe('50.0%');
      expect(formatPercentage(100)).toBe('100.0%');
      expect(formatPercentage(33.3)).toBe('33.3%');
    });

    it('maneja decimales específicos', () => {
      expect(formatPercentage(12.34, 1)).toBe('12.3%');
      expect(formatPercentage(12.34, 2)).toBe('12.34%');
      expect(formatPercentage(12.34, 0)).toBe('12%');
    });
  });
});

describe('Utilidades de validación', () => {
  describe('isValidEmail', () => {
    it('valida emails correctos', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('test123@test-domain.com')).toBe(true);
    });

    it('rechaza emails inválidos', () => {
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('isValidUrl', () => {
    it('valida URLs correctas', () => {
      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://test.co')).toBe(true);
      expect(isValidUrl('https://sub.domain.com/path')).toBe(true);
      expect(isValidUrl('ftp://example.com')).toBe(true); // URL constructor acepta FTP
    });

    it('rechaza URLs inválidas', () => {
      expect(isValidUrl('not-a-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('just-text')).toBe(false);
    });
  });
});

describe('Utilidades de texto', () => {
  describe('capitalize', () => {
    it('capitaliza correctamente', () => {
      expect(capitalize('hello')).toBe('Hello');
      expect(capitalize('WORLD')).toBe('World');
      expect(capitalize('mIxEd CaSe')).toBe('Mixed case');
    });

    it('maneja strings vacíos', () => {
      expect(capitalize('')).toBe('');
    });
  });

  describe('slugify', () => {
    it('crea slugs correctos', () => {
      expect(slugify('Hello World')).toBe('hello-world');
      expect(slugify('Evento Increíble 2024')).toBe('evento-increible-2024');
      expect(slugify('Test@#$%')).toBe('test');
    });

    it('maneja acentos y caracteres especiales', () => {
      expect(slugify('Café & Música')).toBe('cafe-musica');
      expect(slugify('Niño pequeño')).toBe('nino-pequeno');
    });
  });

  describe('truncate', () => {
    it('trunca texto largo', () => {
      const longText = 'Este es un texto muy largo que necesita ser truncado';
      expect(truncate(longText, 20)).toBe('Este es un texto muy...');
    });

    it('no trunca texto corto', () => {
      expect(truncate('Corto', 20)).toBe('Corto');
    });

    it('maneja longitud exacta', () => {
      expect(truncate('Exacto', 6)).toBe('Exacto');
    });
  });

  describe('getInitials', () => {
    it('obtiene iniciales correctamente', () => {
      expect(getInitials('Juan', 'Pérez')).toBe('JP');
      expect(getInitials('María José', 'González')).toBe('MG');
      expect(getInitials('SingleName', undefined)).toBe('S');
    });

    it('maneja valores nulos y vacíos', () => {
      expect(getInitials(null, null)).toBe('?');
      expect(getInitials('', '')).toBe('?');
      expect(getInitials('Juan', null)).toBe('J');
    });
  });
});
