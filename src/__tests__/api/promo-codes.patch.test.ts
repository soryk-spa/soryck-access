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

jest.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))
const mockPrismaPromo = {
  promoCode: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
}
jest.mock('@/lib/prisma', () => ({ prisma: mockPrismaPromo }))

const mockRequireOrganizer = jest.fn()
jest.mock('@/lib/auth', () => ({ requireOrganizer: mockRequireOrganizer }))

describe('PATCH /api/promo-codes/[id]', () => {
  beforeEach(() => jest.clearAllMocks())

  it('allows full edit when promo has no usages', async () => {
    
    mockRequireOrganizer.mockResolvedValueOnce({ id: 'org1', role: 'ORGANIZER' })
  mockPrismaPromo.promoCode.findFirst.mockResolvedValueOnce({ id: 'p1', createdBy: 'org1', _count: { usages: 0 } })
  mockPrismaPromo.promoCode.findUnique.mockResolvedValueOnce(null) 
  mockPrismaPromo.promoCode.update.mockResolvedValueOnce({ id: 'p1', code: 'NEWCODE', name: 'New', _count: { usages: 0 }, validFrom: new Date(), validUntil: null, createdAt: new Date(), updatedAt: new Date(), event: null })

    const { PATCH } = await import('../../../src/app/api/promo-codes/[id]/route')

    const body = { code: 'NEWCODE', name: 'New Name', type: 'PERCENTAGE', value: 10 }

    const fakeRequest = {
      json: async () => body,
    } as any

    const res = await PATCH(fakeRequest as any, { params: Promise.resolve({ id: 'p1' }) } as any)

    expect(res.status).toBe(200)
    expect(res.body).toBeDefined()
  expect(mockPrismaPromo.promoCode.update).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 'p1' }, data: expect.objectContaining({ code: 'NEWCODE' }) }))
  })

  it('rejects changing protected fields when promo has usages', async () => {
    mockRequireOrganizer.mockResolvedValueOnce({ id: 'org1', role: 'ORGANIZER' })
  mockPrismaPromo.promoCode.findFirst.mockResolvedValueOnce({ id: 'p2', createdBy: 'org1', _count: { usages: 2 } })

    const { PATCH } = await import('../../../src/app/api/promo-codes/[id]/route')

    const body = { code: 'SHOULDFAIL' }
    const fakeRequest = { json: async () => body } as any

    const res = await PATCH(fakeRequest as any, { params: Promise.resolve({ id: 'p2' }) } as any)

    expect(res.status).toBe(400)
    expect(res.body).toBeDefined()
    expect((res.body as any).error).toMatch(/No se puede modificar 'code'/)
  expect(mockPrismaPromo.promoCode.update).not.toHaveBeenCalled()
  })
})
