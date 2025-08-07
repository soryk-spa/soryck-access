"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  quantity: number;
  status: string;
  createdAt: string;
  event: {
    id: string;
    title: string;
    startDate: string;
    location: string;
  };
  tickets: Array<{
    id: string;
    qrCode: string;
  }>;
}

interface PaymentSuccessClientProps {
  orderId?: string;
}

export default function PaymentSuccessClient({
  orderId,
}: PaymentSuccessClientProps) {
  const { user, isLoaded } = useUser();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetails = async () => {
    if (!orderId) return;

    try {
      const response = await fetch(`/api/orders/${orderId}`);

      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      } else if (response.status === 404) {
        setTimeout(() => {
          fetchOrderDetails();
        }, 2000);
        return;
      } else {
        throw new Error("Error al obtener detalles de la orden");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) return;

      try {
        const response = await fetch(`/api/orders/${orderId}`);

        if (response.ok) {
          const data = await response.json();
          setOrder(data.order);
        } else if (response.status === 404) {
          setTimeout(() => {
            fetchOrderDetails();
          }, 2000);
          return;
        } else {
          throw new Error("Error al obtener detalles de la orden");
        }
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    if (!isLoaded) return;

    if (!user) {
      const redirectUrl = `/sign-in?redirectTo=${encodeURIComponent(
        window.location.href
      )}`;
      window.location.href = redirectUrl;
      return;
    }

    if (!orderId) {
      setError("ID de orden requerido");
      setLoading(false);
      return;
    }

    fetchOrderDetails();
  }, [user, isLoaded, orderId]);

  if (!isLoaded || loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-green-500" />
              <h2 className="text-xl font-semibold mb-2">
                Procesando tu compra...
              </h2>
              <p className="text-muted-foreground">
                Por favor espera mientras confirmamos tu pago y generamos tus
                tickets.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !orderId) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-red-200 bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-600 mb-2">
                Error en la confirmación
              </h2>
              <p className="text-muted-foreground mb-6">
                {error || "No se pudo obtener la información de la orden."}
              </p>
              <div className="space-y-3">
                <Button asChild>
                  <Link href="/dashboard">Ir al Dashboard</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/tickets">Ver Mis Tickets</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">
                Orden no encontrada
              </h2>
              <p className="text-muted-foreground mb-6">
                Tu pago puede estar aún procesándose. Por favor revisa tu
                dashboard en unos minutos.
              </p>
              <div className="space-y-3">
                <Button onClick={fetchOrderDetails}>Reintentar</Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard">Ir al Dashboard</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
              {order.quantity} ticket{order.quantity > 1 ? "s" : ""} comprado
              {order.quantity > 1 ? "s" : ""}
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
                ${order.totalAmount.toLocaleString("es-CL")} {order.currency}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Fecha:</span>
              <span>
                {new Date(order.createdAt).toLocaleDateString("es-CL")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tickets generados:</span>
              <span className="font-semibold text-green-600">
                {order.tickets.length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estado:</span>
              <span className="font-semibold text-green-600 capitalize">
                {order.status === "PAID" ? "Pagado" : order.status}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/tickets">
                <Mail className="w-4 h-4 mr-2" />
                Ver Mis Tickets con QR
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href={`/events/${order.event.id}`}>
                Ver Detalles del Evento
              </Link>
            </Button>

            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard">Ir al Dashboard</Link>
            </Button>
          </div>

          <div className="text-sm text-muted-foreground text-center space-y-1">
            <p>✅ Los tickets han sido generados con códigos QR únicos</p>
            <p>📱 Accede a tus códigos QR desde &quot;Mis Tickets&quot;</p>
            <p>🎫 Presenta el QR en el evento para ingresar</p>
            <p>💬 Soporte disponible 24/7 para ayudarte</p>
          </div>

          {order.tickets.length > 0 && (
            <div className="bg-green-50 dark:bg-green-950 rounded-lg p-4">
              <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
                Códigos QR generados:
              </h4>
              <div className="space-y-1">
                {order.tickets.slice(0, 3).map((ticket, index) => (
                  <p
                    key={ticket.id}
                    className="text-sm font-mono text-green-700 dark:text-green-300"
                  >
                    Ticket {index + 1}: ...{ticket.qrCode.slice(-8)}
                  </p>
                ))}
                {order.tickets.length > 3 && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ... y {order.tickets.length - 3} más
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
