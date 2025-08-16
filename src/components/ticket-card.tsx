"use client";
import { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Card, CardContent } from "@/components/ui/card";
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
  QrCode,
  Download,
  Share2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Clock,
  Building,
  Hash,
  Eye,
  Sparkles,
  Star,
  Zap,
} from "lucide-react";
import { formatDate, formatTime } from "@/lib/date";

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
      formattedDate: string;
      formattedTime: string;
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
        color: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
        bgColor: "bg-red-50 dark:bg-red-950/20",
        icon: AlertCircle,
        iconColor: "text-red-600",
      };
    }
    if (ticket.status === "REFUNDED") {
      return {
        label: "Reembolsado",
        color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
        bgColor: "bg-blue-50 dark:bg-blue-950/20",
        icon: AlertCircle,
        iconColor: "text-blue-600",
      };
    }
    if (ticket.isUsed) {
      return {
        label: "Usado",
        color:
          "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
        bgColor: "bg-green-50 dark:bg-green-950/20",
        icon: CheckCircle2,
        iconColor: "text-green-600",
      };
    }
    return {
      label: "Válido",
      color:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
      icon: Sparkles,
      iconColor: "text-emerald-600",
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
  const isToday =
    new Date(ticket.event.startDate).toDateString() ===
    new Date().toDateString();
  const isTomorrow =
    new Date(ticket.event.startDate).toDateString() ===
    new Date(Date.now() + 86400000).toDateString();

  // URL para el QR code
  const qrCodeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${ticket.qrCode}`;

  const getEventTimeStatus = () => {
    if (isToday) return { label: "Hoy", color: "text-orange-600", icon: Zap };
    if (isTomorrow)
      return { label: "Mañana", color: "text-blue-600", icon: Clock };
    return null;
  };

  const timeStatus = getEventTimeStatus();

  return (
    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-white dark:bg-gray-800 hover:scale-[1.02]">
      {/* Header Image Section */}
      <div className="relative h-56 overflow-hidden">
        {ticket.event.imageUrl ? (
          <Image
            src={ticket.event.imageUrl}
            alt={ticket.event.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center relative overflow-hidden">
            <Calendar className="h-24 w-24 text-white/30 absolute" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}

        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Status Badge */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Badge
            className={`${statusInfo.color} border-0 backdrop-blur-sm bg-white/20 text-white shadow-lg`}
          >
            <StatusIcon className="h-3 w-3 mr-1" />
            {statusInfo.label}
          </Badge>
          {timeStatus && (
            <Badge className="bg-orange-500 text-white border-0 shadow-lg">
              <timeStatus.icon className="h-3 w-3 mr-1" />
              {timeStatus.label}
            </Badge>
          )}
        </div>

        {/* Event Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-2xl p-4 shadow-xl border border-white/20">
            <h3 className="font-bold text-xl text-gray-900 dark:text-white line-clamp-2 mb-2">
              {ticket.event.title}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 text-blue-500" />
                <span className="font-medium">
                  {ticket.event.formattedDate}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-purple-500" />
                <span>{ticket.event.formattedTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <CardContent className="p-6 space-y-6">
        {/* Ticket Info Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Hash className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                Ticket #{ticket.qrCode.slice(-8)}
              </p>
              <p className="text-xs text-gray-500">
                Orden: {ticket.order.orderNumber}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span
              className={`text-lg font-bold ${ticket.event.isFree ? "text-green-600" : "text-blue-600"}`}
            >
              {ticket.event.isFree
                ? "Gratis"
                : formatPrice(ticket.order.totalAmount, ticket.order.currency)}
            </span>
            {!ticket.event.isFree && (
              <p className="text-xs text-gray-500">
                {formatPrice(ticket.event.price, ticket.event.currency)} +
                comisión
              </p>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <MapPin className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                Ubicación
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm break-words">
                {ticket.event.location}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Building className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 dark:text-white text-sm">
                Organizador
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {getOrganizerName()}
              </p>
            </div>
          </div>

          {ticket.isUsed && ticket.usedAt && (
            <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-green-700 dark:text-green-400 text-sm">
                  Ticket utilizado
                </p>
                <p className="text-green-600 dark:text-green-300 text-xs">
                  {formatDate(ticket.usedAt)} a las {formatTime(ticket.usedAt)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Dialog open={showQR} onOpenChange={setShowQR}>
            <DialogTrigger asChild>
              <Button
                onClick={handleShowQR}
                className={`flex-1 ${
                  canUseTicket
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                    : "bg-gray-500"
                } text-white shadow-lg`}
                disabled={!canUseTicket}
              >
                <QrCode className="h-4 w-4 mr-2" />
                {canUseTicket ? "Mostrar QR" : "QR No Disponible"}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader className="text-center space-y-3">
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Tu Ticket Digital
                </DialogTitle>
                <DialogDescription className="text-base">
                  Presenta este código QR en la entrada del evento
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Event Info */}
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-xl">
                  <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">
                    {ticket.event.title}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center justify-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {ticket.event.formattedDate} •{" "}
                        {ticket.event.formattedTime}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{ticket.event.location}</span>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex justify-center">
                  <div className="p-6 bg-white rounded-2xl shadow-2xl border-4 border-dashed border-blue-200">
                    {loading ? (
                      <div className="w-64 h-64 flex items-center justify-center">
                        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
                      </div>
                    ) : qrImage ? (
                      <Image
                        src={qrImage}
                        alt="QR Code"
                        width={256}
                        height={256}
                        className="rounded-xl"
                      />
                    ) : (
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
                </div>

                {/* Ticket Details */}
                <div className="text-center space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <p className="text-sm font-mono text-gray-600 dark:text-gray-400">
                    Código: {ticket.qrCode}
                  </p>
                  <p className="text-xs text-gray-500">
                    Ticket adquirido el {formatDate(ticket.order.createdAt)}
                  </p>
                  <div className="flex items-center justify-center gap-1 text-xs text-blue-600">
                    <Star className="h-3 w-3" />
                    <span>Válido por una entrada</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <Button
                    onClick={handleDownload}
                    variant="outline"
                    className="flex-1 border-blue-200 hover:bg-blue-50"
                    disabled={!qrImage}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </Button>
                  <Button
                    onClick={handleShare}
                    variant="outline"
                    className="flex-1 border-purple-200 hover:bg-purple-50"
                    disabled={!qrImage}
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Compartir
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            className="border-gray-300 hover:bg-gray-50"
            asChild
          >
            <a href={`/events/${ticket.event.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              Ver Evento
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
