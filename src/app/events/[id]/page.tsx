import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import EventDetailView from '@/components/event-detail-view'
import type { Metadata } from 'next'

interface EventPageProps {
  params: Promise<{ id: string }>
}

async function getEvent(id: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        },
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            imageUrl: true
          }
        },
        _count: {
          select: {
            tickets: true,
            orders: true
          }
        }
      }
    })

    if (!event) {
      return null
    }

    // Verificar si el evento es público o si el usuario tiene permisos
    const user = await getCurrentUser()
    const isPublic = event.isPublished
    const isOwner = user && event.organizerId === user.id
    const isAdmin = user && user.role === 'ADMIN'

    if (!isPublic && !isOwner && !isAdmin) {
      return null
    }

    return event
  } catch (error) {
    console.error('Error fetching event:', error)
    return null
  }
}

// Función para generar metadata dinámico
export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { id } = await params
  const event = await getEvent(id)

  if (!event) {
    return {
      title: 'Evento no encontrado | Soryck Access'
    }
  }

  const title = `${event.title} | Soryck Access`
  const description = event.description || `Evento organizado por ${event.organizer.firstName || event.organizer.email}`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: event.imageUrl ? [event.imageUrl] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: event.imageUrl ? [event.imageUrl] : [],
    }
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params
  const event = await getEvent(id)
  const user = await getCurrentUser()

  if (!event) {
    notFound()
  }

  // Serializar fechas para el cliente
  const serializedEvent = {
    ...event,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate?.toISOString() || null,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString()
  }

  // Verificar si el usuario ya tiene tickets para este evento
  let userTicketsCount = 0
  if (user) {
    userTicketsCount = await prisma.ticket.count({
      where: {
        eventId: event.id,
        userId: user.id,
        status: 'ACTIVE'
      }
    })
  }

  return (
    <EventDetailView 
      event={serializedEvent}
      user={user}
      userTicketsCount={userTicketsCount}
    />
  )
}