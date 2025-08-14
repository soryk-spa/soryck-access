"use client";
import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  MapPin,
  Ticket,
  QrCode,
  Download,
  Share2,
  AlertCircle,
  CheckCircle2,
  User,
  Loader2,
} from "lucide-react";

const QRCodeCanvas = dynamic(
  () => import("qrcode.react").then((mod) => mod.QRCodeCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    ),
  }
);

interface TicketCardProps {
  ticket: {
    id: string;
    qrCode: string;
    isUsed: boolean;
    usedAt: string | null;
    status: "ACTIVE" | "CANCELLED" | "REFUNDED";
    createdAt: string;
    event: {
      id: string;
      title: string;
      startDate: string;
      endDate: string | null;
      location: string;
      imageUrl: string | null;
      price: number;
      currency: string;
      isFree: boolean;
      organizer: {
        firstName: string | null;
        lastName: string | null;
        email: string;
      };
    };
    order: {
      id: string;
      orderNumber: string;
      totalAmount: number;
      currency: string;
      createdAt: string;
    };
  };
}

export default function TicketCard({ ticket }: TicketCardProps) {
  const [showQR, setShowQR] = useState(false);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "America/Santiago",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Santiago",
    });
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getOrganizerName = () => {
    const { organizer } = ticket.event;
    if (organizer.firstName || organizer.lastName) {
      return `${organizer.firstName || ""} ${organizer.lastName || ""}`.trim();
    }
    return organizer.email.split("@")[0];
  };

  const getStatusInfo = () => {
    if (ticket.status === "CANCELLED") {
      return {
        label: "Cancelado",
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
        icon: AlertCircle,
      };
    }
    if (ticket.status === "REFUNDED") {
      return {
        label: "Reembolsado",
        color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        icon: AlertCircle,
      };
    }
    if (ticket.isUsed) {
      return {
        label: "Usado",
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

  const loadQRCode = async () => {
    if (qrImage) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/tickets/${ticket.id}`);
      if (response.ok) {
        const data = await response.json();
        setQrImage(data.ticket.qrCodeImage);
      }
    } catch (error) {
      console.error("Error loading QR code:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowQR = () => {
    setShowQR(true);
    loadQRCode();
  };

  const handleShare = async () => {
    if (navigator.share && qrImage) {
      try {
        const response = await fetch(qrImage);
        const blob = await response.blob();
        const file = new File([blob], `ticket-${ticket.qrCode}.png`, {
          type: "image/png",
        });

        await navigator.share({
          title: `Ticket - ${ticket.event.title}`,
          text: `Mi ticket para ${ticket.event.title}`,
          files: [file],
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    }
  };

  const handleDownload = () => {
    if (qrImage) {
      const link = document.createElement("a");
      link.href = qrImage;
      link.download = `ticket-${ticket.qrCode}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;
  const isEventPast = new Date(ticket.event.startDate) < new Date();
  const canUseTicket =
    ticket.status === "ACTIVE" && !ticket.isUsed && !isEventPast;

  // URL para el QR code
  const qrCodeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${ticket.qrCode}`;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="relative h-48">
        {ticket.event.imageUrl ? (
          <Image
            src={ticket.event.imageUrl}
            alt={ticket.event.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#01CBFE]/20 to-[#0053CC]/20 flex items-center justify-center">
            <Calendar className="h-16 w-16 text-[#0053CC]/50" />
          </div>
        )}

        <div className="absolute top-4 right-4">
          <Badge className={statusInfo.color}>
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusInfo.label}
          </Badge>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/95 backdrop-blur rounded-lg p-3">
            <h3 className="font-bold text-lg text-[#0053CC] line-clamp-1">
              {ticket.event.title}
            </h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Calendar className="h-4 w-4" />
              <span>
                {formatDate(ticket.event.startDate)} •{" "}
                {formatTime(ticket.event.startDate)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            Ticket #{ticket.qrCode.slice(-8)}
          </CardTitle>
          <span className="text-sm font-medium">
            {ticket.event.isFree
              ? "Gratis"
              : formatPrice(ticket.event.price, ticket.event.currency)}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{ticket.event.location}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Organizado por {getOrganizerName()}</span>
          </div>

          {ticket.isUsed && ticket.usedAt && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>
                Usado el {formatDate(ticket.usedAt)} a las{" "}
                {formatTime(ticket.usedAt)}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Dialog open={showQR} onOpenChange={setShowQR}>
            <DialogTrigger asChild>
              <Button
                onClick={handleShowQR}
                className="flex-1"
                disabled={!canUseTicket}
              >
                <QrCode className="h-4 w-4 mr-2" />
                Ver QR
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-center">Tu Ticket</DialogTitle>
                <DialogDescription className="text-center">
                  Presenta este código QR en el evento
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="font-semibold text-lg">
                    {ticket.event.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(ticket.event.startDate)} •{" "}
                    {formatTime(ticket.event.startDate)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {ticket.event.location}
                  </p>
                </div>

                <div className="flex justify-center p-4 bg-white rounded-lg border-2 border-dashed border-[#0053CC]/20">
                  {loading ? (
                    <div className="w-64 h-64 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0053CC]"></div>
                    </div>
                  ) : qrImage ? (
                    <Image
                      src={qrImage}
                      alt="QR Code"
                      width={256}
                      height={256}
                      className="rounded-lg"
                    />
                  ) : (
                    // Usar el QR code generado dinámicamente como fallback
                    <QRCodeCanvas
                      value={qrCodeUrl}
                      size={256}
                      bgColor="#ffffff"
                      fgColor="#000000"
                      level="L"
                      includeMargin={true}
                    />
                  )}
                </div>

                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">
                    Código: {ticket.qrCode}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Comprado el {formatDate(ticket.order.createdAt)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="flex-1"
                    disabled={!qrImage}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="flex-1"
                    disabled={!qrImage}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}