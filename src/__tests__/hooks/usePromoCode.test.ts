import { renderHook, act } from '@testing-library/react';
import { toast } from 'sonner';
import {
  usePromoCodeManagement,
  usePromoCodeFilters,
  usePromoCodeStats,
  usePromoCodeSharing,
} from '@/hooks/usePromoCode';
import type { PromoCode } from '@/types';

// Mock toast
jest.mock('sonner');
const mockToast = toast as jest.Mocked<typeof toast>;

// Mock fetch globally
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

// Mock navigator clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockImplementation(() => Promise.resolve()),
  },
});

// Mock PromoCode data
const mockPromoCodes: PromoCode[] = [
  {
    id: '1',
    code: 'SUMMER2024',
    name: 'Descuento de Verano',
    description: 'Descuento especial para eventos de verano',
    type: 'PERCENTAGE',
    value: 20,
    status: 'ACTIVE',
    validFrom: '2024-01-01',
    validUntil: '2024-12-31',
    usageLimit: 100,
    usedCount: 25,
    usageLimitPerUser: 1,
    minOrderAmount: 10000,
    maxDiscountAmount: 50000,
    currency: 'CLP',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'user1',
    eventId: null,
    categoryId: null,
    ticketTypeId: null,
    _count: { usages: 25 },
  },
  {
    id: '2',
    code: 'FIXED10K',
    name: 'Descuento Fijo',
    description: 'Descuento de monto fijo',
    type: 'FIXED_AMOUNT',
    value: 10000,
    status: 'INACTIVE',
    validFrom: '2024-01-01',
    validUntil: '2024-06-30',
    usageLimit: 50,
    usedCount: 50,
    usageLimitPerUser: 2,
    minOrderAmount: 20000,
    maxDiscountAmount: 30000,
    currency: 'CLP',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
    createdBy: 'user1',
    eventId: 'event1',
    categoryId: null,
    ticketTypeId: null,
    _count: { usages: 50 },
  },
];

describe('usePromoCodeManagement', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch.mockClear();
  });

  it('inicializa con códigos promocionales', () => {
    const { result } = renderHook(() => usePromoCodeManagement(mockPromoCodes));

    expect(result.current.promoCodes).toEqual(mockPromoCodes);
    expect(result.current.loadingStates).toEqual({});
  });

  it('activa un código promocional exitosamente', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    } as Response);

    const { result } = renderHook(() => usePromoCodeManagement(mockPromoCodes));

    await act(async () => {
      await result.current.togglePromoCodeStatus(mockPromoCodes[1]);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/promo-codes/2/toggle-status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'ACTIVE' }),
    });

    expect(mockToast.success).toHaveBeenCalledWith(
      'Código promocional activado exitosamente'
    );

    // Verificar que el estado local se actualizó
    const updatedPromoCode = result.current.promoCodes.find(p => p.id === '2');
    expect(updatedPromoCode?.status).toBe('ACTIVE');
  });

  it('maneja errores al cambiar estado', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'Error de servidor' }),
    } as Response);

    const { result } = renderHook(() => usePromoCodeManagement(mockPromoCodes));

    await act(async () => {
      await result.current.togglePromoCodeStatus(mockPromoCodes[0]);
    });

    expect(mockToast.error).toHaveBeenCalledWith('Error de servidor');
  });

  it('copia código al portapapeles', async () => {
    const { result } = renderHook(() => usePromoCodeManagement(mockPromoCodes));

    await act(async () => {
      result.current.copyToClipboard('SUMMER2024');
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('SUMMER2024');
    expect(mockToast.success).toHaveBeenCalledWith('Código copiado al portapapeles');
  });
});

describe('usePromoCodeFilters', () => {
  it('filtra códigos por búsqueda', () => {
    const { result } = renderHook(() => usePromoCodeFilters(mockPromoCodes));

    act(() => {
      result.current.updateFilter('search', 'SUMMER');
    });

    expect(result.current.filteredPromoCodes).toHaveLength(1);
    expect(result.current.filteredPromoCodes[0].code).toBe('SUMMER2024');
  });

  it('filtra códigos por estado', () => {
    const { result } = renderHook(() => usePromoCodeFilters(mockPromoCodes));

    act(() => {
      result.current.updateFilter('status', 'ACTIVE');
    });

    expect(result.current.filteredPromoCodes).toHaveLength(1);
    expect(result.current.filteredPromoCodes[0].status).toBe('ACTIVE');
  });

  it('combina múltiples filtros', () => {
    const { result } = renderHook(() => usePromoCodeFilters(mockPromoCodes));

    act(() => {
      result.current.updateFilter('status', 'INACTIVE');
    });

    expect(result.current.filteredPromoCodes).toHaveLength(1);
    expect(result.current.filteredPromoCodes[0].code).toBe('FIXED10K');
  });

  it('limpia filtros correctamente', () => {
    const { result } = renderHook(() => usePromoCodeFilters(mockPromoCodes));

    act(() => {
      result.current.updateFilter('status', 'ACTIVE');
    });

    expect(result.current.filteredPromoCodes).toHaveLength(1);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filteredPromoCodes).toHaveLength(2);
    expect(result.current.filters).toEqual({ search: '', status: 'all' });
  });
});

describe('usePromoCodeStats', () => {
  it('calcula estadísticas correctamente', () => {
    const { result } = renderHook(() => usePromoCodeStats(mockPromoCodes));

    expect(result.current.total).toBe(2);
    expect(result.current.active).toBe(1);
    expect(result.current.inactive).toBe(1);
    expect(result.current.expired).toBe(0);
    expect(result.current.usedUp).toBe(0);
    expect(result.current.totalUsages).toBe(75);
    expect(result.current.activePercentage).toBe(50);
    expect(result.current.usageRate).toBe(37.5);
  });

  it('calcula estadísticas con códigos expirados', () => {
    const expiredPromoCodes: PromoCode[] = [
      ...mockPromoCodes,
      {
        ...mockPromoCodes[0],
        id: '3',
        code: 'EXPIRED',
        status: 'EXPIRED',
        validUntil: '2023-12-31',
      },
    ];

    const { result } = renderHook(() => usePromoCodeStats(expiredPromoCodes));

    expect(result.current.total).toBe(3);
    expect(result.current.active).toBe(1);
    expect(result.current.inactive).toBe(1);
    expect(result.current.expired).toBe(1);
  });

  it('maneja códigos sin límite de uso', () => {
    const codesWithoutLimit: PromoCode[] = [
      {
        ...mockPromoCodes[0],
        usageLimit: undefined,
        usedCount: 10,
      },
    ];

    const { result } = renderHook(() => usePromoCodeStats(codesWithoutLimit));

    expect(result.current.total).toBe(1);
    expect(result.current.totalUsages).toBe(10);
  });
});

describe('usePromoCodeSharing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock navigator.share
    Object.assign(navigator, {
      share: jest.fn().mockImplementation(() => Promise.resolve()),
    });
  });

  it('comparte código promocional con Web Share API', async () => {
    const { result } = renderHook(() => usePromoCodeSharing());
    const formatDiscount = (type: string, value: number) => 
      type === 'PERCENTAGE' ? `${value}%` : `$${value}`;

    await act(async () => {
      result.current.sharePromoCode(mockPromoCodes[0], formatDiscount);
    });

    expect(navigator.share).toHaveBeenCalledWith({
      title: 'Código promocional: Descuento de Verano',
      text: '🎫 ¡Descuento especial! Usa el código SUMMER2024 y obtén 20% en tu próxima compra.',
    });
  });

  it('copia al portapapeles cuando no hay Web Share API', async () => {
    // Simular que no hay Web Share API
    Object.assign(navigator, { share: undefined });

    const { result } = renderHook(() => usePromoCodeSharing());
    const formatDiscount = (type: string, value: number) => 
      type === 'PERCENTAGE' ? `${value}%` : `$${value}`;

    await act(async () => {
      result.current.sharePromoCode(mockPromoCodes[0], formatDiscount);
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      '🎫 ¡Descuento especial! Usa el código SUMMER2024 y obtén 20% en tu próxima compra.'
    );
    expect(mockToast.success).toHaveBeenCalledWith(
      'Texto de promoción copiado al portapapeles'
    );
  });

  it('exporta códigos promocionales a CSV', () => {
    const { result } = renderHook(() => usePromoCodeSharing());

    // Mock para crear y hacer click en link de descarga
    const mockLink = {
      setAttribute: jest.fn(),
      click: jest.fn(),
      style: { visibility: '' },
    };
    const mockCreateElement = jest.spyOn(document, 'createElement').mockReturnValue(mockLink as unknown as HTMLAnchorElement);
    const mockAppendChild = jest.spyOn(document.body, 'appendChild').mockImplementation();
    const mockRemoveChild = jest.spyOn(document.body, 'removeChild').mockImplementation();
    const mockCreateObjectURL = jest.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');

    act(() => {
      result.current.exportPromoCodes(mockPromoCodes);
    });

    expect(mockCreateElement).toHaveBeenCalledWith('a');
    expect(mockToast.success).toHaveBeenCalledWith(
      'Códigos promocionales exportados exitosamente'
    );

    // Limpiar mocks
    mockCreateElement.mockRestore();
    mockAppendChild.mockRestore();
    mockRemoveChild.mockRestore();
    mockCreateObjectURL.mockRestore();
  });
});
