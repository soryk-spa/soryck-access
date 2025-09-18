jest.mock('@clerk/nextjs/server', () => ({ auth: jest.fn() }))
jest.mock('@/lib/auth', () => ({ getCurrentUser: jest.fn() }))


const mockCache = {
  getUserFullData: jest.fn(),
  setUserBatch: jest.fn()
}
jest.mock('@/lib/redis', () => ({
  CacheService: {
    getInstance: () => mockCache
  }
}))

jest.mock('next/server', () => ({ NextResponse: { json: (body: any, opts?: any) => ({ status: opts?.status || 200, body }) } }))

import { auth } from '@clerk/nextjs/server'
import { getCurrentUser } from '@/lib/auth'


describe('GET /api/user/profile', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 401 when not authenticated', async () => {
  ;(auth as unknown as jest.Mock).mockResolvedValue({ userId: null })
  const { GET } = await import('../../../src/app/api/user/profile/route')
  const res = await GET()
  expect(res.status).toBe(401)
  })

  it('returns cached user when present', async () => {
    ;(auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_1' })
  const cache = (await import('@/lib/redis')).CacheService.getInstance()
  ;(cache.getUserFullData as jest.Mock).mockResolvedValue({ id: 'u1', email: 'a@a.com', role: 'USER' })

  const { GET } = await import('../../../src/app/api/user/profile/route')
  const res = await GET()
  expect(res.body.user).toBeDefined()
  expect(res.body.user.email).toBe('a@a.com')
  })

  it('falls back to getCurrentUser and caches result', async () => {
    ;(auth as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_2' })
  const cache = (await import('@/lib/redis')).CacheService.getInstance()
    ;(cache.getUserFullData as jest.Mock).mockResolvedValue(null)
    ;(getCurrentUser as unknown as jest.Mock).mockResolvedValue({ id: 'u2', email: 'b@b.com', clerkId: 'clerk_2', role: 'USER' })

  const { GET } = await import('../../../src/app/api/user/profile/route')
  const res = await GET()
  expect(res.body.user).toBeDefined()
  expect(cache.setUserBatch).toHaveBeenCalled()
  })
})
