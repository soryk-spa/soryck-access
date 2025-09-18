jest.mock('next/server', () => {
  class NextResponse {
    status: number
    body: any
    headers: any
    constructor(body?: any, opts?: any) {
      this.status = opts?.status || 200
      this.body = body
      this.headers = opts?.headers || {}
    }
    static json(body: any, opts?: any) {
      return { status: opts?.status || 200, body }
    }
  }
  return { NextResponse }
})


const mockPrisma = {
  ticket: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  eventScanner: {
    findFirst: jest.fn(),
  }
}
jest.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))


const mockRequireAuth = jest.fn()
jest.mock('@/lib/auth', () => ({ requireAuth: mockRequireAuth }))

describe('GET/POST /api/verify/[qrCode]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('GET returns 404 when ticket not found', async () => {
    mockPrisma.ticket.findUnique.mockResolvedValueOnce(null)
    const { GET } = await import('../../../src/app/api/verify/[qrCode]/route')
    const res = await GET(undefined as any, { params: Promise.resolve({ qrCode: 'EVENT123-USER5678-ABC-DEF-0' }) } as any)
    expect(res.status).toBe(404)
    expect(res.body).toBeDefined()
    expect((res.body as any).error).toBe('Ticket no encontrado')
  })

  it('GET returns ticket info when found', async () => {
    const fakeTicket = {
      id: 't1',
      qrCode: 'EVENT-USER-0-ABC-0',
      isUsed: false,
      usedAt: null,
      status: 'ACTIVE',
      user: { firstName: 'A', lastName: 'B', email: 'a@a.com' },
      event: { id: 'e1', title: 'E', startDate: new Date(), endDate: null, location: 'L', organizer: { id: 'org1' } },
      order: { orderNumber: 'ORD1', totalAmount: 1000, currency: 'CLP' },
      createdAt: new Date(),
    }
  mockPrisma.ticket.findUnique.mockResolvedValueOnce(fakeTicket)

    const { GET } = await import('../../../src/app/api/verify/[qrCode]/route')
    const res = await GET(undefined as any, { params: Promise.resolve({ qrCode: 'EVENT123-USER5678-ABC-DEF-0' }) } as any)

    expect(res.status).toBe(200)
    expect(res.body.ticket).toBeDefined()
    expect(res.body.canUse).toBe(true)
  })

  it('POST forbids when user lacks scanner permissions', async () => {
  mockRequireAuth.mockResolvedValueOnce({ id: 'u1', role: 'USER' })
  mockPrisma.ticket.findUnique.mockResolvedValueOnce({ id: 't1', event: { id: 'e1', organizerId: 'org1' }, isUsed: false, status: 'ACTIVE' })

    const { POST } = await import('../../../src/app/api/verify/[qrCode]/route')
    const res = await POST(undefined as any, { params: Promise.resolve({ qrCode: 'EVENT123-USER5678-ABC-DEF-0' }) } as any)

    expect(res.status).toBe(403)
    expect(res.body.error).toBe('No tienes permisos para validar tickets')
  })

  it('POST marks ticket as used when permitted', async () => {
  mockRequireAuth.mockResolvedValueOnce({ id: 'scanner_1', role: 'SCANNER' })
  mockPrisma.ticket.findUnique.mockResolvedValueOnce({ id: 't1', qrCode: 'EVENT-USER-0-ABC-0', isUsed: false, status: 'ACTIVE', event: { id: 'e1', organizerId: 'org1', title: 'E', startDate: new Date() } })
  mockPrisma.eventScanner.findFirst.mockResolvedValueOnce({ id: 'assign1' })
  mockPrisma.ticket.update.mockResolvedValueOnce({ id: 't1', qrCode: 'EVENT-USER-0-ABC-0', isUsed: true, usedAt: new Date(), user: { firstName: 'X', lastName: 'Y', email: 'x@y.com' } })

    const { POST } = await import('../../../src/app/api/verify/[qrCode]/route')
    const res = await POST(undefined as any, { params: Promise.resolve({ qrCode: 'EVENT123-USER5678-ABC-DEF-0' }) } as any)

    expect(res.status).toBe(200)
    expect(res.body.ticket).toBeDefined()
    expect(res.body.ticket.isUsed).toBe(true)
  })
})
