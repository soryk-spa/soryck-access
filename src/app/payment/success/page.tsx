import { Suspense } from 'react'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, Download, Mail } from 'lucide-react'
import Link from 'next/link'

interface SuccessPageProps {
  searchParams: Promise<{ orderId?: string }>
}

async function SuccessContent({ orderId }: { orderId: string }) {
  const user = await requireAuth()
  
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: user.id
    },
    include: {
      event: true,
      tickets: true,
      payment: true
    }
  })

  if (!order) {
    return <div>Orden no encontrada</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            ¡Pago Exitoso!
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">{order.event.title}</h2>
            <p className="text-muted-foreground">
              {order.quantity} ticket{order.quantity > 1 ? 's' : ''} comprado{order.quantity > 1 ? 's' : ''}
            </p>
          </div>

          <div className="border-t border-b py-4 space-y-2">
            <div className="flex justify-between">
              <span>Número de orden:</span>
              <span className="font-mono">{order.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Total pagado:</span>
              <span className="font-semibold">
                ${order.totalAmount.toLocaleString('es-CL')} {order.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Fecha:</span>
              <span>{new Date(order.createdAt).toLocaleDateString('es-CL')}</span>
            </div>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/dashboard">
                <Mail className="w-4 h-4 mr-2" />
                Ver Mis Tickets
              </Link>
            </Button>
            
            <Button variant="outline" className="w-full">
              <Download className="w-4 h-4 mr-2" />
              Descargar Comprobante
            </Button>
          </div>

          <div className="text-sm text-muted-foreground text-center">
            <p>Los tickets han sido enviados a tu email.</p>
            <p>También puedes verlos en tu dashboard.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default async function PaymentSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams
  const orderId = params.orderId

  if (!orderId) {
    return <div>ID de orden requerido</div>
  }

  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SuccessContent orderId={orderId} />
    </Suspense>
  )
}