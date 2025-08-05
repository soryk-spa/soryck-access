import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface ErrorPageProps {
  searchParams: Promise<{ 
    orderId?: string
    reason?: string 
  }>
}

export default async function PaymentErrorPage({ searchParams }: ErrorPageProps) {
  const params = await searchParams
  const reason = params.reason || 'unknown'

  const getErrorMessage = (reason: string) => {
    switch (reason) {
      case 'no-token':
        return 'No se recibió información del pago'
      case 'payment-not-found':
        return 'No se encontró la información del pago'
      case 'transaction-failed':
        return 'La transacción fue rechazada'
      case 'confirmation-error':
        return 'Error al confirmar el pago'
      case 'server-error':
        return 'Error interno del servidor'
      case 'transaction-cancelled': // Nuevo
        return 'Cancelaste la compra. Puedes intentarlo de nuevo cuando quieras.';
      case 'invalid-return-method': // Nuevo
        return 'Hubo un error en la comunicación con el banco. Por favor, verifica el estado de tu compra en tu dashboard antes de reintentar.';
      case 'unknown-return': // Nuevo
        return 'Se produjo un retorno inesperado desde la pasarela de pago.';
      default:
        return 'Ocurrió un error durante el pago';
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl text-red-600">
            Error en el Pago
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-muted-foreground">
              {getErrorMessage(reason)}
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/events">
                <RefreshCw className="w-4 h-4 mr-2" />
                Intentar de Nuevo
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver al Inicio
              </Link>
            </Button>
          </div>

          <div className="text-sm text-muted-foreground text-center">
            <p>Si el problema persiste, contacta a soporte.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}