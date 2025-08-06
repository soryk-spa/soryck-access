import { notFound, redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { canAccessEvent } from '@/lib/auth'
import EditEventForm from '@/components/edit-event-form'
import type { Metadata } from 'next'

interface EditEventPageProps {
  params: Promise<{ id: string }>
}

async function getEventForEdit(id: string) {
  try {
    const { canAccess, user } = await canAccessEvent(id)
    
    if (!canAccess) {
      redirect('/unauthorized?required=organizer')
    }

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
            email: true
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

    return { event, user }
  } catch (error) {
    console.error('Error fetching event for edit:', error)
    return null
  }
}

async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true
      },
      orderBy: {
        name: 'asc'
      }
    })
    return categories
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

export async function generateMetadata({ params }: EditEventPageProps): Promise<Metadata> {
  const { id } = await params
  const result = await getEventForEdit(id)

  if (!result) {
    return {
      title: 'Evento no encontrado | SorykPass'
    }
  }

  const { event } = result
  const title = `Editar: ${event.title} | SorykPass`
  
  return {
    title,
    description: `Edita los detalles del evento: ${event.title}`,
    robots: {
      index: false,
      follow: false,
    }
  }
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params
  const result = await getEventForEdit(id)

  if (!result) {
    notFound()
  }

  const { event, user } = result
  const categories = await getCategories()

  const serializedEvent = {
    ...event,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate?.toISOString() || null,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <EditEventForm 
        event={serializedEvent}
        categories={categories}
        user={user}
      />
    </div>
  )
}