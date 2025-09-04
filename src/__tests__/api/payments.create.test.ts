/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('next/server', () => ({ NextResponse: { json: (body: any, opts?: any) => ({ status: opts?.status || 200, body }) } }))

// Mocks
const mockUser = { id: 'user_1', email: 'u@u.com', firstName: 'U' }
jest.mock('@/lib/auth', () => ({ requireAuth: jest.fn().mockResolvedValue(mockUser) }))

const mockWebpay = { create: jest.fn() }
jest.mock('@/lib/transbank', () => ({ webpayPlus: mockWebpay }))

const mockCalculate = {
  calculatePriceBreakdown: jest.fn(),
  calculatePriceBreakdownWithDiscount: jest.fn()
}
jest.mock('@/lib/commission', () => mockCalculate)

const mockDiscount = {
  DiscountCodeService: {
    validateDiscountCode: jest.fn(),
    applyCodeUsage: jest.fn()
  }
}
jest.mock('@/lib/discount-codes', () => mockDiscount)

const mockPrisma = {
  ticketType: { findUnique: jest.fn() },
  ticket: { count: jest.fn(), createMany: jest.fn() },
  event: { findUnique: jest.fn() },
  order: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn() },
  payment: { create: jest.fn() },
  $transaction: jest.fn()
}
jest.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

jest.mock('@/lib/qr', () => ({ generateUniqueQRCode: jest.fn().mockReturnValue('QR123') }))
jest.mock('@/lib/email', () => ({ sendTicketEmail: jest.fn() }))

import { requireAuth } from '@/lib/auth'
import type { NextRequest } from 'next/server'

// Minimal response shape used by the mocked NextResponse in tests
type ResponseLike = { status: number; body: any }

describe('POST /api/payments/create', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 400 when body is invalid', async () => {
    // requireAuth will resolve to mockUser
    const req = { json: async () => ({ quantity: 2 }) }
  const { POST } = await import('../../../src/app/api/payments/create/route')
  const res = (await POST(req as unknown as NextRequest)) as unknown as ResponseLike
  expect(res.status).toBe(400)
  expect(res.body.error).toBeDefined()
  })

  it('creates a payment and returns transbank url and token for paid order', async () => {
    // Setup ticket type and event
    const ticketType = {
      id: 'tt1',
      price: 5000,
      ticketsGenerated: 1,
      capacity: 100,
      event: { id: 'e1', isPublished: true, currency: 'CLP' }
    }
    mockPrisma.ticketType.findUnique.mockResolvedValue(ticketType)
    mockPrisma.ticket.count.mockResolvedValue(0)

    // Price breakdown
    mockCalculate.calculatePriceBreakdown.mockReturnValue({ basePrice: 5000, commission: 0, totalPrice: 5000, originalAmount: 5000, discountAmount: 0 })

    // Order creation
    const createdOrder = { id: 'order_1', orderNumber: 'SP123', quantity: 1 }
    mockPrisma.order.create.mockResolvedValue(createdOrder)

    // Webpay responds
    mockWebpay.create.mockResolvedValue({ url: 'https://webpay.test/checkout', token: 'tok_123' })

    // Payment create
    mockPrisma.payment.create.mockResolvedValue({ id: 'pay_1' })

    const reqBody = { ticketTypeId: 'tt1', quantity: 1 }
    const req = { json: async () => reqBody }

    const { POST } = await import('../../../src/app/api/payments/create/route')
  const res = (await POST(req as unknown as NextRequest)) as unknown as ResponseLike

  expect(res.status).toBe(200)
  expect(res.body.success).toBe(true)
  expect(res.body.paymentUrl).toBe('https://webpay.test/checkout')
  expect(res.body.token).toBe('tok_123')
  expect(mockWebpay.create).toHaveBeenCalled()
  expect(mockPrisma.payment.create).toHaveBeenCalled()
  })

  it('applies promo code for a discounted paid order', async () => {
    const ticketType = {
      id: 'tt1',
      price: 5000,
      ticketsGenerated: 1,
      capacity: 100,
      event: { id: 'e1', isPublished: true, currency: 'CLP' }
    }
    mockPrisma.ticketType.findUnique.mockResolvedValueOnce(ticketType)
    mockPrisma.ticket.count.mockResolvedValueOnce(0)

    // promo gives 1000 CLP off
    const discountAmount = 1000
    mockDiscount.DiscountCodeService.validateDiscountCode.mockResolvedValueOnce({ isValid: true, discountAmount, code: 'PROMO1', type: 'FIXED' })
    mockCalculate.calculatePriceBreakdownWithDiscount.mockReturnValueOnce({ basePrice: 4000, commission: 0, totalPrice: 4000, originalAmount: 5000, discountAmount })

    const createdOrder = { id: 'order_2', orderNumber: 'SP124', quantity: 1 }
    mockPrisma.order.create.mockResolvedValueOnce(createdOrder)

    mockWebpay.create.mockResolvedValueOnce({ url: 'https://webpay.test/checkout2', token: 'tok_456' })
    mockPrisma.payment.create.mockResolvedValueOnce({ id: 'pay_2' })

    const reqBody = { ticketTypeId: 'tt1', quantity: 1, promoCode: 'PROMO1' }
    const req = { json: async () => reqBody }

    const { POST } = await import('../../../src/app/api/payments/create/route')
  const res = (await POST(req as unknown as NextRequest)) as unknown as ResponseLike

  expect(res.status).toBe(200)
  expect(res.body.success).toBe(true)
  expect(res.body.priceBreakdown.promoCode).toBe('PROMO1')
  expect(mockDiscount.DiscountCodeService.validateDiscountCode).toHaveBeenCalled()
  expect(mockWebpay.create).toHaveBeenCalled()
  })

  it('processes free-ticket flow (final total 0) and generates tickets', async () => {
    const ticketType = {
      id: 'tt_free',
      price: 5000,
      ticketsGenerated: 1,
      capacity: 100,
      event: { id: 'e_free', isPublished: true, currency: 'CLP' }
    }
    mockPrisma.ticketType.findUnique.mockResolvedValueOnce(ticketType)
    mockPrisma.ticket.count.mockResolvedValueOnce(0)

    const baseTotal = 5000
    // promo gives full discount so final total 0
    mockDiscount.DiscountCodeService.validateDiscountCode.mockResolvedValueOnce({ isValid: true, discountAmount: baseTotal, code: 'FREE100', type: 'FIXED' })
    mockCalculate.calculatePriceBreakdownWithDiscount.mockReturnValueOnce({ basePrice: 0, commission: 0, totalPrice: 0, originalAmount: baseTotal, discountAmount: baseTotal })

    const createdOrder = { id: 'order_free', orderNumber: 'SPFREE', quantity: 1 }
    mockPrisma.order.create.mockResolvedValueOnce(createdOrder)

    // $transaction returns [resultOfCreateMany, updatedOrder]
    const updatedOrder = { id: createdOrder.id, tickets: [{ qrCode: 'QR1' }] }
    mockPrisma.$transaction.mockResolvedValueOnce([null, updatedOrder])

    const reqBody = { ticketTypeId: 'tt_free', quantity: 1, promoCode: 'FREE100' }
    const req = { json: async () => reqBody }

    const { POST } = await import('../../../src/app/api/payments/create/route')
  const res = (await POST(req as unknown as NextRequest)) as unknown as ResponseLike

    // Mock event lookup used in handleAndGenerateTickets
    const eventWithOrganizer = {
      id: ticketType.event.id,
      title: 'Free Event',
      startDate: new Date(),
      location: 'Online',
      organizer: { id: 'org1', name: 'Org' }
    }
    // ensure prisma.event.findUnique exists on the mock
    mockPrisma.event = { findUnique: jest.fn().mockResolvedValueOnce(eventWithOrganizer) }

    expect(res.status).toBe(200)
  expect(res.body.isFree).toBe(true)
  expect(res.body.ticketsGenerated).toBeGreaterThan(0)
  expect(mockDiscount.DiscountCodeService.applyCodeUsage).toHaveBeenCalled()
  expect(mockPrisma.$transaction).toHaveBeenCalled()
  })
})
