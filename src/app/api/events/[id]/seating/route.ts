import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'
import { SeatStatus } from '@prisma/client'

interface SeatData {
  id: string
  row: string
  number: string
  x: number
  y: number
  price?: number
  status?: string
  isAccessible?: boolean
}

interface SectionData {
  id: string
  name: string
  color: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  basePrice?: number
  seats?: SeatData[]
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await context.params

    // Get event with sections and seats
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        sections: {
          include: {
            seats: {
              include: {
                reservations: {
                  where: {
                    expiresAt: {
                      gt: new Date()
                    }
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      )
    }

    // Transform data and update seat statuses based on reservations
    const sections = event.sections.map(section => ({
      id: section.id,
      name: section.name,
      color: section.color,
      x: section.x,
      y: section.y,
      width: section.width,
      height: section.height,
      rotation: section.rotation,
      basePrice: section.basePrice,
      seats: section.seats.map(seat => ({
        id: seat.id,
        row: seat.row,
        number: seat.number,
        x: seat.x,
        y: seat.y,
        price: seat.price,
        status: seat.reservations.length > 0 ? 'RESERVED' : seat.status,
        isAccessible: seat.isAccessible
      }))
    }))

    return NextResponse.json({
      eventId,
      hasSeatingPlan: event.hasSeatingPlan,
      sections
    })
  } catch (error) {
    console.error('Error fetching seating plan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: eventId } = await context.params
    const { sections }: { sections: SectionData[] } = await request.json()

    // Verify user owns the event
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        organizer: { clerkId: userId }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found or unauthorized' },
        { status: 404 }
      )
    }

    // Save seating plan in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete existing sections and seats
      await tx.section.deleteMany({
        where: { eventId }
      })

      // Create new sections and seats
      for (const section of sections) {
        const createdSection = await tx.section.create({
          data: {
            id: section.id,
            name: section.name,
            color: section.color,
            x: section.x,
            y: section.y,
            width: section.width,
            height: section.height,
            rotation: section.rotation,
            basePrice: section.basePrice,
            eventId
          }
        })

        if (section.seats && section.seats.length > 0) {
          await tx.eventSeat.createMany({
            data: section.seats.map((seat: SeatData) => ({
              id: seat.id,
              row: seat.row,
              number: seat.number,
              x: seat.x,
              y: seat.y,
              price: seat.price,
              status: (seat.status as SeatStatus) || SeatStatus.AVAILABLE,
              isAccessible: seat.isAccessible || false,
              sectionId: createdSection.id
            }))
          })
        }
      }

      // Update event to mark it has seating plan
      await tx.event.update({
        where: { id: eventId },
        data: { hasSeatingPlan: true }
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Seating plan saved successfully'
    })
  } catch (error) {
    console.error('Error saving seating plan:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
