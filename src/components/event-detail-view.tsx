"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Ticket,
} from "lucide-react";
import { calculateTotalPrice, formatPrice } from "@/lib/commission";
import TicketPurchaseForm from "@/components/ticket-purchase-form";

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  capacity: number;
  _count: { tickets: number };
}

interface EventDetail {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location: string;
  imageUrl?: string;
  isPublished: boolean;
  category: { id: string; name: string };
  organizer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    imageUrl?: string;
  };
  _count: { tickets: number; orders: number };
  ticketTypes: TicketType[];
}

interface EventDetailViewProps {
  event: EventDetail;
  user?: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  } | null;
  userTicketsCount: number;
}

function getEventPriceDisplay(ticketTypes: TicketType[]): string {
  if (!ticketTypes || ticketTypes.length === 0) return "No disponible";
  const prices = ticketTypes.map((t) => calculateTotalPrice(t.price));
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  if (minPrice === 0 && maxPrice === 0) return "Gratis";
  if (minPrice === maxPrice)
    return formatPrice(minPrice, ticketTypes[0].currency);
  if (minPrice === 0) return `Desde Gratis`;
  return `Desde ${formatPrice(minPrice, ticketTypes[0].currency)}`;
}

export default function EventDetailView({
  event,
  user,
  userTicketsCount,
}: EventDetailViewProps) {
  const [showPurchaseForm, setShowPurchaseForm] = useState(false);

  const startDate = new Date(event.startDate);
  const isPast = startDate < new Date();

  const totalCapacity = event.ticketTypes.reduce(
    (sum, type) => sum + type.capacity,
    0
  );
  const availableTickets = totalCapacity - event._count.tickets;
  const isSoldOut = availableTickets <= 0;

  const displayPrice = getEventPriceDisplay(event.ticketTypes);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* ... (Sección de imagen y cabecera sin cambios, ya usa `displayPrice`) ... */}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* ... (Cards de Detalles, Descripción y Organizador sin cambios) ... */}

            {/* --- Nueva Card para mostrar los tipos de entrada --- */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="h-5 w-5" />
                  Entradas Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {event.ticketTypes.map((ticketType) => {
                  const typePrice = calculateTotalPrice(ticketType.price);
                  const ticketsSoldForType = ticketType._count.tickets;
                  const availableForType =
                    ticketType.capacity - ticketsSoldForType;
                  const isTypeSoldOut = availableForType <= 0;

                  return (
                    <div
                      key={ticketType.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">{ticketType.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {ticketType.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isTypeSoldOut
                            ? "Agotado"
                            : `${availableForType} disponibles`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-primary">
                          {formatPrice(typePrice, ticketType.currency)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-center">Comprar Entradas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-3xl font-bold text-primary mb-1">
                    {displayPrice}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {displayPrice.startsWith("Desde")
                      ? "Precios desde"
                      : "Precio final"}
                  </div>
                </div>

                {/* ... (Lógica de botones y disponibilidad sin cambios) ... */}
                {isPast || isSoldOut ? (
                  <Button disabled className="w-full" size="lg">
                    {isPast ? "Evento finalizado" : "Agotado"}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowPurchaseForm(true)}
                    className="w-full"
                    size="lg"
                  >
                    Comprar Entradas
                  </Button>
                )}
              </CardContent>
            </Card>
            {/* ... (Otras cards laterales sin cambios) ... */}
          </div>
        </div>

        {/* --- Modal de Compra --- */}
        {showPurchaseForm && user && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Comprar Entradas</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowPurchaseForm(false)}
                  >
                    ✕
                  </Button>
                </div>
                {/* Pasamos el evento completo al formulario de compra */}
                <TicketPurchaseForm
                  event={{
                    ...event,
                    price: event.ticketTypes[0]?.price ?? 0,
                    currency: event.ticketTypes[0]?.currency ?? "EUR",
                    isFree: event.ticketTypes.every(t => t.price === 0),
                    capacity: event.ticketTypes.reduce((sum, t) => sum + t.capacity, 0),
                  }}
                  userTicketsCount={userTicketsCount}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
