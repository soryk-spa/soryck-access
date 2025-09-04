const mockAuth = jest.fn()
jest.mock('@clerk/nextjs/server', () => ({ auth: mockAuth }))
const mockFindUnique = jest.fn()
jest.mock('../../lib/prisma', () => ({ prisma: { user: { findUnique: mockFindUnique } } }))

const mockGetUserRole = jest.fn()
const mockSetUserRole = jest.fn()
jest.mock('../../lib/redis', () => ({
  CacheService: {
    getInstance: () => ({
      getUserRole: mockGetUserRole,
      setUserRole: mockSetUserRole,
    })
  }
}))

import { getCurrentUserRole } from '../../lib/auth'
import { auth as authImport } from '@clerk/nextjs/server'
import { prisma } from '../../lib/prisma'

describe('auth.getCurrentUserRole', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns role from cache when present', async () => {
    ;(authImport as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_1' })
    mockGetUserRole.mockResolvedValue('ADMIN')

    const role = await getCurrentUserRole()
    expect(role).toBe('ADMIN')
  })

  it('falls back to db when cache missing', async () => {
    ;(authImport as unknown as jest.Mock).mockResolvedValue({ userId: 'clerk_2' })
    mockGetUserRole.mockResolvedValue(null)
    ;(prisma.user.findUnique as unknown as jest.Mock).mockResolvedValue({ role: 'ORGANIZER', id: 'u1' })

    const role = await getCurrentUserRole()
    expect(role).toBe('ORGANIZER')
    expect(mockSetUserRole).toHaveBeenCalled()
  })
})
