'use client'

import { useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Calendar,
  MapPin,
  QrCode,
  RefreshCw,
  Maximize2,
  CheckCircle,
  XCircle,
  Ticket,
  Clock,
} from 'lucide-react'

const QRCodeCanvas = dynamic(
  () => import('qrcode.react').then((mod) => mod.QRCodeCanvas),
  { ssr: false }
)

interface TicketItem {
  id: string
  qrCode: string
  isUsed: boolean
  usedAt: string | null
  status: string
  event: {
    id: string
    title: string
    startDate: string
    endDate: string | null
    location: string
    imageUrl: string | null
  }
  order: {
    id: string
    orderNumber: string
    totalAmount: number
    currency: string
  } | null
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('es-CL', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Santiago',
  }).format(new Date(dateStr))
}

function isEventPast(endDate: string | null, startDate: string) {
  const ref = endDate ?? startDate
  return new Date(ref) < new Date()
}

export default function MisQRsView() {
  const [tickets, setTickets] = useState<TicketItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [fullscreen, setFullscreen] = useState<TicketItem | null>(null)

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    (typeof window !== 'undefined' ? window.location.origin : '')

  const fetchTickets = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/user/tickets')
      if (!res.ok) throw new Error('Error cargando tickets')
      const data = await res.json()
      setTickets(data.tickets ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTickets()
  }, [fetchTickets])

  const visibleTickets = showAll
    ? tickets
    : tickets.filter(
        (t) =>
          t.status === 'ACTIVE' &&
          !t.isUsed &&
          !isEventPast(t.event.endDate, t.event.startDate)
      )

  const activeCount = tickets.filter(
    (t) =>
      t.status === 'ACTIVE' &&
      !t.isUsed &&
      !isEventPast(t.event.endDate, t.event.startDate)
  ).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0053CC]/5 via-[#01CBFE]/5 to-[#CC66CC]/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] rounded-xl flex items-center justify-center">
              <QrCode className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Mis QRs</h1>
              <p className="text-muted-foreground text-sm">
                Muestra tu código QR al validador para ingresar
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchTickets}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Button
              variant={showAll ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowAll((v) => !v)}
            >
              <Ticket className="h-4 w-4 mr-2" />
              {showAll ? 'Solo activos' : `Ver todos (${tickets.length})`}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="flex flex-col items-center gap-3 text-muted-foreground">
              <RefreshCw className="h-8 w-8 animate-spin text-[#0053CC]" />
              <p>Cargando tickets...</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && visibleTickets.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <div className="w-20 h-20 mx-auto bg-muted rounded-full flex items-center justify-center">
              <Ticket className="h-10 w-10 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-lg">
                {showAll ? 'No tienes tickets' : 'No tienes tickets activos'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {!showAll && activeCount === 0 && tickets.length > 0
                  ? 'Todos tus tickets han sido usados o expirado.'
                  : 'Compra entradas para ver tus QRs aquí.'}
              </p>
            </div>
            {!showAll && tickets.length > 0 && (
              <Button variant="outline" onClick={() => setShowAll(true)}>
                Ver todos los tickets ({tickets.length})
              </Button>
            )}
          </div>
        )}

        {/* Tickets grid */}
        {!loading && visibleTickets.length > 0 && (
          <>
            <p className="text-sm text-muted-foreground">
              {showAll
                ? `${visibleTickets.length} ticket${visibleTickets.length !== 1 ? 's' : ''} en total`
                : `${activeCount} ticket${activeCount !== 1 ? 's' : ''} activo${activeCount !== 1 ? 's' : ''} — Toca el QR para agrandarlo`}
            </p>

            <div className="grid gap-6 sm:grid-cols-2">
              {visibleTickets.map((ticket) => {
                const verifyUrl = `${appUrl}/verify/${ticket.qrCode}`
                const past = isEventPast(ticket.event.endDate, ticket.event.startDate)
                const active = ticket.status === 'ACTIVE' && !ticket.isUsed && !past

                return (
                  <Card
                    key={ticket.id}
                    className={`border-0 shadow-lg overflow-hidden transition-all duration-300 ${
                      active ? 'hover:shadow-xl hover:scale-[1.02]' : 'opacity-70'
                    }`}
                  >
                    {/* Event color bar */}
                    <div
                      className={`h-1.5 w-full ${
                        active
                          ? 'bg-gradient-to-r from-[#0053CC] to-[#01CBFE]'
                          : ticket.isUsed
                          ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                          : 'bg-gradient-to-r from-orange-400 to-red-400'
                      }`}
                    />

                    <CardHeader className="pb-2 pt-4">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base leading-tight line-clamp-2">
                          {ticket.event.title}
                        </CardTitle>
                        <Badge
                          className={`flex-shrink-0 border-0 text-white ${
                            active
                              ? 'bg-gradient-to-r from-green-500 to-green-600'
                              : ticket.isUsed
                              ? 'bg-gray-400'
                              : past
                              ? 'bg-orange-400'
                              : 'bg-gray-400'
                          }`}
                        >
                          {active ? (
                            <><CheckCircle className="h-3 w-3 mr-1" />Activo</>
                          ) : ticket.isUsed ? (
                            <><XCircle className="h-3 w-3 mr-1" />Usado</>
                          ) : past ? (
                            <><Clock className="h-3 w-3 mr-1" />Expirado</>
                          ) : (
                            'Inactivo'
                          )}
                        </Badge>
                      </div>

                      <div className="space-y-1 text-xs text-muted-foreground mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 flex-shrink-0" />
                          <span>{formatDate(ticket.event.startDate)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 flex-shrink-0" />
                          <span className="line-clamp-1">{ticket.event.location}</span>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {/* QR Code */}
                      <div
                        className={`flex justify-center py-4 rounded-xl bg-white border-2 relative group ${
                          active
                            ? 'border-[#0053CC]/20 cursor-pointer hover:border-[#0053CC]/50'
                            : 'border-gray-200'
                        }`}
                        onClick={() => active && setFullscreen(ticket)}
                        title={active ? 'Tocar para agrandar' : undefined}
                      >
                        <QRCodeCanvas
                          value={verifyUrl}
                          size={180}
                          level="H"
                          includeMargin={false}
                          style={{
                            opacity: active ? 1 : 0.35,
                            filter: active ? 'none' : 'grayscale(100%)',
                          }}
                        />
                        {active && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/5 rounded-xl transition-colors">
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 rounded-lg px-3 py-1.5 flex items-center gap-1.5 shadow">
                              <Maximize2 className="h-4 w-4 text-[#0053CC]" />
                              <span className="text-xs font-medium text-[#0053CC]">Agrandar</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-mono truncate max-w-[60%]">
                          #{ticket.qrCode.slice(-12)}
                        </span>
                        {ticket.order && (
                          <span>Orden {ticket.order.orderNumber}</span>
                        )}
                      </div>

                      {active && (
                        <Button
                          className="w-full bg-gradient-to-r from-[#0053CC] to-[#01CBFE] hover:from-[#0053CC]/90 hover:to-[#01CBFE]/90 text-white border-0"
                          onClick={() => setFullscreen(ticket)}
                        >
                          <Maximize2 className="h-4 w-4 mr-2" />
                          Mostrar al validador
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Fullscreen QR dialog */}
      <Dialog open={!!fullscreen} onOpenChange={(open) => !open && setFullscreen(null)}>
        <DialogContent className="bg-black border-0 max-w-sm w-full p-6 rounded-2xl">
          {fullscreen && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white text-center text-lg leading-tight">
                  {fullscreen.event.title}
                </DialogTitle>
                <p className="text-gray-400 text-center text-sm mt-1">
                  {formatDate(fullscreen.event.startDate)}
                </p>
              </DialogHeader>

              <div className="flex justify-center mt-4">
                <div className="bg-white p-4 rounded-2xl shadow-2xl">
                  <QRCodeCanvas
                    value={`${appUrl}/verify/${fullscreen.qrCode}`}
                    size={260}
                    level="H"
                    includeMargin={false}
                  />
                </div>
              </div>

              <div className="text-center mt-4 space-y-1">
                <p className="text-gray-300 text-xs font-mono">
                  {fullscreen.qrCode.slice(-16)}
                </p>
                <p className="text-gray-500 text-xs">
                  Muestra este código al personal de entrada
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
