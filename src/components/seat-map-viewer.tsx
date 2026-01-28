'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Section {
  id: string
  name: string
  basePrice?: number
  hasSeats: boolean
  seats?: EventSeat[]
}

interface EventSeat {
  id: string
  row: string
  number: string
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED'
}

interface SelectedSeat {
  id: string
  sectionId?: string
  sectionName?: string
  row?: string
  number?: string
  price?: number
}

interface SeatMapViewerProps {
  sections: Section[]
  onSeatSelect: (seatIds: string[], selectedSeats: SelectedSeat[]) => void
  reservedSeats: string[]
}

export default function SeatMapViewer({ 
  sections, 
  onSeatSelect, 
  reservedSeats 
}: SeatMapViewerProps) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])

  const handleSeatClick = (seat: EventSeat) => {
    if (seat.status === 'SOLD' || reservedSeats.includes(seat.id)) {
      return
    }

    const newSelectedSeats = selectedSeats.includes(seat.id)
      ? selectedSeats.filter(id => id !== seat.id)
      : [...selectedSeats, seat.id]

    setSelectedSeats(newSelectedSeats)

    
    const detailedSeats = newSelectedSeats.map(seatId => {
      const seatSection = sections.find(s => s.seats?.some(seat => seat.id === seatId))
      const seatInfo = seatSection?.seats?.find(s => s.id === seatId)
      
      return {
        id: seatId,
        sectionId: seatSection?.id,
        sectionName: seatSection?.name,
        row: seatInfo?.row,
        number: seatInfo?.number,
        price: seatSection?.basePrice
      }
    })

    onSeatSelect(newSelectedSeats, detailedSeats)
  }

  const getSeatColor = (seat: EventSeat) => {
    if (seat.status === 'SOLD') return 'bg-red-500'
    if (reservedSeats.includes(seat.id)) return 'bg-yellow-500'
    if (selectedSeats.includes(seat.id)) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getSeatStatus = (seat: EventSeat) => {
    if (seat.status === 'SOLD') return 'Vendido'
    if (reservedSeats.includes(seat.id)) return 'Reservado'
    if (selectedSeats.includes(seat.id)) return 'Seleccionado'
    return 'Disponible'
  }

  const groupSeatsByRow = (seats: EventSeat[]) => {
    return seats.reduce((acc, seat) => {
      if (!acc[seat.row]) {
        acc[seat.row] = []
      }
      acc[seat.row].push(seat)
      return acc
    }, {} as Record<string, EventSeat[]>)
  }

  const sectionsWithSeats = sections.filter(s => s.hasSeats && s.seats && s.seats.length > 0)

  if (sectionsWithSeats.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">
            Este evento no tiene asientos asignados
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Asientos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm">Seleccionado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm">Reservado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm">Vendido</span>
            </div>
          </div>

          {selectedSeats.length > 0 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium">
                Asientos seleccionados: {selectedSeats.length}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {}
      {sectionsWithSeats.map(section => {
        const rowGroups = groupSeatsByRow(section.seats || [])
        const sortedRows = Object.keys(rowGroups).sort()

        return (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{section.name}</CardTitle>
                <Badge variant="outline">
                  ${section.basePrice?.toLocaleString()} CLP
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sortedRows.map(row => {
                  const rowSeats = rowGroups[row].sort((a, b) => parseInt(a.number) - parseInt(b.number))
                  
                  return (
                    <div key={row} className="flex items-center gap-2">
                      <div className="w-8 text-center font-medium text-sm">
                        {row}
                      </div>
                      <div className="flex gap-1 flex-wrap">
                        {rowSeats.map(seat => (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatClick(seat)}
                            disabled={seat.status === 'SOLD' || reservedSeats.includes(seat.id)}
                            className={`
                              w-8 h-8 rounded text-xs font-medium text-white
                              transition-all duration-200
                              ${getSeatColor(seat)}
                              ${seat.status === 'SOLD' || reservedSeats.includes(seat.id) 
                                ? 'cursor-not-allowed opacity-60' 
                                : 'cursor-pointer hover:scale-110'
                              }
                            `}
                            title={`Fila ${seat.row}, Asiento ${seat.number} - ${getSeatStatus(seat)}`}
                          >
                            {seat.number}
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}