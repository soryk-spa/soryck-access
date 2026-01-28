'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { SeatSelector } from '@/components/seating/seat-selector'
import { useCheckout } from '../checkout-context'
import { useSeating } from '@/hooks/useSeating'
import { AlertCircle, Check, Armchair } from 'lucide-react'
import { SelectedSeat } from '@/types/checkout'

interface Step1SeatSelectionProps {
  eventId: string
}

export function Step1SeatSelection({ eventId }: Step1SeatSelectionProps) {
  const {
    updateSeats,
    setSessionId,
    setReservationExpiry,
    getTotalSeats,
    checkoutData,
  } = useCheckout()

  const {
    sections,
    loading: seatingLoading,
    error: seatingError,
  } = useSeating(eventId)

  // Convertir los asientos del SeatSelector al formato de nuestro checkout
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSelectionChange = (seats: any[]) => {
    const checkoutSeats: SelectedSeat[] = seats.map((seat) => ({
      id: seat.id,
      sectionId: seat.sectionId,
      sectionName: seat.sectionName,
      row: seat.row,
      number: seat.number,
      finalPrice: seat.finalPrice,
      isAccessible: seat.isAccessible || false,
    }))

    // Si es la primera selección, iniciar la reserva
    if (checkoutSeats.length > 0 && !checkoutData.sessionId) {
      const newSessionId = `session-${Date.now()}`
      setSessionId(newSessionId)

      // 5 minutos desde ahora
      const expiry = new Date()
      expiry.setMinutes(expiry.getMinutes() + 5)
      setReservationExpiry(expiry)
    }

    updateSeats(checkoutSeats)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleProceedToCheckout = (seats: any[]) => {
    // Actualizar los asientos antes de proceder
    handleSelectionChange(seats)
    // El botón del SeatSelector puede ser usado para avanzar al siguiente paso
    // Pero por ahora lo manejamos desde el wizard principal
  }

  if (seatingLoading) {
    return (
      <Card>
        <CardContent className="p-12">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            <p className="text-gray-600">Cargando mapa de asientos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (seatingError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{seatingError}</AlertDescription>
      </Alert>
    )
  }

  const hasSeats = sections && sections.length > 0

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <Armchair className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Selecciona tus Asientos</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                Haz clic en los asientos disponibles del mapa
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Selection Stats */}
      {getTotalSeats() > 0 && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Check className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100">
                  {getTotalSeats()} {getTotalSeats() === 1 ? 'asiento seleccionado' : 'asientos seleccionados'}
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Puedes continuar al siguiente paso
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Seat Map */}
      {hasSeats ? (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <SeatSelector
              eventId={eventId}
              sections={sections}
              onSelectionChange={handleSelectionChange}
              onProceedToCheckout={handleProceedToCheckout}
              maxSeats={10}
            />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="text-center space-y-4">
              <div className="text-6xl">🎪</div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
                Evento de Admisión General
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Este evento no tiene asientos asignados
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                La entrada te permitirá acceso a cualquier área disponible
              </p>
              <Badge variant="secondary" className="text-lg px-4 py-2">
                Entrada General
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Leyenda de Asientos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-green-500" />
              <span className="text-sm">Disponible</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-blue-500" />
              <span className="text-sm">Seleccionado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-gray-400" />
              <span className="text-sm">Ocupado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded border-2 border-blue-600" />
              <span className="text-sm">Accesible ♿</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          💡 <strong>Consejo:</strong> Los asientos se reservarán automáticamente por 5 minutos
          cuando los selecciones. Completa tu compra antes de que expire el tiempo.
        </AlertDescription>
      </Alert>
    </div>
  )
}
