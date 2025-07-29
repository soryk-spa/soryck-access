// src/app/api/events/public/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    // Construir filtros con tipado correcto
    const whereClause: any = {
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

    // Filtro por precio
    if (isFree === 'true') {
      whereClause.isFree = true
    } else if (isFree === 'false') {
      whereClause.isFree = false
    }

    // Manejar filtros de precio de forma más simple
    if (minPrice || maxPrice) {
      whereClause.price = {}
      if (minPrice) {
        whereClause.price.gte = parseFloat(minPrice)
      }
      if (maxPrice) {
        whereClause.price.lte = parseFloat(maxPrice)
      }
    }

    // Manejar filtros de fecha de forma más simple
    if (dateFrom || dateTo) {
      whereClause.startDate = {
        ...whereClause.startDate
      }
      if (dateFrom) {
        whereClause.startDate.gte = new Date(dateFrom)
      }
      if (dateTo) {
        whereClause.startDate.lte = new Date(dateTo)
      }
    }

    // Configurar ordenamiento
    let orderBy: any = { startDate: 'asc' }
    
    switch (sortBy) {
      case 'price':
        orderBy = { price: sortOrder }
        break
      case 'title':
        orderBy = { title: sortOrder }
        break
      case 'capacity':
        orderBy = { capacity: sortOrder }
        break
      case 'createdAt':
        orderBy = { createdAt: sortOrder }
        break
      default:
        orderBy = { startDate: sortOrder }
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
        orderBy,
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