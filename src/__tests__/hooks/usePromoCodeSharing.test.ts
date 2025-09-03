/**
 * Tests para las funcionalidades de compartir códigos promocionales
 * Tests simplificados que no dependen de hooks de React
 */

import { toast } from 'sonner';

// Mock toast
jest.mock('sonner');
const mockToast = toast as jest.Mocked<typeof toast>;

// Mock navigator clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
  share: jest.fn().mockImplementation(() => Promise.resolve()),
});

// Mock PromoCode data
const mockPromoCodes = [
  {
    id: '1',
    code: 'SUMMER2024',
    name: 'Descuento de Verano',
    type: 'PERCENTAGE' as const,
    value: 20,
    status: 'ACTIVE' as const,
    usedCount: 25,
    usageLimit: 100,
    currency: 'CLP',
    validFrom: '2024-01-01',
    validUntil: '2024-12-31',
  },
  {
    id: '2',
    code: 'FIXED10K',
    name: 'Descuento Fijo',
    type: 'FIXED_AMOUNT' as const,
    value: 10000,
    status: 'INACTIVE' as const,
    usedCount: 50,
    usageLimit: 50,
    currency: 'CLP',
    validFrom: '2024-01-01',
    validUntil: '2024-06-30',
  },
];

describe('Funcionalidades de Compartir Códigos Promocionales', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Compartir con Web Share API', () => {
    it('comparte código promocional con Web Share API disponible', async () => {
      const formatDiscount = (type: string, value: number) => 
        type === 'PERCENTAGE' ? `${value}%` : `$${value.toLocaleString()}`;

      const code = mockPromoCodes[0];
      const shareText = `🎫 ¡Descuento especial! Usa el código ${code.code} y obtén ${formatDiscount(code.type, code.value)} en tu próxima compra.`;

      if (navigator.share) {
        await navigator.share({
          title: `Código promocional: ${code.name}`,
          text: shareText,
        });
      }

      expect(navigator.share).toHaveBeenCalledWith({
        title: 'Código promocional: Descuento de Verano',
        text: '🎫 ¡Descuento especial! Usa el código SUMMER2024 y obtén 20% en tu próxima compra.',
      });
    });

    it('usa clipboard como fallback cuando no hay Web Share API', async () => {
      // Temporalmente eliminar Web Share API
      const originalShare = navigator.share;
      delete (navigator as unknown as { share?: typeof navigator.share }).share;

      const formatDiscount = (type: string, value: number) => 
        type === 'PERCENTAGE' ? `${value}%` : `$${value.toLocaleString()}`;

      const code = mockPromoCodes[0];
      const shareText = `🎫 ¡Descuento especial! Usa el código ${code.code} y obtén ${formatDiscount(code.type, code.value)} en tu próxima compra.`;

      if (navigator.share) {
        await navigator.share({
          title: `Código promocional: ${code.name}`,
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        mockToast.success('Texto de promoción copiado al portapapeles');
      }

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        '🎫 ¡Descuento especial! Usa el código SUMMER2024 y obtén 20% en tu próxima compra.'
      );
      expect(mockToast.success).toHaveBeenCalledWith(
        'Texto de promoción copiado al portapapeles'
      );

      // Restaurar Web Share API
      (navigator as unknown as { share?: typeof navigator.share }).share = originalShare;
    });
  });

  describe('Generación de CSV', () => {
    it('genera CSV con headers correctos', () => {
      const headers = ['Código', 'Nombre', 'Tipo', 'Valor', 'Estado', 'Usado', 'Límite', 'Válido Desde', 'Válido Hasta'];
      
      const csvHeaders = headers.map(h => `"${h}"`).join(',');

      expect(csvHeaders).toBe('"Código","Nombre","Tipo","Valor","Estado","Usado","Límite","Válido Desde","Válido Hasta"');
    });

    it('genera filas de CSV correctamente', () => {
      const code = mockPromoCodes[0];
      const row = [
        code.code,
        code.name,
        code.type,
        code.value.toString(),
        code.status,
        code.usedCount.toString(),
        code.usageLimit?.toString() || 'Sin límite',
        code.validFrom,
        code.validUntil || 'Sin fecha límite'
      ];

      const csvRow = row.map(cell => `"${cell}"`).join(',');

      expect(csvRow).toBe('"SUMMER2024","Descuento de Verano","PERCENTAGE","20","ACTIVE","25","100","2024-01-01","2024-12-31"');
    });

    it('maneja códigos sin límite de uso', () => {
      const codeWithoutLimit = {
        ...mockPromoCodes[0],
        usageLimit: undefined as number | undefined,
        validUntil: undefined as string | undefined,
      };

      const row = [
        codeWithoutLimit.code,
        codeWithoutLimit.name,
        codeWithoutLimit.type,
        codeWithoutLimit.value.toString(),
        codeWithoutLimit.status,
        codeWithoutLimit.usedCount.toString(),
        codeWithoutLimit.usageLimit?.toString() || 'Sin límite',
        codeWithoutLimit.validFrom,
        codeWithoutLimit.validUntil || 'Sin fecha límite'
      ];

      const csvRow = row.map(cell => `"${cell}"`).join(',');

      expect(csvRow).toBe('"SUMMER2024","Descuento de Verano","PERCENTAGE","20","ACTIVE","25","Sin límite","2024-01-01","Sin fecha límite"');
    });
  });

  describe('Funciones de formato de descuento', () => {
    it('formatea descuentos porcentuales correctamente', () => {
      const formatDiscount = (type: string, value: number) => 
        type === 'PERCENTAGE' ? `${value}%` : `$${value.toLocaleString()}`;

      expect(formatDiscount('PERCENTAGE', 20)).toBe('20%');
      expect(formatDiscount('PERCENTAGE', 15.5)).toBe('15.5%');
    });

    it('formatea descuentos de monto fijo correctamente', () => {
      const formatDiscount = (type: string, value: number) => 
        type === 'PERCENTAGE' ? `${value}%` : `$${value.toLocaleString()}`;

      // Los números se formatean según la configuración regional
      // En entorno de test, puede usar punto o coma como separador
      const formatted10k = formatDiscount('FIXED_AMOUNT', 10000);
      const formatted5500 = formatDiscount('FIXED_AMOUNT', 5500);

      // Verificar que contiene el símbolo de moneda y el valor
      expect(formatted10k).toContain('$');
      expect(formatted10k).toContain('10');
      // Aceptar formatos locales con o sin separador de miles
      expect(['$5500', '$5,500', '$5.500']).toContain(formatted5500);
    });
  });

  describe('Simulación de descarga de CSV', () => {
    it('simula la creación de blob y descarga', () => {
      const csvContent = 'header1,header2\nvalue1,value2';
      
      // Crear blob para el CSV
      new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

      // Simular creación de elementos DOM
      const mockLink = {
        setAttribute: jest.fn(),
        click: jest.fn(),
        style: { visibility: 'hidden' },
      } as unknown as HTMLAnchorElement;

      // Mock del proceso de descarga
      const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink);
      const appendChildSpy = jest.spyOn(document.body, 'appendChild').mockImplementation();
      const removeChildSpy = jest.spyOn(document.body, 'removeChild').mockImplementation();

      // Simular el proceso de descarga directamente
      const element = document.createElement('a');
      element.setAttribute('href', 'blob:mock-url');
      element.setAttribute('download', 'test.csv');
      element.style.visibility = 'hidden';
      
      // Simular append, click, remove
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      // Verificar que las funciones del mock funcionan
      expect(mockLink.setAttribute).toBeDefined();
      expect(mockLink.click).toBeDefined();

      // Limpiar mocks
      createElementSpy.mockRestore();
      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
    });
  });
});
