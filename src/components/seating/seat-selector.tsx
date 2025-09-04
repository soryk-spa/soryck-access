'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  Accessibility,
  Check,
  X,
  ShoppingCart
} from 'lucide-react'

interface Section {
  id: string
  name: string
  color: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  basePrice?: number
  seats: Seat[]
}

interface Seat {
  id: string
  row: string
  number: string
  x: number
  y: number
  price?: number
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD' | 'BLOCKED' | 'MAINTENANCE'
  isAccessible: boolean
}

interface SelectedSeat extends Seat {
  sectionName: string
  finalPrice: number
}

interface SeatSelectorProps {
  eventId: string
  sections: Section[]
  maxSeats?: number
  onSelectionChange: (seats: SelectedSeat[]) => void
  onProceedToCheckout: (seats: SelectedSeat[]) => void
}

export function SeatSelector({ 
  eventId, 
  sections, 
  maxSeats = 8,
  onSelectionChange,
  onProceedToCheckout 
}: SeatSelectorProps) {
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeat[]>([])
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + seat.finalPrice, 0)

  
  const handleSeatClick = useCallback((seat: Seat, section: Section) => {
    if (seat.status !== 'AVAILABLE') return

    const seatId = seat.id
    const isSelected = selectedSeats.some(s => s.id === seatId)

    if (isSelected) {
      
      setSelectedSeats(prev => prev.filter(s => s.id !== seatId))
    } else {
      
      if (selectedSeats.length >= maxSeats) {
        alert(`Máximo ${maxSeats} asientos permitidos`)
        return
      }

      const selectedSeat: SelectedSeat = {
        ...seat,
        sectionName: section.name,
        finalPrice: seat.price || section.basePrice || 0
      }

      setSelectedSeats(prev => [...prev, selectedSeat])
    }
  }, [selectedSeats, maxSeats])

  
  useEffect(() => {
    onSelectionChange(selectedSeats)
  }, [selectedSeats, onSelectionChange])

  
  const getSeatProps = (seat: Seat) => {
    const isSelected = selectedSeats.some(s => s.id === seat.id)
    const isHovered = hoveredSeat === seat.id

    let backgroundColor = '#E5E7EB' 
    let borderColor = '#9CA3AF'
    let cursor = 'not-allowed'

    switch (seat.status) {
      case 'AVAILABLE':
        backgroundColor = isSelected ? '#3B82F6' : isHovered ? '#93C5FD' : '#10B981'
        borderColor = isSelected ? '#1D4ED8' : '#059669'
        cursor = 'pointer'
        break
      case 'RESERVED':
        backgroundColor = '#F59E0B'
        borderColor = '#D97706'
        break
      case 'SOLD':
        backgroundColor = '#EF4444'
        borderColor = '#DC2626'
        break
      case 'BLOCKED':
      case 'MAINTENANCE':
        backgroundColor = '#6B7280'
        borderColor = '#4B5563'
        break
    }

    return {
      backgroundColor,
      borderColor,
      cursor,
      transform: isSelected || isHovered ? 'scale(1.1)' : 'scale(1)',
      transition: 'all 0.2s ease'
    }
  }

  const renderSeat = (seat: Seat, section: Section) => {
    const props = getSeatProps(seat)
    
    return (
      <div
        key={seat.id}
        className="absolute flex items-center justify-center text-xs font-medium border-2 rounded"
        style={{
          left: `${((section.x + seat.x) * scale + offset.x)}px`,
          top: `${((section.y + seat.y) * scale + offset.y)}px`,
          width: `${20 * scale}px`,
          height: `${20 * scale}px`,
          ...props
        }}
        onClick={() => handleSeatClick(seat, section)}
        onMouseEnter={() => setHoveredSeat(seat.id)}
        onMouseLeave={() => setHoveredSeat(null)}
        title={`${section.name} - Fila ${seat.row}, Asiento ${seat.number}${seat.isAccessible ? ' (Accesible)' : ''}`}
      >
        {seat.isAccessible ? (
          <Accessibility className="w-3 h-3 text-white" />
        ) : (
          <span className="text-white">{seat.number}</span>
        )}
      </div>
    )
  }

  const renderSection = (section: Section) => {
    return (
      <div key={section.id}>
        {}
        <div
          className="absolute border-2 border-dashed rounded opacity-30"
          style={{
            left: `${(section.x * scale + offset.x)}px`,
            top: `${(section.y * scale + offset.y)}px`,
            width: `${section.width * scale}px`,
            height: `${section.height * scale}px`,
            borderColor: section.color,
            backgroundColor: section.color + '10'
          }}
        />
        
        {}
        <div
          className="absolute font-semibold text-sm text-gray-700"
          style={{
            left: `${(section.x * scale + offset.x)}px`,
            top: `${(section.y * scale + offset.y - 25)}px`,
            color: section.color
          }}
        >
          {section.name}
          {section.basePrice && (
            <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
              ${section.basePrice.toLocaleString()}
            </span>
          )}
        </div>

        {}
        {section.seats.map(seat => renderSeat(seat, section))}
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      {}
      <div className="flex-1 relative bg-gray-50 overflow-hidden">
        <div className="absolute inset-0">
          {sections.map(renderSection)}
        </div>

        {}
        <div className="absolute top-4 left-4 bg-white p-2 rounded shadow-md">
          <div className="flex gap-2 mb-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setScale(prev => Math.min(prev * 1.2, 3))}
            >
              +
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setScale(prev => Math.max(prev / 1.2, 0.3))}
            >
              -
            </Button>
          </div>
          <div className="text-xs text-gray-600">
            Zoom: {Math.round(scale * 100)}%
          </div>
        </div>

        {}
        <div className="absolute top-4 right-4 bg-white p-4 rounded shadow-md">
          <h3 className="font-semibold mb-3">Leyenda</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded border"></div>
              <span>Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded border"></div>
              <span>Seleccionado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded border"></div>
              <span>Reservado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded border"></div>
              <span>Vendido</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-500 rounded border"></div>
              <span>No disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <Accessibility className="w-4 h-4" />
              <span>Accesible</span>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="w-96 bg-white border-l border-gray-200 p-6 overflow-y-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Asientos Seleccionados
              <Badge variant="secondary">{selectedSeats.length}/{maxSeats}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedSeats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Selecciona tus asientos en el mapa</p>
                <p className="text-sm mt-1">Máximo {maxSeats} asientos</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedSeats.map((seat, index) => (
                  <div
                    key={seat.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded text-sm font-medium">
                        {seat.isAccessible ? (
                          <Accessibility className="w-4 h-4" />
                        ) : (
                          seat.number
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {seat.sectionName} - Fila {seat.row}
                        </div>
                        <div className="text-sm text-gray-600">
                          Asiento {seat.number}
                          {seat.isAccessible && (
                            <span className="ml-1 text-blue-600">(Accesible)</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        ${seat.finalPrice.toLocaleString()}
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSeatClick(seat, { name: seat.sectionName } as Section)}
                        className="mt-1 p-1 h-6 w-6"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total:</span>
                    <span>${totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  className="w-full mt-4"
                  size="lg"
                  onClick={() => onProceedToCheckout(selectedSeats)}
                  disabled={selectedSeats.length === 0}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Continuar con la Compra
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Consejos</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600 space-y-2">
            <p>• Haz clic en los asientos verdes para seleccionarlos</p>
            <p>• Puedes seleccionar hasta {maxSeats} asientos</p>
            <p>• Los asientos marcados con ♿ son accesibles</p>
            <p>• Usa los controles de zoom para mejor visualización</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
