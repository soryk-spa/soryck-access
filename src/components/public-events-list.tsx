'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import EventsFilters from './events-filters'
import EventCard from './event-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Loader2, 
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle
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

interface Category {
  id: string
  name: string
}

interface Pagination {
  currentPage: number
  totalPages: number
  totalCount: number
  hasNextPage: boolean
  hasPrevPage: boolean
  limit: number
}

interface EventFilters {
  search: string
  categoryId: string
  location: string
  minPrice: string
  maxPrice: string
  dateFrom: string
  dateTo: string
  isFree: string
  sortBy: string
  sortOrder: string
}

interface PublicEventsListProps {
  initialEvents: Event[]
  initialPagination: Pagination
  categories: Category[]
  initialFilters: EventFilters
}

export default function PublicEventsList({ 
  initialEvents, 
  initialPagination, 
  categories, 
  initialFilters 
}: PublicEventsListProps) {
  const router = useRouter()
  // Removemos searchParams ya que no lo usamos
  
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [pagination, setPagination] = useState<Pagination>(initialPagination)
  const [filters, setFilters] = useState<EventFilters>(initialFilters)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Función para construir URL con parámetros (memoizada)
  const buildQueryString = useCallback((newFilters: EventFilters, page: number = 1) => {
    const params = new URLSearchParams()
    
    if (newFilters.search) params.set('search', newFilters.search)
    if (newFilters.categoryId) params.set('categoryId', newFilters.categoryId)
    if (newFilters.location) params.set('location', newFilters.location)
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice)
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice)
    if (newFilters.dateFrom) params.set('dateFrom', newFilters.dateFrom)
    if (newFilters.dateTo) params.set('dateTo', newFilters.dateTo)
    if (newFilters.isFree && newFilters.isFree !== 'all') params.set('isFree', newFilters.isFree)
    if (newFilters.sortBy !== 'startDate') params.set('sortBy', newFilters.sortBy)
    if (newFilters.sortOrder !== 'asc') params.set('sortOrder', newFilters.sortOrder)
    if (page > 1) params.set('page', page.toString())
    
    return params.toString()
  }, [])

  // Función para hacer fetch de eventos (memoizada)
  const fetchEvents = useCallback(async (newFilters: EventFilters, page: number = 1) => {
    setLoading(true)
    setError(null)
    
    try {
      const queryString = buildQueryString(newFilters, page)
      const response = await fetch(`/api/events/public?${queryString}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar eventos')
      }
      
      const data = await response.json()
      setEvents(data.events)
      setPagination(data.pagination)
      
      // Actualizar URL sin recargar la página
      const newUrl = queryString ? `/events?${queryString}` : '/events'
      router.push(newUrl, { scroll: false })
      
    } catch (err) {
      console.error('Error fetching events:', err)
      setError('Error al cargar los eventos. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }, [router, buildQueryString])

  // Debounce para la búsqueda
  useEffect(() => {
    // Solo hacer fetch si la búsqueda cambió comparado con el valor inicial
    if (filters.search !== initialFilters.search) {
      const timeoutId = setTimeout(() => {
        fetchEvents(filters, 1)
      }, 500) // 500ms de delay

      return () => clearTimeout(timeoutId)
    }
  }, [filters.search, initialFilters.search, fetchEvents, filters])

  // Handler para cambios en filtros (excepto búsqueda)
  const handleFiltersChange = (newFilters: EventFilters) => {
    setFilters(newFilters)
    
    // Si no es solo cambio de búsqueda, fetch inmediatamente
    if (newFilters.search === filters.search) {
      fetchEvents(newFilters, 1)
    }
  }

  // Handler para limpiar filtros (memoizado)
  const handleClearFilters = useCallback(() => {
    const clearedFilters: EventFilters = {
      search: '',
      categoryId: '',
      location: '',
      minPrice: '',
      maxPrice: '',
      dateFrom: '',
      dateTo: '',
      isFree: 'all',
      sortBy: 'startDate',
      sortOrder: 'asc'
    }
    setFilters(clearedFilters)
    fetchEvents(clearedFilters, 1)
  }, [fetchEvents])

  // Handler para paginación (memoizado)
  const handlePageChange = useCallback((page: number) => {
    fetchEvents(filters, page)
    // Scroll suave al inicio de la lista
    document.getElementById('events-list')?.scrollIntoView({ 
      behavior: 'smooth',
      block: 'start'
    })
  }, [fetchEvents, filters])

  return (
    <div className="space-y-6" id="events-list">
      {/* Filtros */}
      <EventsFilters
        categories={categories}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        totalResults={pagination.totalCount}
      />

      {/* Estado de error */}
      {error && (
        <Card className="border-destructive/20 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estado de carga */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Cargando eventos...</p>
          </div>
        </div>
      )}

      {/* Lista de eventos */}
      {!loading && !error && (
        <>
          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron eventos</h3>
                <p className="text-muted-foreground mb-6">
                  Intenta ajustar los filtros o buscar con otros términos
                </p>
                <Button onClick={handleClearFilters} variant="outline">
                  Limpiar filtros
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Paginación */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {((pagination.currentPage - 1) * pagination.limit) + 1} a{' '}
                {Math.min(pagination.currentPage * pagination.limit, pagination.totalCount)} de{' '}
                {pagination.totalCount} eventos
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage || loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Anterior
                </Button>

                {/* Números de página */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    let pageNumber
                    if (pagination.totalPages <= 5) {
                      pageNumber = i + 1
                    } else if (pagination.currentPage <= 3) {
                      pageNumber = i + 1
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNumber = pagination.totalPages - 4 + i
                    } else {
                      pageNumber = pagination.currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNumber}
                        variant={pageNumber === pagination.currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNumber)}
                        disabled={loading}
                        className="w-10"
                      >
                        {pageNumber}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage || loading}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}