import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import TicketCard from '@/components/ticket-card'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Ticket, Calendar, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default async function TicketsPage() {
  const user = await requireAuth()

  const [tickets, ticketStats] = await Promise.all([
    prisma.ticket.findMany({
      where: { userId: user.id },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            imageUrl: true,
            price: true,
            currency: true,
            isFree: true,
            organizer: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            currency: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    }),
    
    Promise.all([
      prisma.ticket.count({
        where: { userId: user.id, status: 'ACTIVE', isUsed: false }
      }),
      prisma.ticket.count({
        where: { userId: user.id, isUsed: true }
      }),
      prisma.ticket.count({
        where: { userId: user.id, status: { in: ['CANCELLED', 'REFUNDED'] } }
      })
    ])
  ])

  const [activeTickets, usedTickets, cancelledTickets] = ticketStats

  const serializedTickets = tickets.map(ticket => ({
    ...ticket,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    usedAt: ticket.usedAt?.toISOString() || null,
    event: {
      ...ticket.event,
      startDate: ticket.event.startDate.toISOString(),
      endDate: ticket.event.endDate?.toISOString() || null
    },
    order: {
      ...ticket.order,
      createdAt: ticket.order.createdAt.toISOString()
    }
  }))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Mis Tickets
        </h1>
        <p className="text-muted-foreground">
          Gestiona y accede a todos tus tickets de eventos
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Ticket className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">Total Tickets</p>
                <p className="text-2xl font-bold">{tickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div className="ml-2">
                <p className="text-sm font-medium">Válidos</p>
                <p className="text-2xl font-bold text-green-600">{activeTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div className="ml-2">
                <p className="text-sm font-medium">Usados</p>
                <p className="text-2xl font-bold text-blue-600">{usedTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-gray-600" />
              <div className="ml-2">
                <p className="text-sm font-medium">Cancelados</p>
                <p className="text-2xl font-bold text-gray-600">{cancelledTickets}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Badge variant="outline" className="cursor-pointer hover:bg-muted">
          Todos ({tickets.length})
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-muted">
          Válidos ({activeTickets})
        </Badge>
        <Badge variant="outline" className="cursor-pointer hover:bg-muted">
          Usados ({usedTickets})
        </Badge>
        {cancelledTickets > 0 && (
          <Badge variant="outline" className="cursor-pointer hover:bg-muted">
            Cancelados ({cancelledTickets})
          </Badge>
        )}
      </div>

      {serializedTickets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {serializedTickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Ticket className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No tienes tickets aún</h3>
            <p className="text-muted-foreground mb-6">
              Compra tickets para eventos y aparecerán aquí
            </p>
            <Button asChild>
              <Link href="/events">
                <Calendar className="w-4 h-4 mr-2" />
                Explorar Eventos
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}