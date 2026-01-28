import { CheckoutWizard } from '@/components/checkout/checkout-wizard'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

interface CheckoutPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { id } = await params

  // Fetch event data
  const event = await prisma.event.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      location: true,
      startDate: true,
      imageUrl: true,
      isPublished: true,
    },
  })

  if (!event) {
    notFound()
  }

  // Check if event is available for purchase
  if (!event.isPublished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Evento no disponible
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Este evento no está disponible para la compra de entradas en este momento.
          </p>
        </div>
      </div>
    )
  }

  // Format date
  const eventDate = event.startDate
    ? new Intl.DateTimeFormat('es-CL', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(event.startDate))
    : undefined

  return (
    <CheckoutWizard
      eventId={event.id}
      eventTitle={event.title}
      eventLocation={event.location}
      eventDate={eventDate}
      eventImageUrl={event.imageUrl || undefined}
    />
  )
}
