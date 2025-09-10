/**
 * Tests para API de eventos públicos
 * @file src/app/api/events/public/route.ts
 */

// Mock global para Request y Response
global.Request = class MockRequest {
  constructor(public url: string, public init?: any) {}
  headers = new Map();
} as any;

global.Response = class MockResponse {
  constructor(public body: any, public init?: any) {}
  static json(data: any) {
    return { json: () => Promise.resolve(data) };
  }
} as any;

// Mock NextRequest
const mockNextRequest = (url: string, init?: any) => ({
  url,
  nextUrl: new URL(url),
  headers: new Map(),
  ...init,
});

// Importar después de los mocks
import { GET } from '@/app/api/events/public/route';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/redis';

// Mock de Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    event: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

// Mock de Redis cache
jest.mock('@/lib/redis', () => ({
  cache: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockCache = cache as jest.Mocked<typeof cache>;

describe('API: /api/events/public', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCache.get.mockResolvedValue(null);
  });

  const mockEvents = [
    {
      id: '1',
      title: 'Evento de Prueba',
      description: 'Descripción del evento',
      location: 'Santiago, Chile',
      startDate: new Date('2024-12-15T20:00:00Z'),
      endDate: new Date('2024-12-15T23:00:00Z'),
      imageUrl: 'https://example.com/image.jpg',
      isPublished: true,
      category: {
        id: 'cat1',
        name: 'Música',
      },
      organizer: {
        id: 'org1',
        firstName: 'Juan',
        lastName: 'Pérez',
        email: 'juan@example.com',
      },
      ticketTypes: [
        {
          id: 'tt1',
          name: 'General',
          price: 15000,
          currency: 'CLP',
        },
      ],
      _count: {
        tickets: 5,
        orders: 3,
      },
    },
  ];

  it('debería retornar eventos públicos sin parámetros', async () => {
    mockPrisma.event.findMany.mockResolvedValue(mockEvents as any);
    mockPrisma.event.count.mockResolvedValue(1);

    const request = new NextRequest('https://localhost:3000/api/events/public');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.events).toHaveLength(1);
    expect(data.events[0].title).toBe('Evento de Prueba');
    expect(data.total).toBe(1);
    expect(data.page).toBe(1);
    expect(data.totalPages).toBe(1);
  });

  it('debería filtrar eventos por búsqueda de texto', async () => {
    mockPrisma.event.findMany.mockResolvedValue(mockEvents as any);
    mockPrisma.event.count.mockResolvedValue(1);

    const request = new NextRequest('https://localhost:3000/api/events/public?search=Evento');
    const response = await GET(request);
    const data = await response.json();

    expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({
              title: {
                contains: 'Evento',
                mode: 'insensitive',
              },
            }),
          ]),
        }),
      })
    );
    expect(data.events).toHaveLength(1);
  });

  it('debería filtrar eventos por categoría', async () => {
    mockPrisma.event.findMany.mockResolvedValue(mockEvents as any);
    mockPrisma.event.count.mockResolvedValue(1);

    const request = new NextRequest('https://localhost:3000/api/events/public?categoryId=cat1');
    const response = await GET(request);

    expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          categoryId: 'cat1',
        }),
      })
    );
  });

  it('debería filtrar eventos por rango de fechas', async () => {
    mockPrisma.event.findMany.mockResolvedValue(mockEvents as any);
    mockPrisma.event.count.mockResolvedValue(1);

    const dateFrom = '2024-12-01';
    const dateTo = '2024-12-31';
    const request = new NextRequest(
      `https://localhost:3000/api/events/public?dateFrom=${dateFrom}&dateTo=${dateTo}`
    );
    const response = await GET(request);

    expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          startDate: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
      })
    );
  });

  it('debería filtrar eventos por precio mínimo y máximo', async () => {
    mockPrisma.event.findMany.mockResolvedValue(mockEvents as any);
    mockPrisma.event.count.mockResolvedValue(1);

    const request = new NextRequest(
      'https://localhost:3000/api/events/public?minPrice=10000&maxPrice=20000'
    );
    const response = await GET(request);

    expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          ticketTypes: expect.objectContaining({
            some: expect.objectContaining({
              price: expect.objectContaining({
                gte: 10000,
                lte: 20000,
              }),
            }),
          }),
        }),
      })
    );
  });

  it('debería filtrar eventos gratuitos', async () => {
    mockPrisma.event.findMany.mockResolvedValue(mockEvents as any);
    mockPrisma.event.count.mockResolvedValue(1);

    const request = new NextRequest('https://localhost:3000/api/events/public?isFree=true');
    const response = await GET(request);

    expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          ticketTypes: expect.objectContaining({
            some: expect.objectContaining({
              price: 0,
            }),
          }),
        }),
      })
    );
  });

  it('debería implementar paginación correctamente', async () => {
    mockPrisma.event.findMany.mockResolvedValue(mockEvents as any);
    mockPrisma.event.count.mockResolvedValue(25);

    const request = new NextRequest('https://localhost:3000/api/events/public?page=2&limit=10');
    const response = await GET(request);
    const data = await response.json();

    expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10, // (page 2 - 1) * limit 10
        take: 10,
      })
    );
    expect(data.page).toBe(2);
    expect(data.totalPages).toBe(3); // 25 total / 10 per page = 3 pages
  });

  it('debería ordenar eventos por fecha ascendente por defecto', async () => {
    mockPrisma.event.findMany.mockResolvedValue(mockEvents as any);
    mockPrisma.event.count.mockResolvedValue(1);

    const request = new NextRequest('https://localhost:3000/api/events/public');
    const response = await GET(request);

    expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: {
          startDate: 'asc',
        },
      })
    );
  });

  it('debería usar cache cuando esté disponible', async () => {
    const cachedData = { events: mockEvents, total: 1, page: 1, totalPages: 1 };
    mockCache.get.mockResolvedValue(cachedData);

    const request = new NextRequest('https://localhost:3000/api/events/public');
    const response = await GET(request);
    const data = await response.json();

    expect(mockCache.get).toHaveBeenCalledWith('events:public:');
    expect(data).toEqual(cachedData);
    expect(mockPrisma.event.findMany).not.toHaveBeenCalled();
  });

  it('debería manejar errores de base de datos', async () => {
    mockPrisma.event.findMany.mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('https://localhost:3000/api/events/public');
    const response = await GET(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBeDefined();
  });

  it('debería incluir solo eventos futuros y publicados', async () => {
    mockPrisma.event.findMany.mockResolvedValue(mockEvents as any);
    mockPrisma.event.count.mockResolvedValue(1);

    const request = new NextRequest('https://localhost:3000/api/events/public');
    const response = await GET(request);

    expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          isPublished: true,
          startDate: expect.objectContaining({
            gte: expect.any(Date),
          }),
        }),
      })
    );
  });
});
