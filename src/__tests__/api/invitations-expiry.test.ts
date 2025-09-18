import { NextRequest } from 'next/server';


jest.mock('next/server', () => {
  class NextResponse {
    status: number;
    body: any;
    constructor(body?: any, opts?: any) {
      this.status = opts?.status || 200;
      this.body = body;
    }
    static json(body: any, opts?: any) {
      return { status: opts?.status || 200, body };
    }
  }
  return { NextResponse };
});


const mockPrisma = {
  event: { findUnique: jest.fn() },
  courtesyInvitation: { findMany: jest.fn(), create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  ticketType: { findMany: jest.fn(), findUnique: jest.fn() },
  priceTier: { findMany: jest.fn(), findUnique: jest.fn() },
  $transaction: jest.fn(),
};
jest.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));

const mockGetCurrentUser = jest.fn();
jest.mock('@/lib/auth', () => ({ getCurrentUser: mockGetCurrentUser }));

describe('Courtesy invitation expiry behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue({ id: 'org-1', role: 'ORGANIZER' });
    mockPrisma.event.findUnique.mockResolvedValue({ id: 'e1', organizerId: 'org-1' });
    
    mockPrisma.courtesyInvitation.findMany.mockResolvedValue([]);
    mockPrisma.ticketType.findMany.mockResolvedValue([{ id: 'tt-1' }]);
    mockPrisma.courtesyInvitation.create.mockResolvedValue({ id: 'created-inv' });
    mockPrisma.$transaction.mockImplementation(async (arr: any) => await Promise.all(arr));
  });

  it('uses priceTier.endDate when creating invitations (POST)', async () => {
    const tierEnd = new Date('2025-12-01T12:00:00Z');
    mockPrisma.priceTier.findMany.mockResolvedValue([{ id: 'pt-1', ticketTypeId: 'tt-1', endDate: tierEnd }]);

    const { POST } = await import('@/app/api/events/[id]/invitations/route');

    const body = { invitations: [{ invitedEmail: 'a@example.com', ticketTypeId: 'tt-1', priceTierId: 'pt-1' }] };
  const req = { json: async () => body, method: 'POST', headers: {} } as any;
  await POST(req, { params: Promise.resolve({ id: 'e1' }) } as any);

    expect(mockPrisma.courtesyInvitation.create).toHaveBeenCalled();
    const createArgs = mockPrisma.courtesyInvitation.create.mock.calls[0][0];
    expect(new Date(createArgs.data.expiresAt).toISOString()).toBe(tierEnd.toISOString());
  });

  it('uses priceTier.endDate when editing (PUT -> supersede/create)', async () => {
    const existingExpires = new Date('2025-10-01T10:00:00Z');
    const newTierEnd = new Date('2025-11-11T11:11:11Z');

    mockPrisma.courtesyInvitation.findUnique.mockResolvedValue({
      id: 'inv-1', eventId: 'e1', expiresAt: existingExpires, ticket: null, ticketTypeId: 'tt-1', priceTierId: null, event: { organizerId: 'org-1' }, status: 'SENT'
    });

    mockPrisma.priceTier.findUnique.mockResolvedValue({ id: 'pt-2', ticketTypeId: 'tt-1', endDate: newTierEnd });

  
  mockPrisma.ticketType.findUnique.mockResolvedValue({ id: 'tt-1', eventId: 'e1' });

    mockPrisma.$transaction.mockImplementation(async (fn: any) => await fn(mockPrisma));
    mockPrisma.courtesyInvitation.create.mockResolvedValue({ id: 'inv-2' });

    const { PUT } = await import('@/app/api/events/[id]/invitations/[invitationId]/edit/route');

  const req = { json: async () => ({ priceTierId: 'pt-2', ticketTypeId: 'tt-1' }), method: 'PUT', headers: {} } as any;
  await PUT(req, { params: Promise.resolve({ id: 'e1', invitationId: 'inv-1' }) } as any);

    expect(mockPrisma.courtesyInvitation.create).toHaveBeenCalled();
    const createArgs = mockPrisma.courtesyInvitation.create.mock.calls[0][0];
    expect(new Date(createArgs.data.expiresAt).toISOString()).toBe(newTierEnd.toISOString());
  });
});
