import { Suspense } from 'react'
import { prisma } from '@/lib/prisma'
import PublicEventsList from '@/components/public-events-list'
import type { Metadata } from 'next'

interface EventsPageProps {
  searchParams: Promise<{
    search?: string
    categoryId?: string
    location?: string
    minPrice?: string
    maxPrice?: string
    dateFrom?: string
    dateTo?: string
    isFree?: string
    sortBy?: string
    sortOrder?: string
    page?: string
  }>
}

interface PublicEventFilters {
  search?: string
  categoryId?: string
  location?: string
  minPrice?: string
  maxPrice?: string
  dateFrom?: string
  dateTo?: string
  isFree?: string
  sortBy?: string
  sortOrder?: string
  page?: string
}

async function getPublicEvents(filters: PublicEventFilters) {
  const {
    search = '',
    categoryId = '',
    location = '',
    minPrice,
    maxPrice,
    dateFrom,
    dateTo,
    isFree,
    sortBy = 'startDate',
    sortOrder = 'asc',
    page = '1'
  } = filters

  const currentPage = parseInt(page) || 1
  const limit = 12
  const skip = (currentPage - 1) * limit

  const whereClause: import('@prisma/client').Prisma.EventWhereInput = {
    isPublished: true,
    startDate: {
      gte: new Date()
    }
  }

  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ]
  }

  if (categoryId) {
    whereClause.categoryId = categoryId
  }

  if (location) {
    whereClause.location = { contains: location, mode: 'insensitive' }
  }

  if (isFree === 'true') {
    whereClause.isFree = true
  } else if (isFree === 'false') {
    whereClause.isFree = false
  }

  if (minPrice) {
    if (typeof whereClause.price !== 'object' || whereClause.price === null) {
      whereClause.price = {}
    }
    (whereClause.price as import('@prisma/client').Prisma.FloatFilter).gte = parseFloat(minPrice)
  }

  if (maxPrice) {
    if (typeof whereClause.price !== 'object' || whereClause.price === null) whereClause.price = {};
    (whereClause.price as import('@prisma/client').Prisma.FloatFilter).lte = parseFloat(maxPrice)
  }

  if (dateFrom) {
    whereClause.startDate = {
      ...(typeof whereClause.startDate === 'object' && whereClause.startDate !== null ? whereClause.startDate : {}),
      gte: new Date(dateFrom)
    }
  }

  if (dateTo) {
    whereClause.startDate = {
      ...(typeof whereClause.startDate === 'object' && whereClause.startDate !== null ? whereClause.startDate : {}),
      lte: new Date(dateTo)
    }
  }

  const getOrderBy = () => {
    const order = sortOrder as 'asc' | 'desc'
    switch (sortBy) {
      case 'price': return { price: order }
      case 'title': return { title: order }
      case 'capacity': return { capacity: order }
      case 'createdAt': return { createdAt: order }
      default: return { startDate: order }
    }
  }

  // Ejecutar consultas
  const [events, totalCount] = await Promise.all([
    prisma.event.findMany({
      where: whereClause,
      include: {
        category: {
          select: { id: true, name: true }
        },
        organizer: {
          select: { id: true, firstName: true, lastName: true, email: true }
        },
        _count: {
          select: { tickets: true, orders: true }
        }
      },
      orderBy: getOrderBy(),
      skip,
      take: limit
    }),
    prisma.event.count({ where: whereClause })
  ])

  // Calcular paginación
  const totalPages = Math.ceil(totalCount / limit)
  const pagination = {
    currentPage,
    totalPages,
    totalCount,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    limit
  }

  // Serializar fechas
  const serializedEvents = events.map(event => ({
    ...event,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate?.toISOString() || null,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString()
  }))

  return { events: serializedEvents, pagination }
}

// Función para obtener categorías
async function getCategories() {
  return await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })
}

// Componente de loading
function EventsPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="text-center">
          <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
        </div>
        
        {/* Filters skeleton */}
        <div className="h-32 bg-muted rounded"></div>
        
        {/* Events grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-96 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Componente principal de la página
async function EventsPageContent({ searchParams }: EventsPageProps) {
  const params = await searchParams
  
  // Obtener datos del servidor
  const [{ events, pagination }, categories] = await Promise.all([
    getPublicEvents(params),
    getCategories()
  ])

  // Preparar filtros iniciales
  const initialFilters = {
    search: params.search || '',
    categoryId: params.categoryId || '',
    location: params.location || '',
    minPrice: params.minPrice || '',
    maxPrice: params.maxPrice || '',
    dateFrom: params.dateFrom || '',
    dateTo: params.dateTo || '',
    isFree: params.isFree || 'all',
    sortBy: params.sortBy || 'startDate',
    sortOrder: params.sortOrder || 'asc'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header de la página */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Descubre Eventos Increíbles
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Encuentra los mejores eventos cerca de ti. Conciertos, conferencias, deportes y mucho más.
        </p>
      </div>

      {/* Lista de eventos con filtros */}
      <PublicEventsList
        initialEvents={events}
        initialPagination={pagination}
        categories={categories}
        initialFilters={initialFilters}
      />
    </div>
  )
}

// Página principal exportada
export default function EventsPage(props: EventsPageProps) {
  return (
    <Suspense fallback={<EventsPageSkeleton />}>
      <EventsPageContent {...props} />
    </Suspense>
  )
}

// Función para generar metadata dinámico
export async function generateMetadata({ searchParams }: EventsPageProps): Promise<Metadata> {
  const params = await searchParams
  const search = params.search
  const categoryId = params.categoryId
  
  let title = 'Eventos | Soryck Access'
  let description = 'Descubre eventos increíbles cerca de ti. Conciertos, conferencias, deportes y más en Soryck Access.'
  const keywords = 'eventos, tickets, conciertos, conferencias, deportes, cultura, chile'

  if (search) {
    title = `Eventos: ${search} | Soryck Access`
    description = `Encuentra eventos relacionados con ${search} en Soryck Access`
  }

  if (categoryId) {
    try {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { name: true }
      })
      if (category) {
        title = `Eventos de ${category.name} | Soryck Access`
        description = `Descubre los mejores eventos de ${category.name} en Soryck Access`
      }
    } catch (error) {
      // Si hay error, usar metadata por defecto
      console.error('Error fetching category for metadata:', error)
    }
  }

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    }
  }
}