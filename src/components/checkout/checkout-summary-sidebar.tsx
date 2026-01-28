'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useCheckout } from './checkout-context'
import { Clock, MapPin, Ticket, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckoutSummarySidebarProps {
  eventTitle: string
  eventLocation: string
  eventDate: string
  eventImage?: string
  className?: string
}

export function CheckoutSummarySidebar({
  eventTitle,
  eventLocation,
  eventDate,
  eventImage,
  className,
}: CheckoutSummarySidebarProps) {
  const { checkoutData, getTotalAmount, getTotalSeats, timeRemaining } = useCheckout()

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const isTimeCritical = timeRemaining < 120 // Menos de 2 minutos

  return (
    <Card className={cn('sticky top-6 border-0 shadow-xl', className)}>
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardTitle className="flex items-center gap-2">
          <Ticket className="h-5 w-5 text-blue-600" />
          Resumen de Compra
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Evento Info */}
        <div className="space-y-3">
          {eventImage && (
            <div className="relative w-full h-32 rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={eventImage}
                alt={eventTitle}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
              {eventTitle}
            </h3>
            <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{eventLocation}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{eventDate}</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Asientos Seleccionados */}
        {checkoutData.seats.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">
              Asientos Seleccionados ({getTotalSeats()})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {checkoutData.seats.map((seat) => (
                <div
                  key={seat.id}
                  className="flex justify-between items-start text-sm bg-gray-50 dark:bg-gray-800 rounded-lg p-3"
                >
                  <div>
                    <Badge variant="outline" className="mb-1">
                      {seat.sectionName}
                    </Badge>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Fila {seat.row}, Asiento {seat.number}
                      {seat.isAccessible && ' ♿'}
                    </p>
                  </div>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(seat.finalPrice)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Código Promocional */}
        {checkoutData.ticketDetails.promoCode && (
          <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-green-700 dark:text-green-300">
                Código aplicado
              </span>
              <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                {checkoutData.ticketDetails.promoCode}
              </Badge>
            </div>
          </div>
        )}

        <Separator />

        {/* Total */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
            <span className="font-medium">{formatCurrency(getTotalAmount())}</span>
          </div>
          
          <div className="flex justify-between items-center pt-3 border-t">
            <span className="text-lg font-semibold">Total</span>
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {formatCurrency(getTotalAmount())}
            </span>
          </div>
        </div>

        {/* Timer de Reserva */}
        {checkoutData.sessionId && timeRemaining > 0 && (
          <div
            className={cn(
              'rounded-lg p-4 border-2 transition-colors',
              isTimeCritical
                ? 'bg-red-50 border-red-300 dark:bg-red-950 dark:border-red-800'
                : 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800'
            )}
          >
            <div className="flex items-center gap-3">
              <AlertCircle
                className={cn('h-5 w-5', isTimeCritical ? 'text-red-600' : 'text-blue-600')}
              />
              <div className="flex-1">
                <p
                  className={cn(
                    'text-sm font-medium',
                    isTimeCritical ? 'text-red-900 dark:text-red-100' : 'text-blue-900 dark:text-blue-100'
                  )}
                >
                  Tiempo restante
                </p>
                <p
                  className={cn(
                    'text-2xl font-bold tabular-nums',
                    isTimeCritical ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'
                  )}
                >
                  {formatTime(timeRemaining)}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Completa tu compra antes de que expire la reserva
            </p>
          </div>
        )}

        {/* Info adicional */}
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p>• Los precios incluyen cargos por servicio</p>
          <p>• Recibirás tus tickets por email</p>
          <p>• Cancelación gratuita hasta 24h antes</p>
        </div>
      </CardContent>
    </Card>
  )
}
