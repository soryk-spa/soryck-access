'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCheckout } from '../checkout-context'
import { AlertCircle, Ticket, Tag, CheckCircle2, XCircle } from 'lucide-react'

interface Step2TicketDetailsProps {
  eventId: string
}

interface PromoCodeValidation {
  isValid: boolean
  discount: number
  message: string
  code?: string
}

export function Step2TicketDetails({ eventId }: Step2TicketDetailsProps) {
  const { checkoutData, updateTicketDetails, getTotalSeats } = useCheckout()

  const [promoCode, setPromoCode] = useState(checkoutData.ticketDetails.promoCode || '')
  const [isValidatingPromo, setIsValidatingPromo] = useState(false)
  const [promoValidation, setPromoValidation] = useState<PromoCodeValidation | null>(null)

  const quantity = getTotalSeats()

  useEffect(() => {
    // Actualizar cantidad automáticamente basado en asientos seleccionados
    if (checkoutData.ticketDetails.quantity !== quantity) {
      updateTicketDetails({
        ...checkoutData.ticketDetails,
        quantity,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantity])

  const handleApplyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoValidation({
        isValid: false,
        discount: 0,
        message: 'Ingresa un código promocional',
      })
      return
    }

    setIsValidatingPromo(true)

    try {
      // Llamar a la API para validar el código promo
      const response = await fetch(`/api/events/${eventId}/promo-codes/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: promoCode, quantity }),
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        setPromoValidation({
          isValid: true,
          discount: data.discount,
          message: data.message || `¡Código válido! ${data.discount}% de descuento`,
          code: promoCode,
        })

        updateTicketDetails({
          ...checkoutData.ticketDetails,
          promoCode,
          discounts: [data.discountId],
        })
      } else {
        setPromoValidation({
          isValid: false,
          discount: 0,
          message: data.message || 'Código promocional inválido',
        })
      }
    } catch (error) {
      console.error('Error validating promo code:', error)
      setPromoValidation({
        isValid: false,
        discount: 0,
        message: 'Error al validar el código',
      })
    } finally {
      setIsValidatingPromo(false)
    }
  }

  const handleRemovePromoCode = () => {
    setPromoCode('')
    setPromoValidation(null)
    updateTicketDetails({
      ...checkoutData.ticketDetails,
      promoCode: undefined,
      discounts: undefined,
    })
  }

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
              <Ticket className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Detalles del Ticket</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                Configura las opciones de tu compra
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Quantity Info */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Ticket className="h-5 w-5" />
            Cantidad de Tickets
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950 rounded-lg p-6 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Tickets seleccionados
                </p>
                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                  {quantity}
                </p>
              </div>
              <div className="text-6xl">🎫</div>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              La cantidad de tickets corresponde al número de asientos que seleccionaste en el paso anterior.
              Si deseas cambiar la cantidad, regresa al Paso 1.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Promo Code Section */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Código Promocional
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!promoValidation?.isValid ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="promoCode">¿Tienes un código de descuento?</Label>
                <div className="flex gap-2">
                  <Input
                    id="promoCode"
                    type="text"
                    placeholder="Ej: SUMMER2025"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleApplyPromoCode()
                      }
                    }}
                    className="flex-1"
                    disabled={isValidatingPromo}
                  />
                  <Button
                    onClick={handleApplyPromoCode}
                    disabled={isValidatingPromo || !promoCode.trim()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {isValidatingPromo ? 'Validando...' : 'Aplicar'}
                  </Button>
                </div>
              </div>

              {promoValidation && !promoValidation.isValid && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{promoValidation.message}</AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4 border-2 border-green-200 dark:border-green-800">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-green-900 dark:text-green-100">
                      Código Aplicado
                    </p>
                    <Badge variant="outline" className="mt-1 border-green-600 text-green-700 dark:text-green-300">
                      {promoValidation.code}
                    </Badge>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                      {promoValidation.message}
                    </p>
                    <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-1">
                      {promoValidation.discount}% de descuento
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemovePromoCode}
                  className="text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
                >
                  Quitar
                </Button>
              </div>
            </div>
          )}

          <div className="text-sm text-gray-500 space-y-1">
            <p>💡 <strong>Consejos:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Los códigos promocionales son sensibles a mayúsculas</li>
              <li>Algunos códigos tienen fecha de expiración</li>
              <li>El descuento se aplicará automáticamente al total</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Resumen del Paso 2
              </p>
              <p className="text-lg font-semibold mt-1">
                {quantity} {quantity === 1 ? 'ticket' : 'tickets'}
                {promoValidation?.isValid && (
                  <span className="text-green-600 dark:text-green-400 ml-2">
                    con {promoValidation.discount}% de descuento
                  </span>
                )}
              </p>
            </div>
            <CheckCircle2 className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
