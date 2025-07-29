'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  User,
  Share2,
  Heart,
  Edit,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Ticket,
  DollarSign
} from 'lucide-react'
import TicketPurchaseSection from './ticket-purchase-section'

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
  isPublished: boolean
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
    imageUrl: string | null
  }
  _count: {
    tickets: number
    orders: number
  }
}

interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: 'CLIENT' | 'ORGANIZER' | 'ADMIN'
  imageUrl: string | null
}

interface EventDetailViewProps {
  event: Event
  user: User | null
  userTicketsCount: number
}

export default function EventDetailView({ event, user, userTicketsCount }: EventDetailViewProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return {
      full: date.toLocaleDateString('es-ES', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
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

  const getOrganizerName = () => {
    if (event.organizer.firstName || event.organizer.lastName) {
      return `${event.organizer.firstName || ''} ${event.organizer.lastName || ''}`.trim()
    }
    return event.organizer.email.split('@')[0]
  }

  const getAvailability = () => {
    const available = event.capacity - event._count.tickets
    const percentage = Math.round((event._count.tickets / event.capacity) * 100)
    
    if (available === 0) {
      return { 
        status: 'sold-out', 
        text: 'Agotado', 
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
        available: 0
      }
    } else if (percentage >= 90) {
      return { 
        status: 'almost-sold', 
        text: 'Últimas entradas', 
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
        available
      }
    } else if (percentage >= 70) {
      return { 
        status: 'filling-up', 
        text: 'Llenándose rápido', 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
        available
      }
    } else {
      return { 
        status: 'available', 
        text: 'Disponible', 
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
        available
      }
    }
  }

  const isOwner = user && event.organizer.id === user.id
  const isAdmin = user && user.role === 'ADMIN'
  const canEdit = isOwner || isAdmin
  const startDate = formatDate(event.startDate)
  const endDate = event.endDate ? formatDate(event.endDate) : null
  const availability = getAvailability()
  const isEventPast = new Date(event.startDate) < new Date()

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.title,
          text: event.description || `Evento: ${event.title}`,
          url: window.location.href
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copiar URL al clipboard
      navigator.clipboard.writeText(window.location.href)
      // Aquí podrías mostrar un toast de confirmación
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header con imagen */}
      <div className="relative h-96 w-full">
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            className="object-cover"
            priority
            onError={(e) => {
              // Si la imagen falla, mostrar el fallback
              e.currentTarget.style.display = 'none'
              const fallback = e.currentTarget.parentElement?.querySelector('.fallback-bg')
              if (fallback) {
                (fallback as HTMLElement).style.display = 'flex'
              }
            }}
          />
        ) : null}
        
        <div 
          className={`w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center fallback-bg ${
            event.imageUrl ? 'hidden' : 'flex'
          }`}
        >
          <Calendar className="h-24 w-24 text-primary/50" />
        </div>
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Contenido sobre la imagen */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-8">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {event.category.name}
                </Badge>
                {!event.isPublished && (
                  <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-100">
                    <EyeOff className="h-3 w-3 mr-1" />
                    Borrador
                  </Badge>
                )}
                <Badge className={availability.color}>
                  {availability.text}
                </Badge>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
                {event.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  <span>{startDate.full}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>{startDate.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  <span>{event.location}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-8">
            {/* Información del evento */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-2xl">Descripción del Evento</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleShare}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Compartir
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsFavorite(!isFavorite)}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current text-red-500' : ''}`} />
                      {isFavorite ? 'Guardado' : 'Guardar'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {event.description ? (
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {event.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">
                    No hay descripción disponible para este evento.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Información del organizador */}
            <Card>
              <CardHeader>
                <CardTitle>Organizador</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  {event.organizer.imageUrl ? (
                    <Image
                      src={event.organizer.imageUrl}
                      alt={getOrganizerName()}
                      width={64}
                      height={64}
                      className="rounded-full object-cover"
                      onError={(e) => {
                        // Si la imagen falla al cargar, ocultar el elemento
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{getOrganizerName()}</h3>
                    <p className="text-muted-foreground">{event.organizer.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estadísticas del evento */}
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas del Evento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Ticket className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{event._count.tickets}</div>
                    <div className="text-sm text-muted-foreground">Tickets vendidos</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{availability.available}</div>
                    <div className="text-sm text-muted-foreground">Disponibles</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <DollarSign className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{event._count.orders}</div>
                    <div className="text-sm text-muted-foreground">Órdenes</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <CheckCircle className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <div className="text-2xl font-bold">{Math.round((event._count.tickets / event.capacity) * 100)}%</div>
                    <div className="text-sm text-muted-foreground">Ocupación</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Acciones del propietario */}
            {canEdit && (
              <Card>
                <CardHeader>
                  <CardTitle>Gestionar Evento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/events/${event.id}/edit`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Evento
                    </Link>
                  </Button>
                  {isOwner && (
                    <Button className="w-full" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      Dashboard del Evento
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Mis tickets (si el usuario tiene tickets) */}
            {user && userTicketsCount > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Mis Tickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <div className="font-semibold">Tienes {userTicketsCount} ticket(s)</div>
                      <div className="text-sm text-muted-foreground">
                        Para este evento
                      </div>
                    </div>
                  </div>
                  <Button asChild className="w-full mt-4" variant="outline">
                    <Link href="/dashboard">
                      Ver mis tickets
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Sección de compra de tickets */}
            {!isEventPast && event.isPublished && (
              <TicketPurchaseSection 
                event={event}
                user={user}
                availability={availability}
                userTicketsCount={userTicketsCount}
              />
            )}

            {/* Detalles del evento */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles del Evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Fecha de inicio</span>
                  <span className="font-medium">{startDate.full}</span>
                </div>
                
                {endDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fecha de fin</span>
                    <span className="font-medium">{endDate.full}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Hora</span>
                  <span className="font-medium">{startDate.time}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Ubicación</span>
                  <span className="font-medium text-right">{event.location}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Precio</span>
                  <span className="font-medium">
                    {event.isFree ? 'Gratis' : formatPrice(event.price)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Capacidad</span>
                  <span className="font-medium">{event.capacity} personas</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Categoría</span>
                  <Badge variant="outline">{event.category.name}</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Alertas importantes */}
            {isEventPast && (
              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Este evento ya finalizó</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {!event.isPublished && !canEdit && (
              <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Este evento no está publicado</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}