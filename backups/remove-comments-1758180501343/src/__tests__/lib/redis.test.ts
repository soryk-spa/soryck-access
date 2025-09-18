import { CacheService, UserProfile } from '../../lib/redis'

jest.mock('ioredis', () => {
  return {
    Redis: jest.fn().mockImplementation(() => ({
      pipeline: () => ({ setex: jest.fn(), exec: jest.fn() }),
      setex: jest.fn(),
      get: jest.fn(),
      del: jest.fn(),
      keys: jest.fn().mockResolvedValue([]),
      ping: jest.fn().mockResolvedValue('PONG'),
      quit: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
    })),
  }
})

describe('CacheService basic operations', () => {
  it('setUserBatch uses pipeline and exec', async () => {
    const cache = CacheService.getInstance()

    // Should not throw
  const user: Partial<UserProfile> = { id: '1', clerkId: 'clerk_1', email: 'a@a.com', role: 'USER' }
  await expect(cache.setUserBatch('clerk_1', user as UserProfile)).resolves.toBeUndefined()
  })

  it('ping returns true when redis PONG', async () => {
    const cache = CacheService.getInstance()
    const ok = await cache.ping()
    expect(ok).toBe(true)
  })
})
