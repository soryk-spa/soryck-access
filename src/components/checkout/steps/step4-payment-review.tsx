'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useCheckout } from '../checkout-context'
import {
  AlertCircle,
  CreditCard,
  User,
  Mail,
  Phone,
  Armchair,
  Tag,
  Clock,
  MapPin,
  ShieldCheck,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Step4PaymentReviewProps {
  eventId: string
  eventTitle: string
  eventLocation?: string
  eventDate?: string
}

export function Step4PaymentReview({
  eventId,
  eventTitle,
  eventLocation,
  eventDate,
}: Step4PaymentReviewProps) {
  const router = useRouter()
  const { checkoutData, getTotalAmount, getTotalSeats, timeRemaining } = useCheckout()

  const [acceptTerms, setAcceptTerms] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handleProceedToPayment = async () => {
    if (!acceptTerms) {
      alert('Debes aceptar los términos y condiciones')
      return
    }

    setIsProcessing(true)

    try {
      // Crear la orden en el backend
      const response = await fetch(`/api/events/${eventId}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          seats: checkoutData.seats,
          ticketDetails: checkoutData.ticketDetails,
          buyerInfo: checkoutData.buyerInfo,
          sessionId: checkoutData.sessionId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Error al crear la orden')
      }

      const data = await response.json()

      // Si hay una URL de pago de Transbank, redirigir
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else if (data.orderId) {
        // Si es un evento gratuito o cortesía, redirigir al success
        router.push(`/events/${eventId}/checkout/success?orderId=${data.orderId}`)
      }
    } catch (error) {
      console.error('Error processing payment:', error)
      alert(error instanceof Error ? error.message : 'Error al procesar el pago')
      setIsProcessing(false)
    }
  }

  const subtotal = getTotalAmount()
  const discount = checkoutData.ticketDetails.promoCode ? subtotal * 0.1 : 0 // Ejemplo: 10%
  const total = subtotal - discount

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Revisión y Pago</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                Verifica tu información antes de continuar
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Timer Warning */}
      {timeRemaining < 120 && timeRemaining > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            ⏰ <strong>¡Tiempo limitado!</strong> Tu reserva expira en{' '}
            <strong>{formatTime(timeRemaining)}</strong>. Completa tu compra pronto.
          </AlertDescription>
        </Alert>
      )}

      {/* Event Summary */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Resumen del Evento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="text-4xl">🎉</div>
            <div className="flex-1">
              <h3 className="font-bold text-xl">{eventTitle}</h3>
              {eventLocation && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-2">
                  <MapPin className="h-4 w-4" />
                  <span>{eventLocation}</span>
                </div>
              )}
              {eventDate && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mt-1">
                  <Clock className="h-4 w-4" />
                  <span>{eventDate}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Seats */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Armchair className="h-5 w-5" />
            Asientos Seleccionados ({getTotalSeats()})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {checkoutData.seats.map((seat, index) => (
              <div
                key={seat.id}
                className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">
                      <Badge variant="outline" className="mr-2">
                        {seat.sectionName}
                      </Badge>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Fila {seat.row}, Asiento {seat.number}
                      {seat.isAccessible && ' ♿'}
                    </p>
                  </div>
                </div>
                <span className="font-bold">{formatCurrency(seat.finalPrice)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Buyer Information */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Comprador
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Nombre Completo</p>
              <p className="font-semibold">
                {checkoutData.buyerInfo.firstName} {checkoutData.buyerInfo.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Mail className="h-3 w-3" /> Email
              </p>
              <p className="font-semibold">{checkoutData.buyerInfo.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                <Phone className="h-3 w-3" /> Teléfono
              </p>
              <p className="font-semibold">{checkoutData.buyerInfo.phone}</p>
            </div>
            {checkoutData.buyerInfo.documentNumber && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Documento</p>
                <p className="font-semibold">
                  {checkoutData.buyerInfo.documentType?.toUpperCase()}:{' '}
                  {checkoutData.buyerInfo.documentNumber}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Price Breakdown */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Desglose de Precios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              Subtotal ({getTotalSeats()} {getTotalSeats() === 1 ? 'ticket' : 'tickets'})
            </span>
            <span className="font-semibold">{formatCurrency(subtotal)}</span>
          </div>

          {checkoutData.ticketDetails.promoCode && (
            <div className="flex items-center justify-between text-green-600 dark:text-green-400">
              <span className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Descuento ({checkoutData.ticketDetails.promoCode})
              </span>
              <span className="font-semibold">-{formatCurrency(discount)}</span>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between text-xl font-bold">
            <span>Total</span>
            <span className="text-green-600 dark:text-green-400">{formatCurrency(total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <div className="space-y-2">
              <label
                htmlFor="terms"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Acepto los términos y condiciones
              </label>
              <p className="text-xs text-gray-500">
                Al continuar, confirmas que has leído y aceptas nuestros{' '}
                <a href="/terms" className="text-blue-600 hover:underline" target="_blank">
                  Términos de Servicio
                </a>{' '}
                y{' '}
                <a href="/privacy" className="text-blue-600 hover:underline" target="_blank">
                  Política de Privacidad
                </a>
                .
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Button */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
        <CardContent className="p-6">
          <Button
            onClick={handleProceedToPayment}
            disabled={!acceptTerms || isProcessing || timeRemaining === 0}
            className="w-full h-14 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Procesando...
              </>
            ) : (
              <>
                <CreditCard className="h-5 w-5 mr-2" />
                Proceder al Pago - {formatCurrency(total)}
              </>
            )}
          </Button>

          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Pago seguro procesado por Transbank</span>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Tus tickets serán enviados al email registrado</li>
            <li>Recibirás una confirmación inmediata después del pago</li>
            <li>Puedes descargar tus tickets desde tu perfil</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  )
}
