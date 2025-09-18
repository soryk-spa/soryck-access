import { requireAdmin } from '@/lib/auth'

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'
import { prisma } from '@/lib/prisma'
import CategoriesManagement from '@/components/categories-management-modern'

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

  return <CategoriesManagement initialCategories={categoriesWithStringDates} />
}
