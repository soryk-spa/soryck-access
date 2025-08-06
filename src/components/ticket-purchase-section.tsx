"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import { 
  Minus, 
  Plus, 
  ShoppingCart, 
  CreditCard, 
  AlertCircle,
  Users,
} from 'lucide-react'

interface Event {
  id: string
  title: string
  price: number
  isFree: boolean
  capacity: number
  _count: {
    tickets: number
  }
}

interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: 'CLIENT' | 'ORGANIZER' | 'ADMIN'
}

interface Availability {
  status: string
  text: string
  color: string
  available: number
}

interface TicketPurchaseSectionProps {
  event: Event
  user: User | null
  availability: Availability
  userTicketsCount: number
}

export default function TicketPurchaseSection({ 
  event, 
  user, 
  availability, 
  userTicketsCount 
}: TicketPurchaseSectionProps) {
  const [quantity, setQuantity] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const maxQuantity = Math.min(availability.available, 10)
  const totalPrice = quantity * event.price
  const canPurchase = availability.status !== 'sold-out' && user

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity)
    }
  }

  const handlePurchase = async () => {
    if (!user) return

    setIsProcessing(true)
    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventId: event.id,
          quantity
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al procesar el pago')
      }

      if (result.isFree) {
        router.push(`/payment/success?orderId=${result.orderId}`)
      } else {
        const redirectUrl = `/payment/redirect?token=${encodeURIComponent(result.token)}&url=${encodeURIComponent(result.paymentUrl)}`
        router.push(redirectUrl)
      }

    } catch (error) {
      console.error('Error purchasing tickets:', error)
      alert(error instanceof Error ? error.message : 'Error al procesar la compra')
      setIsProcessing(false)
    }
  }

  if (availability.status === 'sold-out') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            Evento Agotado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Lo sentimos, todos los tickets para este evento han sido vendidos.
            </p>
            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="text-sm text-red-800 dark:text-red-200">
                <strong>{event._count.tickets}</strong> de <strong>{event.capacity}</strong> tickets vendidos
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Comprar Tickets
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-lg font-semibold mb-2">
                {event.isFree ? 'Gratis' : formatPrice(event.price)}
              </div>
              <div className="text-sm text-muted-foreground">
                por ticket
              </div>
            </div>
            
            <div className="space-y-3">
              <p className="text-muted-foreground text-sm">
                Inicia sesión para comprar tickets
              </p>
              
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link href="/sign-in">
                    Iniciar Sesión
                  </Link>
                </Button>
                
                <Button asChild variant="outline" className="w-full">
                  <Link href="/sign-up">
                    Crear Cuenta
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Comprar Tickets
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Precio */}
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-bold mb-1">
            {event.isFree ? 'Gratis' : formatPrice(event.price)}
          </div>
          <div className="text-sm text-muted-foreground">
            por ticket
          </div>
        </div>

        {/* Información de disponibilidad */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Disponibles:
          </span>
          <span className="font-medium">
            {availability.available} de {event.capacity}
          </span>
        </div>

        {/* Selector de cantidad */}
        <div className="space-y-3">
          <Label htmlFor="quantity">Cantidad de tickets</Label>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            
            <Input
              id="quantity"
              type="number"
              min="1"
              max={maxQuantity}
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
              className="text-center w-20"
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= maxQuantity}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          {maxQuantity < 10 && (
            <p className="text-xs text-muted-foreground">
              Máximo {maxQuantity} tickets disponibles
            </p>
          )}
        </div>

        {/* Resumen del pedido */}
        {!event.isFree && (
          <div className="space-y-2 p-4 bg-muted rounded-lg">
            <div className="flex justify-between text-sm">
              <span>Subtotal ({quantity} ticket{quantity > 1 ? 's' : ''})</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Comisión de servicio</span>
              <span>Incluida</span>
            </div>
            <hr className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
          </div>
        )}

        {/* Alertas */}
        {availability.status === 'almost-sold' && (
          <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
            <div className="flex items-center gap-2 text-orange-800 dark:text-orange-200 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>¡Últimas entradas disponibles!</span>
            </div>
          </div>
        )}

        {availability.status === 'filling-up' && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>Este evento se está llenando rápido</span>
            </div>
          </div>
        )}

        {userTicketsCount > 0 && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="text-blue-800 dark:text-blue-200 text-sm">
              <strong>Nota:</strong> Ya tienes {userTicketsCount} ticket{userTicketsCount > 1 ? 's' : ''} para este evento
            </div>
          </div>
        )}

        {/* Botón de compra */}
        <Button
          onClick={handlePurchase}
          disabled={!canPurchase || isProcessing || quantity > availability.available}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Procesando...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              {event.isFree ? 'Obtener Tickets Gratis' : `Comprar por ${formatPrice(totalPrice)}`}
            </>
          )}
        </Button>

        {/* Información adicional */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Los tickets se enviarán a tu email después del pago</p>
          <p>• Cada ticket incluye un código QR único</p>
          {!event.isFree && <p>• Pagos seguros procesados con encriptación</p>}
          <p>• Soporte disponible 24/7 para ayudarte</p>
        </div>
      </CardContent>
    </Card>
  )
}