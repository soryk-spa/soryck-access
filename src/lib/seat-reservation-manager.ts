import { prisma } from '@/lib/prisma'

export interface ReservationSession {
  sessionId: string
  eventId: string
  seatIds: string[]
  expiresAt: Date
}

export class SeatReservationManager {
  private static readonly RESERVATION_TIMEOUT = 5 * 60 * 1000 

  
  static async createReservation(eventId: string, seatIds: string[]): Promise<string> {
    const sessionId = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + this.RESERVATION_TIMEOUT)

    try {
      
      return await prisma.$transaction(async (tx) => {
        
        const existingReservations = await tx.seatReservation.findMany({
          where: {
            seatId: { in: seatIds },
            expiresAt: { gt: new Date() }
          }
        })

        if (existingReservations.length > 0) {
          const reservedSeatIds = existingReservations.map(r => r.seatId)
          throw new Error(`Los asientos ${reservedSeatIds.join(', ')} ya están reservados`)
        }

        
        const soldSeats = await tx.eventSeat.findMany({
          where: {
            id: { in: seatIds },
            status: 'SOLD'
          }
        })

        if (soldSeats.length > 0) {
          const soldSeatIds = soldSeats.map((s: { id: string }) => s.id)
          throw new Error(`Los asientos ${soldSeatIds.join(', ')} ya están vendidos`)
        }

        
        await tx.seatReservation.createMany({
          data: seatIds.map(seatId => ({
            sessionId,
            eventId,
            seatId,
            expiresAt
          }))
        })

        return sessionId
      })
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error al crear la reserva')
    }
  }

  
  static async releaseReservation(sessionId: string): Promise<void> {
    await prisma.seatReservation.deleteMany({
      where: { sessionId }
    })
  }

  
  static async areSeatsAvailable(seatIds: string[]): Promise<boolean> {
    const reservations = await prisma.seatReservation.findMany({
      where: {
        seatId: { in: seatIds },
        expiresAt: { gt: new Date() }
      }
    })

    return reservations.length === 0
  }

  
  static async getSessionReservations(sessionId: string): Promise<ReservationSession | null> {
    const reservations = await prisma.seatReservation.findMany({
      where: {
        sessionId,
        expiresAt: { gt: new Date() }
      }
    })

    if (reservations.length === 0) return null

    return {
      sessionId,
      eventId: reservations[0].eventId,
      seatIds: reservations.map(r => r.seatId),
      expiresAt: reservations[0].expiresAt
    }
  }

  
  static async cleanupExpiredReservations(): Promise<void> {
    await prisma.seatReservation.deleteMany({
      where: {
        expiresAt: { lt: new Date() }
      }
    })
  }

  
  static async getReservedSeats(eventId: string): Promise<string[]> {
    const reservations = await prisma.seatReservation.findMany({
      where: {
        eventId,
        expiresAt: { gt: new Date() }
      },
      select: { seatId: true }
    })

    return reservations.map(r => r.seatId)
  }
}