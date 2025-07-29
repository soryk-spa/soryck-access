import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parámetros de filtro
    const search = searchParams.get('search') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const location = searchParams.get('location') || ''
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const isFree = searchParams.get('isFree')
    const sortBy = searchParams.get('sortBy') || 'startDate'
    const sortOrder = searchParams.get('sortOrder') || 'asc'
    
    // Paginación
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const skip = (page - 1) * limit

    // Construir filtros con tipado correcto de Prisma
    const whereClause: Prisma.EventWhereInput = {
      isPublished: true,
      startDate: {
        gte: new Date() // Solo eventos futuros
      }
    }

    // Filtro de búsqueda por título y descripción
    if (search) {
      whereClause.OR = [
        {
          title: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          description: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ]
    }

    // Filtro por categoría
    if (categoryId) {
      whereClause.categoryId = categoryId
    }

    // Filtro por ubicación
    if (location) {
      whereClause.location = {
        contains: location,
        mode: 'insensitive'
      }
    }

    // Filtro por evento gratuito/pagado
    if (isFree === 'true') {
      whereClause.isFree = true
    } else if (isFree === 'false') {
      whereClause.isFree = false
    }

    // Filtros de precio - construir el objeto de filtro de precio de forma segura
    const priceFilter: Prisma.FloatFilter = {}
    if (minPrice) {
      priceFilter.gte = parseFloat(minPrice)
    }
    if (maxPrice) {
      priceFilter.lte = parseFloat(maxPrice)
    }
    
    // Solo aplicar filtro de precio si hay al menos un valor
    if (minPrice || maxPrice) {
      whereClause.price = priceFilter
    }

    // Filtros de fecha - construir el objeto de filtro de fecha de forma segura
    const dateFilter: Prisma.DateTimeFilter = {
      gte: new Date() // Mantener el filtro de eventos futuros
    }
    
    if (dateFrom) {
      dateFilter.gte = new Date(dateFrom)
    }
    if (dateTo) {
      dateFilter.lte = new Date(dateTo)
    }
    
    whereClause.startDate = dateFilter

    // Configurar ordenamiento con tipos correctos
    const getOrderBy = (): Prisma.EventOrderByWithRelationInput => {
      const order = sortOrder as 'asc' | 'desc'
      
      switch (sortBy) {
        case 'price':
          return { price: order }
        case 'title':
          return { title: order }
        case 'capacity':
          return { capacity: order }
        case 'createdAt':
          return { createdAt: order }
        default:
          return { startDate: order }
      }
    }

    // Ejecutar consulta con paginación
    const [events, totalCount] = await Promise.all([
      prisma.event.findMany({
        where: whereClause,
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
        orderBy: getOrderBy(),
        skip,
        take: limit
      }),
      prisma.event.count({
        where: whereClause
      })
    ])

    // Calcular información de paginación
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    // Convertir fechas a strings para serialización
    const serializedEvents = events.map(event => ({
      ...event,
      startDate: event.startDate.toISOString(),
      endDate: event.endDate?.toISOString() || null,
      createdAt: event.createdAt.toISOString(),
      updatedAt: event.updatedAt.toISOString()
    }))

    return NextResponse.json({
      events: serializedEvents,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage,
        hasPrevPage,
        limit
      },
      filters: {
        search,
        categoryId,
        location,
        minPrice,
        maxPrice,
        dateFrom,
        dateTo,
        isFree,
        sortBy,
        sortOrder
      }
    })

  } catch (error) {
    console.error('Error fetching public events:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}