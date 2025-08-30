'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SeatSelector } from '@/components/seating/seat-selector'
import { useSeating } from '@/hooks/useSeating'
import { ArrowLeft, Calendar, MapPin, Clock } from 'lucide-react'

interface Event {
  id: string
  title: string
  description?: string
  imageUrl?: string
  location: string
  startDate: string
  endDate?: string
  price: number
  currency: string
  hasSeatingPlan: boolean
}

interface SelectedSeat {
  id: string
  row: string
  number: string
  sectionName: string
  finalPrice: number
  isAccessible: boolean
}

export default function EventTicketsSeatingPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useUser()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([])
  const [eventLoading, setEventLoading] = useState(true)
  const [eventError, setEventError] = useState<string | null>(null)

  const {
    sections,
    loading: seatingLoading,
    error: seatingError,
    reserveSeats,
    releaseSeats
  } = useSeating(eventId)

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setEventLoading(true)
        const response = await fetch(`/api/events/${eventId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch event')
        }
        const eventData = await response.json()
        setEvent(eventData)
      } catch (err) {
        console.error('Error fetching event:', err)
        setEventError('Error loading event data')
      } finally {
        setEventLoading(false)
      }
    }

    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  // Handle seat selection changes
  const handleSelectionChange = async (seats: SelectedSeat[]) => {
    const newSeatIds = seats.map(s => s.id)
    const currentSeatIds = selectedSeats.map(s => s.id)

    // Find seats to add and remove
    const seatsToAdd = newSeatIds.filter(id => !currentSeatIds.includes(id))
    const seatsToRemove = currentSeatIds.filter(id => !newSeatIds.includes(id))

    try {
      // Release seats that were deselected
      if (seatsToRemove.length > 0) {
        await releaseSeats(seatsToRemove)
      }

      // Reserve newly selected seats
      if (seatsToAdd.length > 0) {
        const success = await reserveSeats(seatsToAdd)
        if (!success) {
          // If reservation failed, don't update selection
          return
        }
      }

      setSelectedSeats(seats)
    } catch (error) {
      console.error('Error managing seat reservations:', error)
    }
  }

  // Proceed to checkout
  const handleProceedToCheckout = async (seats: SelectedSeat[]) => {
    if (!user) {
      // Redirect to sign in
      router.push(`/sign-in?redirectTo=/events/${eventId}/tickets/seating`)
      return
    }

    if (seats.length === 0) {
      alert('Por favor selecciona al menos un asiento')
      return
    }

    try {
      // Reserve seats one more time to ensure they're still available
      const seatIds = seats.map(s => s.id)
      const success = await reserveSeats(seatIds)
      
      if (!success) {
        alert('Algunos asientos ya no están disponibles. Por favor selecciona otros.')
        return
      }

      // Navigate to payment with seat information
      const searchParams = new URLSearchParams({
        seats: JSON.stringify(seats.map(seat => ({
          id: seat.id,
          section: seat.sectionName,
          row: seat.row,
          number: seat.number,
          price: seat.finalPrice
        })))
      })

      router.push(`/events/${eventId}/tickets/payment?${searchParams.toString()}`)
    } catch (error) {
      console.error('Error proceeding to checkout:', error)
      alert('Error al proceder con la compra. Por favor intenta nuevamente.')
    }
  }

  const loading = eventLoading || seatingLoading
  const error = eventError || seatingError

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Cargando mapa de asientos...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>Evento no encontrado</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!event.hasSeatingPlan || sections.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>
            Este evento no tiene un mapa de asientos configurado. 
            <Button 
              variant="link" 
              onClick={() => router.push(`/events/${eventId}/tickets`)}
              className="p-0 ml-1"
            >
              Comprar tickets regulares
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const startDate = new Date(event.startDate)
  const formattedDate = startDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  const formattedTime = startDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                Selecciona tus asientos
              </h1>
              <p className="text-sm text-gray-600">
                {event.title}
              </p>
            </div>
          </div>

          <Card className="p-3">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <span className="capitalize">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span>{formattedTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span>{event.location}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Seat Selector */}
      <div className="flex-1">
        <SeatSelector
          eventId={eventId}
          sections={sections}
          maxSeats={8}
          onSelectionChange={handleSelectionChange}
          onProceedToCheckout={handleProceedToCheckout}
        />
      </div>
    </div>
  )
}
