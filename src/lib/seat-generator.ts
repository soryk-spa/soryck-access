import { prisma } from '@/lib/prisma'

export interface SeatConfiguration {
  seatId: string
  row: string
  number: number
  position: { x: number; y: number }
}

export function generateSeatLayout(
  sectionId: string,
  rowCount: number,
  seatsPerRow: number
): SeatConfiguration[] {
  const seats: SeatConfiguration[] = []
  
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    const rowLetter = generateRowLabel(rowIndex)
    
    for (let seatIndex = 1; seatIndex <= seatsPerRow; seatIndex++) {
      seats.push({
        seatId: `${sectionId}-${rowLetter}-${seatIndex}`,
        row: rowLetter,
        number: seatIndex,
        position: {
          x: seatIndex,
          y: rowIndex + 1
        }
      })
    }
  }
  
  return seats
}

export function generateRowLabel(rowIndex: number): string {
  if (rowIndex < 26) {
    return String.fromCharCode(65 + rowIndex) 
  } else {
    const firstLetter = Math.floor(rowIndex / 26) - 1
    const secondLetter = rowIndex % 26
    return String.fromCharCode(65 + firstLetter) + String.fromCharCode(65 + secondLetter)
  }
}

export async function createSeatsForSection(
  sectionId: string,
  rowCount: number,
  seatsPerRow: number
) {
  const seatLayout = generateSeatLayout(sectionId, rowCount, seatsPerRow)
  
  const seatData = seatLayout.map(seat => ({
    id: seat.seatId,
    sectionId,
    row: seat.row,
    number: seat.number.toString(),
    status: 'AVAILABLE' as const
  }))

  await prisma.eventSeat.createMany({
    data: seatData,
    skipDuplicates: true
  })

  return seatData
}