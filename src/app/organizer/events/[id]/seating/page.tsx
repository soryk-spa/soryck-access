'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SeatingEditor } from '@/components/seating/seating-editor'
import { ArrowLeft, Settings, Users, MapPin } from 'lucide-react'

interface Event {
  id: string
  title: string
  location: string
  capacity: number
  hasSeatingPlan: boolean
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
  priceZone?: string
  seats: Seat[]
}

interface Seat {
  id: string
  row: string
  number: string
  x: number
  y: number
  status: 'AVAILABLE' | 'BLOCKED' | 'MAINTENANCE'
  isAccessible: boolean
}

export default function EventSeatingPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string

  const [event, setEvent] = useState<Event | null>(null)
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch event and seating data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch event details
        const eventResponse = await fetch(`/api/events/${eventId}`)
        if (!eventResponse.ok) {
          throw new Error('Failed to fetch event')
        }
        const eventData = await eventResponse.json()
        setEvent(eventData)

        // Fetch seating data if it exists
        const seatingResponse = await fetch(`/api/events/${eventId}/seating`)
        if (seatingResponse.ok) {
          const seatingData = await seatingResponse.json()
          setSections(seatingData.sections || [])
        }
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Error loading event data')
      } finally {
        setLoading(false)
      }
    }

    if (eventId) {
      fetchData()
    }
  }, [eventId])

  // Save seating configuration
  const handleSave = async (newSections: Section[]) => {
    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/events/${eventId}/seating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sections: newSections
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save seating plan')
      }

      setSections(newSections)
      
      // Update event state to reflect it now has a seating plan
      if (event) {
        setEvent({ ...event, hasSeatingPlan: true })
      }
    } catch (err) {
      console.error('Error saving seating plan:', err)
      setError(err instanceof Error ? err.message : 'Error saving seating plan')
      throw err // Re-throw to let the editor handle it
    } finally {
      setSaving(false)
    }
  }

  const totalSeats = sections.reduce((total, section) => total + section.seats.length, 0)

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Cargando configuración de asientos...</p>
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
                Configuración de Asientos
              </h1>
              <p className="text-sm text-gray-600">
                {event.title}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Card className="p-3">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-500" />
                  <span>Capacidad: {event.capacity}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-gray-500" />
                  <span>Asientos configurados: {totalSeats}</span>
                </div>
              </div>
            </Card>

            <Badge variant={event.hasSeatingPlan ? "default" : "secondary"}>
              {event.hasSeatingPlan ? "Plan configurado" : "Sin configurar"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1">
        <SeatingEditor
          initialSections={sections}
          onSave={handleSave}
        />
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 p-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div>
            {sections.length > 0 && (
              <span>
                {sections.length} secciones • {totalSeats} asientos totales
              </span>
            )}
          </div>
          <div>
            {saving ? (
              <span className="text-blue-600">Guardando...</span>
            ) : (
              <span>Listo</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
