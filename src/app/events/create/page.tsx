import { requireOrganizer } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CreateEventForm from '@/components/create-event-form'

export default async function CreateEventPage() {
  await requireOrganizer()

  const categories = await prisma.category.findMany({
    select: {
      id: true,
      name: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <CreateEventForm categories={categories} />
    </div>
  )
}