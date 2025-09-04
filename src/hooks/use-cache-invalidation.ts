"use client"
import { useCallback } from 'react'
import { useUser } from '@clerk/nextjs'

export function useCacheInvalidation() {
  const { user } = useUser()

  const invalidateUserCache = useCallback(async () => {
    if (!user?.id) return

    try {
      await fetch('/api/admin/cache/invalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pattern: `user:*:${user.id}`,
          type: 'user'
        }),
      })
    } catch (error) {
      console.error('Error invalidating user cache:', error)
    }
  }, [user?.id])

  const invalidateEventsCache = useCallback(async () => {
    try {
      await fetch('/api/admin/cache/invalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pattern: 'events:*',
          type: 'events'
        }),
      })
    } catch (error) {
      console.error('Error invalidating events cache:', error)
    }
  }, [])

  const invalidateAllCache = useCallback(async () => {
    try {
      await fetch('/api/admin/cache/invalidate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pattern: '*',
          type: 'all'
        }),
      })
    } catch (error) {
      console.error('Error invalidating all cache:', error)
    }
  }, [])

  return {
    invalidateUserCache,
    invalidateEventsCache,
    invalidateAllCache,
  }
}
