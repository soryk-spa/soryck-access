'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Users,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Ticket,
  Calendar,
  Mail,
  Hash,
} from 'lucide-react'

interface TicketType {
  id: string
  name: string
  price: number
  currency: string
}

interface TicketEntry {
  id: string
  qrCode: string
  isUsed: boolean
  status: string
  createdAt: string
  user: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
  }
  event: {
    id: string
    title: string
    startDate: string
  }
  ticketType: TicketType | null
  order: {
    id: string
    orderNumber: string
    totalAmount: number
    currency: string
    status: string
    createdAt: string
  }
}

interface EventOption {
  id: string
  title: string
  startDate: string
}

interface BuyersResponse {
  tickets: TicketEntry[]
  total: number
  page: number
  limit: number
  totalPages: number
  events: EventOption[]
}

function formatCLP(amount: number, currency = 'CLP') {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateStr: string) {
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

export default function OrganizerBuyers() {
  const [data, setData] = useState<BuyersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [selectedEvent, setSelectedEvent] = useState<string>('all')
  const [page, setPage] = useState(1)

  const fetchBuyers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '50',
      })
      if (selectedEvent !== 'all') {
        params.set('eventId', selectedEvent)
      }
      const res = await fetch(`/api/organizer/buyers?${params.toString()}`)
      if (!res.ok) {
        const json = await res.json()
        throw new Error(json.error || 'Error al cargar compradores')
      }
      const json: BuyersResponse = await res.json()
      setData(json)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [page, selectedEvent])

  useEffect(() => {
    fetchBuyers()
  }, [fetchBuyers])

  // Reset page when filter changes
  useEffect(() => {
    setPage(1)
  }, [selectedEvent])

  const filteredTickets = data?.tickets.filter((t) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    const fullName = `${t.user.firstName ?? ''} ${t.user.lastName ?? ''}`.toLowerCase()
    return (
      fullName.includes(q) ||
      t.user.email.toLowerCase().includes(q) ||
      t.order.orderNumber.toLowerCase().includes(q) ||
      t.event.title.toLowerCase().includes(q) ||
      (t.ticketType?.name ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] rounded-xl flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Compradores</h1>
            <p className="text-muted-foreground text-sm">
              Usuarios que han comprado tickets para tus eventos
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchBuyers}
          disabled={loading}
          className="self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats */}
      {data && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#0053CC]/10 to-[#01CBFE]/10 rounded-lg flex items-center justify-center">
                  <Ticket className="h-5 w-5 text-[#0053CC]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.total}</p>
                  <p className="text-xs text-muted-foreground">Tickets vendidos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#CC66CC]/10 to-[#FE4F00]/10 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-[#CC66CC]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {new Set(data.tickets.map((t) => t.user.id)).size}
                  </p>
                  <p className="text-xs text-muted-foreground">Compradores únicos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-[#FE4F00]/10 to-[#FDBD00]/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-[#FE4F00]" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.events.length}</p>
                  <p className="text-xs text-muted-foreground">Eventos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, email, orden o ticket..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger className="sm:w-64">
                <SelectValue placeholder="Todos los eventos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los eventos</SelectItem>
                {data?.events.map((ev) => (
                  <SelectItem key={ev.id} value={ev.id}>
                    {ev.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="border-0 shadow-md overflow-hidden">
        <CardHeader className="pb-0">
          <CardTitle className="text-base flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            Lista de tickets comprados
          </CardTitle>
          <CardDescription>
            {filteredTickets ? `${filteredTickets.length} resultado(s)` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          {error && (
            <div className="p-6 text-center text-red-500">
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={fetchBuyers} className="mt-3">
                Reintentar
              </Button>
            </div>
          )}

          {loading && !data && (
            <div className="p-12 text-center text-muted-foreground">
              <RefreshCw className="h-8 w-8 mx-auto mb-3 animate-spin text-[#0053CC]" />
              <p>Cargando compradores...</p>
            </div>
          )}

          {!loading && filteredTickets && filteredTickets.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium">No hay compradores aún</p>
              <p className="text-sm mt-1">
                {search || selectedEvent !== 'all'
                  ? 'Ningún resultado coincide con los filtros.'
                  : 'Cuando alguien compre un ticket, aparecerá aquí.'}
              </p>
            </div>
          )}

          {filteredTickets && filteredTickets.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> Comprador
                      </span>
                    </TableHead>
                    <TableHead>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> Evento
                      </span>
                    </TableHead>
                    <TableHead>
                      <span className="flex items-center gap-1">
                        <Ticket className="h-3 w-3" /> Tipo de ticket
                      </span>
                    </TableHead>
                    <TableHead>
                      <span className="flex items-center gap-1">
                        <Hash className="h-3 w-3" /> Orden
                      </span>
                    </TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha compra</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => {
                    const fullName =
                      [ticket.user.firstName, ticket.user.lastName]
                        .filter(Boolean)
                        .join(' ') || 'Sin nombre'

                    return (
                      <TableRow key={ticket.id} className="hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="font-medium text-sm">{fullName}</p>
                            <p className="text-xs text-muted-foreground">{ticket.user.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">{ticket.event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(ticket.event.startDate)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          {ticket.ticketType ? (
                            <Badge
                              variant="secondary"
                              className="bg-gradient-to-r from-[#0053CC]/10 to-[#01CBFE]/10 text-[#0053CC] border-[#0053CC]/20"
                            >
                              {ticket.ticketType.name}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">General</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-mono text-muted-foreground">
                            #{ticket.order.orderNumber}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">
                            {ticket.ticketType
                              ? formatCLP(ticket.ticketType.price, ticket.ticketType.currency)
                              : formatCLP(ticket.order.totalAmount / ticket.order.totalAmount, ticket.order.currency)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={ticket.isUsed ? 'secondary' : 'default'}
                            className={
                              ticket.isUsed
                                ? 'bg-gray-100 text-gray-600'
                                : 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0'
                            }
                          >
                            {ticket.isUsed ? 'Usado' : 'Activo'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(ticket.order.createdAt)}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <p className="text-sm text-muted-foreground">
                Página {data.page} de {data.totalPages} &bull; {data.total} tickets
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
                  disabled={page === data.totalPages || loading}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
