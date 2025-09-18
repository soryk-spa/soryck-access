

import { NextRequest } from 'next/server';


jest.mock('next/server', () => {
  class NextResponse {
    status: number;
    body: any;
    headers: any;
    constructor(body?: any, opts?: any) {
      this.status = opts?.status || 200;
      this.body = body;
      this.headers = opts?.headers || {};
    }
    static json(body: any, opts?: any) {
      return { status: opts?.status || 200, body };
    }
  }
  return { NextResponse };
});


const mockPrisma = {
  event: {
    findUnique: jest.fn(),
  },
  courtesyInvitation: {
    findMany: jest.fn(),
    create: jest.fn(),
  },
  ticketType: {
    findMany: jest.fn(),
  },
  priceTier: {
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

jest.mock('@/lib/prisma', () => ({ prisma: mockPrisma }));


const mockGetCurrentUser = jest.fn();
jest.mock('@/lib/auth', () => ({
  getCurrentUser: mockGetCurrentUser,
}));

describe('API /api/events/[id]/invitations', () => {
  const mockEventId = 'event-123';
  const mockUser = {
    id: 'user-123',
    email: 'organizer@test.com',
    role: 'ORGANIZER',
  };
  const mockEvent = {
    id: mockEventId,
    title: 'Test Event',
    organizerId: mockUser.id,
    organizer: { id: mockUser.id },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(mockUser);
    mockPrisma.event.findUnique.mockResolvedValue(mockEvent);
  });

  describe('GET - Listar invitaciones', () => {
    it('debería retornar lista de invitaciones exitosamente', async () => {
      const mockInvitations = [
        {
          id: 'inv-1',
          invitedEmail: 'test1@example.com',
          invitedName: 'Test User 1',
          status: 'PENDING',
          createdAt: new Date(),
          ticket: null,
          creator: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@test.com',
          },
        },
        {
          id: 'inv-2',
          invitedEmail: 'test2@example.com',
          invitedName: 'Test User 2',
          status: 'SENT',
          createdAt: new Date(),
          ticket: null,
          creator: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@test.com',
          },
        },
      ];

      mockPrisma.courtesyInvitation.findMany.mockResolvedValue(mockInvitations);

      const { GET } = await import('@/app/api/events/[id]/invitations/route');
      const res = await GET(
        {} as NextRequest,
        { params: Promise.resolve({ id: mockEventId }) } as any
      );

      expect(res.status).toBe(200);
      expect(res.body.invitations).toHaveLength(2);
      expect(res.body.event.title).toBe('Test Event');
      expect(mockPrisma.courtesyInvitation.findMany).toHaveBeenCalledWith({
        where: { eventId: mockEventId },
        include: {
          ticket: {
            select: {
              id: true,
              qrCode: true,
              isUsed: true,
              usedAt: true,
            },
          },
          ticketType: {
            select: { id: true, name: true, price: true }
          },
          creator: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('debería retornar 401 si no hay usuario autenticado', async () => {
      mockGetCurrentUser.mockResolvedValue(null);

      const { GET } = await import('@/app/api/events/[id]/invitations/route');
      const res = await GET(
        {} as NextRequest,
        { params: Promise.resolve({ id: mockEventId }) } as any
      );

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('No autorizado');
    });

    it('debería retornar 404 si el evento no existe', async () => {
      mockPrisma.event.findUnique.mockResolvedValue(null);

      const { GET } = await import('@/app/api/events/[id]/invitations/route');
      const res = await GET(
        {} as NextRequest,
        { params: Promise.resolve({ id: mockEventId }) } as any
      );

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Evento no encontrado');
    });

    it('debería retornar 403 si el usuario no es propietario ni admin', async () => {
      const unauthorizedUser = { ...mockUser, id: 'other-user', role: 'CLIENT' };
      mockGetCurrentUser.mockResolvedValue(unauthorizedUser);

      const { GET } = await import('@/app/api/events/[id]/invitations/route');
      const res = await GET(
        {} as NextRequest,
        { params: Promise.resolve({ id: mockEventId }) } as any
      );

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('No autorizado');
    });
  });

  describe('POST - Crear invitaciones', () => {
    const mockRequest = (body: any) => ({
      json: jest.fn().mockResolvedValue(body),
    }) as any as NextRequest;

    it('debería crear una invitación individual exitosamente', async () => {
      const singleInvitation = {
        invitedEmail: 'test@example.com',
        invitedName: 'Test User',
        message: 'Ven a mi evento!',
      };

      const createdInvitation = {
        id: 'inv-123',
        ...singleInvitation,
        invitedEmail: singleInvitation.invitedEmail.toLowerCase(),
        eventId: mockEventId,
        createdBy: mockUser.id,
        invitationCode: 'abc123def456',
        expiresAt: expect.any(Date),
        creator: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
        },
      };

      
      mockPrisma.courtesyInvitation.findMany.mockResolvedValue([]);
      
      
      mockPrisma.$transaction.mockResolvedValue([createdInvitation]);

      const { POST } = await import('@/app/api/events/[id]/invitations/route');
      const res = await POST(
        mockRequest(singleInvitation),
        { params: Promise.resolve({ id: mockEventId }) } as any
      );

      expect(res.status).toBe(201);
      expect(res.body.message).toContain('1 invitación(es) creada(s) exitosamente');
      expect(res.body.invitations).toHaveLength(1);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('debería crear una invitación individual con ticketTypeId válido', async () => {
      const singleInvitation = {
        invitedEmail: 'ticket@test.com',
        invitedName: 'Con Ticket',
        ticketTypeId: 'tt-valid',
      };

      
      mockPrisma.courtesyInvitation.findMany.mockResolvedValue([]);
      
      mockPrisma.ticketType = { findMany: jest.fn().mockResolvedValue([{ id: 'tt-valid' }]) } as any;

      const createdInvitation = {
        id: 'inv-ticket-1',
        ...singleInvitation,
        invitedEmail: singleInvitation.invitedEmail.toLowerCase(),
        eventId: mockEventId,
        createdBy: mockUser.id,
        invitationCode: 'code-ticket-1',
        expiresAt: expect.any(Date),
        creator: { firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
        ticketType: { id: 'tt-valid', name: 'VIP', price: 1000 }
      };

      mockPrisma.$transaction.mockResolvedValue([createdInvitation]);

      const { POST } = await import('@/app/api/events/[id]/invitations/route');
      const res = await POST(
        mockRequest(singleInvitation),
        { params: Promise.resolve({ id: mockEventId }) } as any
      );

      expect(res.status).toBe(201);
      expect(res.body.invitations).toHaveLength(1);
      expect(res.body.invitations[0].ticketType).toBeDefined();
    });

    it('debería rechazar una invitación con ticketTypeId inválido', async () => {
      const singleInvitation = {
        invitedEmail: 'badticket@test.com',
        invitedName: 'Bad Ticket',
        ticketTypeId: 'tt-invalid',
      };

      
      mockPrisma.ticketType = { findMany: jest.fn().mockResolvedValue([]) } as any;
      
      mockPrisma.courtesyInvitation.findMany.mockResolvedValue([]);

      const { POST } = await import('@/app/api/events/[id]/invitations/route');
      const res = await POST(
        mockRequest(singleInvitation),
        { params: Promise.resolve({ id: mockEventId }) } as any
      );

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Algunos tipos de ticket no pertenecen a este evento');
    });

    it('debería crear una invitación con priceTierId válido', async () => {
      const singleInvitation = {
        invitedEmail: 'tier@test.com',
        invitedName: 'Tier User',
        ticketTypeId: 'tt-valid',
        priceTierId: 'pt-valid'
      };

      mockPrisma.courtesyInvitation.findMany.mockResolvedValue([]);
      mockPrisma.ticketType = { findMany: jest.fn().mockResolvedValue([{ id: 'tt-valid' }]) } as any;
      mockPrisma.priceTier = { findMany: jest.fn().mockResolvedValue([{ id: 'pt-valid', ticketTypeId: 'tt-valid' }]) } as any;

      const createdInvitation = {
        id: 'inv-tier-1',
        ...singleInvitation,
        invitedEmail: singleInvitation.invitedEmail.toLowerCase(),
        eventId: mockEventId,
        createdBy: mockUser.id,
        invitationCode: 'code-tier-1',
        expiresAt: expect.any(Date),
        creator: { firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
        ticketType: { id: 'tt-valid', name: 'VIP', price: 1000 },
        priceTier: { id: 'pt-valid', name: 'Early Bird', price: 800 }
      };

  mockPrisma.$transaction.mockResolvedValue([createdInvitation]);

      const { POST } = await import('@/app/api/events/[id]/invitations/route');
      const res = await POST(
        mockRequest(singleInvitation),
        { params: Promise.resolve({ id: mockEventId }) } as any
      );

      expect(res.status).toBe(201);
      expect(res.body.invitations[0].priceTier).toBeDefined();
    });

    it('debería rechazar una invitación con priceTierId inválido', async () => {
      const singleInvitation = {
        invitedEmail: 'badpt@test.com',
        invitedName: 'Bad PT',
        ticketTypeId: 'tt-valid',
        priceTierId: 'pt-invalid'
      };

      mockPrisma.courtesyInvitation.findMany.mockResolvedValue([]);
      mockPrisma.ticketType = { findMany: jest.fn().mockResolvedValue([{ id: 'tt-valid' }]) } as any;
      mockPrisma.priceTier = { findMany: jest.fn().mockResolvedValue([]) } as any;

      const { POST } = await import('@/app/api/events/[id]/invitations/route');
      const res = await POST(
        mockRequest(singleInvitation),
        { params: Promise.resolve({ id: mockEventId }) } as any
      );

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Algunos price tiers no pertenecen a este evento');
    });

    it('debería crear múltiples invitaciones masivas exitosamente', async () => {
      const bulkInvitations = {
        invitations: [
          {
            invitedEmail: 'test1@example.com',
            invitedName: 'Test User 1',
          },
          {
            invitedEmail: 'test2@example.com',
            invitedName: 'Test User 2',
          },
          {
            invitedEmail: 'test3@example.com',
            invitedName: 'Test User 3',
          },
        ],
      };

      const createdInvitations = bulkInvitations.invitations.map((inv, index) => ({
        id: `inv-${index + 1}`,
        ...inv,
        invitedEmail: inv.invitedEmail.toLowerCase(),
        eventId: mockEventId,
        createdBy: mockUser.id,
        invitationCode: `code${index + 1}`,
        expiresAt: expect.any(Date),
        creator: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@test.com',
        },
      }));

      
      mockPrisma.courtesyInvitation.findMany.mockResolvedValue([]);
      
      
      mockPrisma.$transaction.mockResolvedValue(createdInvitations);

      const { POST } = await import('@/app/api/events/[id]/invitations/route');
      const res = await POST(
        mockRequest(bulkInvitations),
        { params: Promise.resolve({ id: mockEventId }) } as any
      );

      expect(res.status).toBe(201);
      expect(res.body.message).toContain('3 invitación(es) creada(s) exitosamente');
      expect(res.body.invitations).toHaveLength(3);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('debería rechazar más de 50 invitaciones masivas', async () => {
      const tooManyInvitations = {
        invitations: Array.from({ length: 51 }, (_, i) => ({
          invitedEmail: `test${i + 1}@example.com`,
          invitedName: `Test User ${i + 1}`,
        })),
      };

      const { POST } = await import('@/app/api/events/[id]/invitations/route');
      const res = await POST(
        mockRequest(tooManyInvitations),
        { params: Promise.resolve({ id: mockEventId }) } as any
      );

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Datos inválidos');
      expect(res.body.details).toBeDefined();
    });

    it('debería rechazar emails duplicados existentes', async () => {
      const duplicateInvitation = {
        invitedEmail: 'existing@example.com',
        invitedName: 'Existing User',
      };

      
      mockPrisma.courtesyInvitation.findMany.mockResolvedValue([
        { invitedEmail: 'existing@example.com' },
      ]);

      const { POST } = await import('@/app/api/events/[id]/invitations/route');
      const res = await POST(
        mockRequest(duplicateInvitation),
        { params: Promise.resolve({ id: mockEventId }) } as any
      );

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Algunos emails ya están invitados a este evento');
      expect(res.body.duplicateEmails).toContain('existing@example.com');
    });

    it('debería validar formato de email inválido', async () => {
      const invalidEmailInvitation = {
        invitedEmail: 'invalid-email',
        invitedName: 'Test User',
      };

      const { POST } = await import('@/app/api/events/[id]/invitations/route');
      const res = await POST(
        mockRequest(invalidEmailInvitation),
        { params: Promise.resolve({ id: mockEventId }) } as any
      );

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Datos inválidos');
    });

    it('debería rechazar lista vacía de invitaciones', async () => {
      const emptyInvitations = {
        invitations: [],
      };

      const { POST } = await import('@/app/api/events/[id]/invitations/route');
      const res = await POST(
        mockRequest(emptyInvitations),
        { params: Promise.resolve({ id: mockEventId }) } as any
      );

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Datos inválidos');
    });

    it('debería manejar errores de base de datos', async () => {
      const validInvitation = {
        invitedEmail: 'test@example.com',
        invitedName: 'Test User',
      };

      
      mockPrisma.courtesyInvitation.findMany.mockResolvedValue([]);
      
      
      mockPrisma.$transaction.mockRejectedValue(new Error('Database error'));

      const { POST } = await import('@/app/api/events/[id]/invitations/route');
      const res = await POST(
        mockRequest(validInvitation),
        { params: Promise.resolve({ id: mockEventId }) } as any
      );

      expect(res.status).toBe(500);
      expect(res.body.error).toBe('Error interno del servidor');
    });
  });

  describe('Validaciones de esquema', () => {
    const mockRequest = (body: any) => ({
      json: jest.fn().mockResolvedValue(body),
    }) as any as NextRequest;

    it('debería validar campos requeridos para invitación individual', async () => {
      const incompleteInvitation = {
        invitedName: 'Test User', 
      };

      const { POST } = await import('@/app/api/events/[id]/invitations/route');
      const res = await POST(
        mockRequest(incompleteInvitation),
        { params: Promise.resolve({ id: mockEventId }) } as any
      );

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Datos inválidos');
    });

    it('debería validar tipos de datos correctos', async () => {
      const invalidDataTypes = {
        invitedEmail: 123, 
        invitedName: ['array'], 
      };

      const { POST } = await import('@/app/api/events/[id]/invitations/route');
      const res = await POST(
        mockRequest(invalidDataTypes),
        { params: Promise.resolve({ id: mockEventId }) } as any
      );

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Datos inválidos');
    });
  });
});
