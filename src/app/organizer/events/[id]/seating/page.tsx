'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { SeatingEditor } from '@/components/seating/seating-editor'
import { ArrowLeft, Settings, Users, MapPin, Loader2, CheckCircle, Edit, Layout } from 'lucide-react'

interface Event {
  id: string
  title: string
  location: string
  capacity: number
  hasSeatingPlan: boolean
}

interface Section {
  id: string
  type: 'section'
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
          // Agregar la propiedad type a todas las secciones para compatibilidad
          const sectionsWithType = (seatingData.sections || []).map((section: {
            id: string;
            name: string;
            [key: string]: unknown;
          }) => ({
            ...section,
            type: 'section' as const
          }))
          setSections(sectionsWithType)
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
      <div className="min-h-screen bg-gradient-to-br from-[#0053CC]/5 via-[#01CBFE]/5 to-[#CC66CC]/5">
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-[#0053CC] to-[#01CBFE] rounded-2xl flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Cargando configuración</h3>
                <p className="text-muted-foreground">Preparando el editor de asientos...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0053CC]/5 via-[#01CBFE]/5 to-[#CC66CC]/5">
        <div className="container mx-auto px-4 py-12">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0053CC]/5 via-[#01CBFE]/5 to-[#CC66CC]/5">
        <div className="container mx-auto px-4 py-12">
          <Alert className="max-w-md mx-auto">
            <AlertDescription>Evento no encontrado</AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0053CC]/5 via-[#01CBFE]/5 to-[#CC66CC]/5 flex flex-col">
      <div className="bg-background/95 backdrop-blur-sm border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="flex items-center gap-2 border-2 hover:border-[#0053CC] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </Button>
              
              <div className="space-y-1">
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#0053CC] to-[#01CBFE] bg-clip-text text-transparent">
                  Gestión de Asientos
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Layout className="w-4 h-4" />
                  {event.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Card className="border-0 shadow-lg bg-background/50 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#FE4F00] to-[#CC66CC] rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{event.location}</p>
                        <p className="text-xs text-muted-foreground">Ubicación</p>
                      </div>
                    </div>
                    
                    <div className="h-8 w-px bg-border"></div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] rounded-lg flex items-center justify-center">
                        <Users className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{event.capacity}</p>
                        <p className="text-xs text-muted-foreground">Capacidad</p>
                      </div>
                    </div>
                    
                    <div className="h-8 w-px bg-border"></div>
                    
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-[#CC66CC] to-[#01CBFE] rounded-lg flex items-center justify-center">
                        <Settings className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{totalSeats}</p>
                        <p className="text-xs text-muted-foreground">Asientos</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Badge 
                variant={event.hasSeatingPlan ? "default" : "secondary"}
                className={event.hasSeatingPlan 
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white border-0 px-4 py-2" 
                  : "bg-muted text-muted-foreground px-4 py-2"
                }
              >
                {event.hasSeatingPlan ? (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Plan configurado
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Sin configurar
                  </>
                )}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative">
        <SeatingEditor
          initialSections={sections}
          onSave={handleSave}
        />
      </div>

      <div className="bg-background/95 backdrop-blur-sm border-t shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              {sections.length > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] rounded-full"></div>
                  <span>
                    {sections.length} {sections.length === 1 ? 'sección' : 'secciones'} • {totalSeats} asientos totales
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {saving ? (
                <div className="flex items-center gap-2 text-[#0053CC]">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="font-medium">Guardando...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Cambios guardados</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
