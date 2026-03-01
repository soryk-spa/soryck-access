'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Download, QrCode, Loader2, Calendar, MapPin } from 'lucide-react'

const QRCodeCanvas = dynamic(
  () => import('qrcode.react').then((mod) => mod.QRCodeCanvas),
  { ssr: false }
)

interface TicketQRActionsProps {
  ticketId: string
  qrCode: string
  eventTitle: string
  eventDate: string
  eventLocation: string
}

export default function TicketQRActions({
  ticketId,
  qrCode,
  eventTitle,
  eventDate,
  eventLocation,
}: TicketQRActionsProps) {
  const [showQR, setShowQR] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const verifyUrl = `${appUrl}/verify/${qrCode}`
  const canvasId = `qr-dl-${ticketId}`

  const handleShowQR = () => {
    setShowQR(true)
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      // Try capturing the canvas if QR dialog is open
      let dataUrl: string | null = null

      const canvas = document.getElementById(canvasId) as HTMLCanvasElement | null
      if (canvas) {
        dataUrl = canvas.toDataURL('image/png')
      } else {
        // Fall back to API
        const res = await fetch(`/api/tickets/${ticketId}`)
        if (res.ok) {
          const data = await res.json()
          dataUrl = data.ticket?.qrCodeImage ?? null
        }
      }

      if (dataUrl) {
        const link = document.createElement('a')
        link.href = dataUrl
        link.download = `ticket-qr-${qrCode.slice(-8)}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      }
    } catch (err) {
      console.error('Error downloading QR:', err)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleShowQR}>
        <QrCode className="h-4 w-4 mr-2" />
        Código QR
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleDownload}
        disabled={downloading}
      >
        {downloading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Download className="h-4 w-4 mr-2" />
        )}
        Descargar
      </Button>

      <Dialog open={showQR} onOpenChange={setShowQR}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center space-y-2">
            <DialogTitle className="text-xl font-bold">Tu Código QR</DialogTitle>
            <DialogDescription>
              Presenta este código en la entrada del evento
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            {/* Event info */}
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-xl space-y-1 text-sm">
              <p className="font-semibold text-gray-900 dark:text-white text-base">
                {eventTitle}
              </p>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span>{eventDate}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>{eventLocation}</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center">
              <div className="p-5 bg-white rounded-2xl shadow-xl border-2 border-dashed border-blue-200">
                <QRCodeCanvas
                  id={canvasId}
                  value={verifyUrl}
                  size={220}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="H"
                  includeMargin={false}
                />
              </div>
            </div>

            <p className="text-center text-xs text-gray-500 font-mono">
              {qrCode.slice(-16)}
            </p>

            {/* Download from dialog */}
            <Button
              className="w-full"
              variant="outline"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Descargar imagen
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
