import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock,
  User
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

interface EventCardProps {
  event: Event
}

export default function EventCard({ event }: EventCardProps) {
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
      return { status: 'sold-out', text: 'Agotado', color: 'bg-red-100 text-red-800' }
    } else if (percentage >= 90) {
      return { status: 'almost-sold', text: 'Últimas entradas', color: 'bg-orange-100 text-orange-800' }
    } else if (percentage >= 70) {
      return { status: 'filling-up', text: 'Llenándose', color: 'bg-yellow-100 text-yellow-800' }
    } else {
      return { status: 'available', text: 'Disponible', color: 'bg-green-100 text-green-800' }
    }
  }

  const startDate = formatDate(event.startDate)
  const availability = getAvailability()
  const isMultiDay = event.endDate && 
    new Date(event.startDate).toDateString() !== new Date(event.endDate).toDateString()

  return (
    <Card className="hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <div className="relative">

          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              sizes="(max-width: 768px) 100vw, 400px"
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Calendar className="h-16 w-16 text-muted-foreground/50" />
            </div>
          )}
          
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur rounded-lg p-3 shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{startDate.day}</div>
              <div className="text-xs text-muted-foreground uppercase">{startDate.month}</div>
              <div className="text-xs text-muted-foreground">{startDate.weekday}</div>
            </div>
          </div>

          <div className="absolute top-4 right-4">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur">
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
            <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            <div className="text-right ml-4 flex-shrink-0">
              {event.isFree ? (
                <span className="text-lg font-bold text-green-600">Gratis</span>
              ) : (
                <span className="text-lg font-bold text-primary">
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
              <span>
                {startDate.time}
                {isMultiDay && (
                  <span className="ml-1">
                    - {formatDate(event.endDate!).day} {formatDate(event.endDate!).month}
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{event.location}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Por {getOrganizerName()}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {event._count.tickets}/{event.capacity} asistentes
                {event.capacity - event._count.tickets > 0 && (
                  <span className="text-green-600 ml-1">
                    ({event.capacity - event._count.tickets} disponibles)
                  </span>
                )}
              </span>
            </div>
          </div>

          <Button 
            asChild 
            className="w-full"
            disabled={availability.status === 'sold-out'}
          >
            <Link href={`/events/${event.id}`}>
              {availability.status === 'sold-out' ? 'Agotado' : 'Ver Evento'}
            </Link>
          </Button>
      </CardContent>
    </Card>
  )
}