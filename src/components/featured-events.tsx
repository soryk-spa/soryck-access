"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  User,
  ChevronRight,
  Loader2,
  TrendingUp,
  Star,
  Eye
} from 'lucide-react'

interface Event {
  id: string
  title: string
  description: string | null
  location: string
  startDate: string
  endDate: string | null
  price: number
  capacity: number
  isFree: boolean
  imageUrl: string | null
  category: {
    id: string
    name: string
  }
  organizer: {
    id: string
    firstName: string | null
    lastName: string | null
    email: string
  }
  _count: {
    tickets: number
    orders: number
  }
}

export default function FeaturedEvents() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFeaturedEvents() {
      try {
        const response = await fetch('/api/events/public?limit=6&sortBy=startDate&sortOrder=asc')
        
        if (!response.ok) {
          throw new Error('Error al cargar eventos')
        }
        
        const data = await response.json()
        setEvents(data.events || [])
      } catch (err) {
        console.error('Error fetching featured events:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedEvents()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('es-ES', { month: 'short' }),
      weekday: date.toLocaleDateString('es-ES', { weekday: 'short' }),
      time: date.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      })
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getOrganizerName = (organizer: Event['organizer']) => {
    if (organizer.firstName || organizer.lastName) {
      return `${organizer.firstName || ''} ${organizer.lastName || ''}`.trim()
    }
    return organizer.email.split('@')[0]
  }

  const getAvailability = (event: Event) => {
    const available = event.capacity - event._count.tickets
    const percentage = Math.round((event._count.tickets / event.capacity) * 100)
    
    if (available === 0) {
      return { status: 'sold-out', text: 'Agotado', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
    } else if (percentage >= 90) {
      return { status: 'almost-sold', text: 'Últimas entradas', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' }
    } else if (percentage >= 70) {
      return { status: 'filling-up', text: 'Llenándose', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' }
    } else {
      return { status: 'available', text: 'Disponible', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' }
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-r from-[#FDBD00]/5 via-[#FE4F00]/5 to-[#CC66CC]/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4 border-[#01CBFE] text-[#0053CC]">
              Eventos Destacados
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-[#0053CC] to-[#01CBFE] bg-clip-text text-transparent">
                Próximos Eventos
              </span>
            </h2>
          </div>
          
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#0053CC]" />
              <p className="text-muted-foreground">Cargando eventos destacados...</p>
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-gradient-to-r from-[#FDBD00]/5 via-[#FE4F00]/5 to-[#CC66CC]/5">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-foreground">Error al cargar eventos</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Intentar de nuevo
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gradient-to-r from-[#FDBD00]/5 via-[#FE4F00]/5 to-[#CC66CC]/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-[#01CBFE] text-[#0053CC]">
            Eventos Destacados
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#0053CC] to-[#01CBFE] bg-clip-text text-transparent">
              Próximos Eventos
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Descubre los eventos más emocionantes que están por venir
          </p>
        </div>

        {events.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {events.map((event) => {
                const startDate = formatDate(event.startDate)
                const availability = getAvailability(event)
                
                return (
                  <Card key={event.id} className="hover:shadow-xl transition-all duration-300 overflow-hidden group bg-background border-0 shadow-lg">
                    <div className="relative h-48 overflow-hidden">
                      {event.imageUrl ? (
                        <Image
                          src={event.imageUrl}
                          alt={event.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#01CBFE]/20 to-[#0053CC]/20 flex items-center justify-center">
                          <Calendar className="h-16 w-16 text-[#0053CC]/50" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4 bg-white/95 backdrop-blur rounded-lg p-3 shadow-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-[#0053CC]">{startDate.day}</div>
                          <div className="text-xs text-muted-foreground uppercase">{startDate.month}</div>
                          <div className="text-xs text-muted-foreground">{startDate.weekday}</div>
                        </div>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge variant="secondary" className="bg-white/90 backdrop-blur text-[#0053CC]">
                          {event.category.name}
                        </Badge>
                      </div>
                      <div className="absolute bottom-4 right-4">
                        <Badge className={availability.color}>
                          {availability.text}
                        </Badge>
                      </div>
                    </div>

                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold line-clamp-2 group-hover:text-[#0053CC] transition-colors">
                          {event.title}
                        </h3>
                        <div className="text-right ml-4 flex-shrink-0">
                          {event.isFree ? (
                            <span className="text-lg font-bold text-green-600">Gratis</span>
                          ) : (
                            <span className="text-lg font-bold text-[#0053CC]">
                              {formatPrice(event.price)}
                            </span>
                          )}
                        </div>
                      </div>

                      {event.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {event.description}
                        </p>
                      )}

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{startDate.time}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          <span>Por {getOrganizerName(event.organizer)}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>
                            {event._count.tickets}/{event.capacity} asistentes
                          </span>
                        </div>
                      </div>

                      <Button 
                        asChild 
                        className="w-full bg-gradient-to-r from-[#0053CC] to-[#01CBFE] hover:from-[#0053CC]/90 hover:to-[#01CBFE]/90"
                        disabled={availability.status === 'sold-out'}
                      >
                        <Link href={`/events/${event.id}`}>
                          {availability.status === 'sold-out' ? 'Agotado' : 'Ver Evento'}
                          {availability.status !== 'sold-out' && <Eye className="w-4 h-4 ml-2" />}
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
            <div className="text-center">
              <Button 
                asChild 
                size="lg" 
                variant="outline" 
                className="border-[#0053CC] text-[#0053CC] hover:bg-[#0053CC] hover:text-white"
              >
                <Link href="/events">
                  Ver Todos los Eventos
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gradient-to-br from-[#01CBFE]/20 to-[#0053CC]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-12 w-12 text-[#0053CC]/50" />
            </div>
            <h3 className="text-2xl font-bold mb-4 text-foreground">¡Próximamente eventos increíbles!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Estamos preparando eventos fantásticos para ti. Mientras tanto, puedes explorar nuestra plataforma.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-gradient-to-r from-[#0053CC] to-[#01CBFE]">
                <Link href="/events/create">
                  <Star className="w-4 h-4 mr-2" />
                  Crear tu Evento
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-[#0053CC] text-[#0053CC]">
                <Link href="/events">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Explorar Eventos
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}