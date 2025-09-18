import { requireOrganizer } from '@/lib/auth'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import EventsDashboard from '@/components/events-dashboard'

export default async function EventsDashboardPage() {
  const user = await requireOrganizer()

  const rawEvents = await prisma.event.findMany({
    where: {
      organizerId: user.id
    },
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
    },
    orderBy: {
      createdAt: 'desc' 
    }
  })

  const events = rawEvents.map(event => ({
    ...event,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate?.toISOString() || null,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString()
  }))

  const organizerName = user.firstName || user.email.split('@')[0]

  return (
    <EventsDashboard 
      initialEvents={events} 
      organizerName={organizerName}
    />
  )
}
