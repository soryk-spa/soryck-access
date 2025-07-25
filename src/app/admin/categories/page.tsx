import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import CategoriesManagement from '@/components/categories-management'

export default async function AdminCategoriesPage() {
  await requireAdmin()

  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: {
          events: true
        }
      }
    }
  })

  const categoriesWithStringDates = categories.map(category => ({
    ...category,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <CategoriesManagement initialCategories={categoriesWithStringDates} />
    </div>
  )
}