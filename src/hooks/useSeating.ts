'use client'

import { useState, useEffect, useCallback } from 'react'

interface SeatReservation {
  id: string
  seatId: string
  sessionId: string
  expiresAt: string
}

interface Section {
  id: string
  name: string
  color: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  basePrice?: number
  seats: Seat[]
}

interface Seat {
  id: string
  row: string
  number: string
  x: number
  y: number
  price?: number
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'BLOCKED' | 'MAINTENANCE'
  isAccessible: boolean
}

interface UseSeatingReturn {
  sections: Section[]
  loading: boolean
  error: string | null
  selectedSeats: string[]
  reserveSeats: (seatIds: string[]) => Promise<boolean>
  releaseSeats: (seatIds: string[]) => Promise<boolean>
  refreshSeating: () => Promise<void>
  sessionId: string
}

export function useSeating(eventId: string): UseSeatingReturn {
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [sessionId] = useState(() => {
    // Generate or get session ID from localStorage
    let id = localStorage.getItem('seat-session-id')
    if (!id) {
      id = Math.random().toString(36).substring(2) + Date.now().toString(36)
      localStorage.setItem('seat-session-id', id)
    }
    return id
  })

  // Fetch seating plan
  const fetchSeating = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/events/${eventId}/seating`)
      if (!response.ok) {
        throw new Error('Failed to fetch seating plan')
      }

      const data = await response.json()
      setSections(data.sections || [])
    } catch (err) {
      console.error('Error fetching seating:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [eventId])

  // Reserve seats temporarily
  const reserveSeats = useCallback(async (seatIds: string[]): Promise<boolean> => {
    try {
      const response = await fetch(`/api/events/${eventId}/seating/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          seatIds,
          sessionId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reserve seats')
      }

      const data = await response.json()
      if (data.success) {
        setSelectedSeats(seatIds)
        // Update seat statuses in sections
        setSections(prev => prev.map(section => ({
          ...section,
          seats: section.seats.map(seat => 
            seatIds.includes(seat.id) 
              ? { ...seat, status: 'RESERVED' as const }
              : seat
          )
        })))
        return true
      }
      return false
    } catch (err) {
      console.error('Error reserving seats:', err)
      setError(err instanceof Error ? err.message : 'Failed to reserve seats')
      return false
    }
  }, [eventId, sessionId])

  // Release seat reservations
  const releaseSeats = useCallback(async (seatIds: string[]): Promise<boolean> => {
    try {
      const response = await fetch(`/api/events/${eventId}/seating/release`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          seatIds,
          sessionId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to release seats')
      }

      const data = await response.json()
      if (data.success) {
        setSelectedSeats(prev => prev.filter(id => !seatIds.includes(id)))
        // Update seat statuses in sections
        setSections(prev => prev.map(section => ({
          ...section,
          seats: section.seats.map(seat => 
            seatIds.includes(seat.id) 
              ? { ...seat, status: 'AVAILABLE' as const }
              : seat
          )
        })))
        return true
      }
      return false
    } catch (err) {
      console.error('Error releasing seats:', err)
      setError(err instanceof Error ? err.message : 'Failed to release seats')
      return false
    }
  }, [eventId, sessionId])

  // Refresh seating data
  const refreshSeating = useCallback(async () => {
    await fetchSeating()
  }, [fetchSeating])

  // Cleanup reservations on unmount
  useEffect(() => {
    const cleanup = () => {
      if (selectedSeats.length > 0) {
        releaseSeats(selectedSeats)
      }
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup)
    
    return () => {
      window.removeEventListener('beforeunload', cleanup)
      cleanup()
    }
  }, [selectedSeats, releaseSeats])

  // Auto-refresh seating data every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        refreshSeating()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [loading, refreshSeating])

  // Initial fetch
  useEffect(() => {
    fetchSeating()
  }, [fetchSeating])

  return {
    sections,
    loading,
    error,
    selectedSeats,
    reserveSeats,
    releaseSeats,
    refreshSeating,
    sessionId
  }
}
