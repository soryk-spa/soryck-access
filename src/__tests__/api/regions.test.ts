/**
 * Tests para API de regiones chilenas
 * @file src/app/api/regions/route.ts
 */

import { NextRequest } from 'next/server';
import { GET } from '@/app/api/regions/route';
import { prisma } from '@/lib/prisma';

// Mock de Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    region: {
      findMany: jest.fn(),
    },
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('API: /api/regions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRegions = [
    {
      id: '1',
      code: 'RM',
      name: 'Región Metropolitana',
      _count: { comunas: 52 },
    },
    {
      id: '2', 
      code: 'V',
      name: 'Región de Valparaíso',
      _count: { comunas: 38 },
    },
  ];

  it('debería retornar todas las regiones con conteo de comunas', async () => {
    mockPrisma.region.findMany.mockResolvedValue(mockRegions as any);

    const request = new NextRequest('https://localhost:3000/api/regions');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.regions).toHaveLength(2);
    expect(data.regions[0]).toMatchObject({
      id: '1',
      code: 'RM',
      name: 'Región Metropolitana',
      _count: { comunas: 52 },
    });
  });

  it('debería ordenar regiones por nombre', async () => {
    mockPrisma.region.findMany.mockResolvedValue(mockRegions as any);

    const request = new NextRequest('https://localhost:3000/api/regions');
    await GET(request);

    expect(mockPrisma.region.findMany).toHaveBeenCalledWith({
      include: {
        _count: {
          select: { comunas: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  });

  it('debería filtrar regiones por búsqueda de texto', async () => {
    const filteredRegions = [mockRegions[0]]; // Solo RM
    mockPrisma.region.findMany.mockResolvedValue(filteredRegions as any);

    const request = new NextRequest('https://localhost:3000/api/regions?search=Metro');
    const response = await GET(request);
    const data = await response.json();

    expect(mockPrisma.region.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: 'Metro', mode: 'insensitive' } },
          { code: { contains: 'Metro', mode: 'insensitive' } },
        ],
      },
      include: {
        _count: {
          select: { comunas: true },
        },
      },
      orderBy: { name: 'asc' },
    });
    expect(data.regions).toHaveLength(1);
  });

  it('debería manejar errores de base de datos', async () => {
    mockPrisma.region.findMany.mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('https://localhost:3000/api/regions');
    const response = await GET(request);

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Error al obtener las regiones');
  });

  it('debería retornar array vacío cuando no hay regiones', async () => {
    mockPrisma.region.findMany.mockResolvedValue([]);

    const request = new NextRequest('https://localhost:3000/api/regions');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.regions).toEqual([]);
  });
});
