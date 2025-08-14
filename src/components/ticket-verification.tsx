"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  XCircle,
  User,
  Calendar,
  MapPin,
  Ticket,
  AlertTriangle,
  Loader2,
  QrCode,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/date-utils"; // Importación actualizada

interface TicketData {
  id: string;
  qrCode: string;
  isUsed: boolean;
  usedAt: string | null;
  status: "ACTIVE" | "CANCELLED" | "REFUNDED";
  attendeeName: string;
  attendeeEmail: string;
  event: {
    id: string;
    title: string;
    startDate: string;
    endDate: string | null;
    location: string;
    organizer: {
      firstName: string | null;
      lastName: string | null;
      email: string;
    };
  };
  order: {
    orderNumber: string;
    totalAmount: number;
    currency: string;
  };
  createdAt: string;
}

interface VerificationResponse {
  ticket: TicketData;
  canUse: boolean;
  isEventDay: boolean;
}

interface TicketVerificationProps {
  qrCode: string;
}

export default function TicketVerification({
  qrCode,
}: TicketVerificationProps) {
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [canUse, setCanUse] = useState(false);
  const [isEventDay, setIsEventDay] = useState(false);
  const [loading, setLoading] = useState(true);
  const [using, setUsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicketInfo = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/verify/${qrCode}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Error al verificar el ticket");
          return;
        }

        const verificationData = data as VerificationResponse;
        setTicket(verificationData.ticket);
        setCanUse(verificationData.canUse);
        setIsEventDay(verificationData.isEventDay);
      } catch {
        setError("Error de conexión");
      } finally {
        setLoading(false);
      }
    };
    fetchTicketInfo();
  }, [qrCode]);

  const handleUseTicket = async () => {
    if (!ticket || !canUse) return;

    setUsing(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/verify/${qrCode}`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Error al usar el ticket");
        return;
      }

      setSuccess("¡Ticket validado exitosamente!");
      setCanUse(false);
      setTicket((prev) =>
        prev
          ? {
              ...prev,
              isUsed: true,
              usedAt: new Date().toISOString(),
            }
          : null
      );
    } catch {
      setError("Error de conexión");
    } finally {
      setUsing(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Verificando ticket...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error && !ticket) {
    return (
      <Card className="max-w-2xl mx-auto border-red-200">
        <CardContent className="pt-6">
          <div className="text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-600 mb-2">
              Ticket No Válido
            </h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="bg-red-50 dark:bg-red-950 rounded-lg p-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                <strong>Código QR:</strong> {qrCode}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!ticket) return null;

  const getStatusInfo = () => {
    if (ticket.status === "CANCELLED") {
      return {
        label: "Cancelado",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
        icon: XCircle,
      };
    }
    if (ticket.status === "REFUNDED") {
      return {
        label: "Reembolsado",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        icon: XCircle,
      };
    }
    if (ticket.isUsed) {
      return {
        label: "Ya Usado",
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        icon: CheckCircle2,
      };
    }
    return {
      label: "Válido",
      color:
        "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
      icon: Ticket,
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card
        className={`${
          canUse
            ? "border-green-200 bg-green-50 dark:bg-green-950"
            : "border-gray-200"
        }`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <QrCode className="h-6 w-6" />
              Verificación de Ticket
            </CardTitle>
            <Badge className={statusInfo.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
      </Card>
      {success && (
        <Card className="border-green-200 bg-green-50 dark:bg-green-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">{success}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {!isEventDay && canUse && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">
                Advertencia: Hoy no es el día del evento
              </span>
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader>
          <CardTitle>{ticket.event.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{ticket.attendeeName}</p>
                  <p className="text-sm text-muted-foreground">
                    {ticket.attendeeEmail}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {formatDate(ticket.event.startDate)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatTime(ticket.event.startDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">{ticket.event.location}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">
                  Código del Ticket
                </p>
                <p className="font-mono text-sm bg-muted px-2 py-1 rounded">
                  {ticket.qrCode}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Orden</p>
                <p className="font-medium">{ticket.order.orderNumber}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className="font-medium">
                  {formatPrice(ticket.order.totalAmount, ticket.order.currency)}
                </p>
              </div>
            </div>
          </div>

          {ticket.isUsed && ticket.usedAt && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm">
                  Usado el {formatDate(ticket.usedAt)} a las{" "}
                  {formatTime(ticket.usedAt)}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      {canUse && (
        <Card>
          <CardContent className="pt-6">
            <Button
              onClick={handleUseTicket}
              disabled={using}
              size="lg"
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
            >
              {using ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Marcar como Usado
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Esta acción no se puede deshacer
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
