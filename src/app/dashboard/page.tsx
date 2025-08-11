import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RoleRequestForm } from '@/components/role-request-form'
import { ROLE_LABELS, ROLE_COLORS, canOrganizeEvents, canAccessAdmin } from '@/lib/roles'
import { 
  Calendar, 
  Ticket, 
  DollarSign, 
  Users, 
  Plus,
  Settings,
  BarChart3
} from 'lucide-react'
import Link from 'next/link'
import QRCodeDisplay from '@/components/qr-code-display'

export default async function DashboardPage() {
  const user = await requireAuth()
  const [userStats, recentTickets, userEvents, roleRequests] = await Promise.all([
    Promise.all([
      prisma.ticket.count({
        where: { userId: user.id }
      }),
      prisma.order.count({
        where: { userId: user.id }
      }),
      canOrganizeEvents(user.role) 
        ? prisma.event.count({
            where: { organizerId: user.id }
          })
        : Promise.resolve(0),
      canOrganizeEvents(user.role)
        ? prisma.ticket.count({
            where: {
              event: {
                organizerId: user.id
              }
            }
          })
        : Promise.resolve(0)
    ]),

    prisma.ticket.findMany({
      where: { userId: user.id },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        event: {
          select: {
            title: true,
            startDate: true,
            location: true
          }
        }
      }
    }),

    canOrganizeEvents(user.role) 
      ? prisma.event.findMany({
          where: { organizerId: user.id },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            _count: {
              select: {
                tickets: true,
                orders: true
              }
            }
          }
        })
      : Promise.resolve([]),

    prisma.roleRequest.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 3
    })
  ])

  const [ticketsCount, ordersCount, eventsCount, ticketsSoldCount] = userStats

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Bienvenido, {user.firstName || user.email}
            </p>
          </div>
          <Badge className={ROLE_COLORS[user.role]}>
            {ROLE_LABELS[user.role]}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mis Tickets
            </CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketsCount}</div>
            <p className="text-xs text-muted-foreground">
              Tickets comprados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mis Órdenes
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ordersCount}</div>
            <p className="text-xs text-muted-foreground">
              Órdenes realizadas
            </p>
          </CardContent>
        </Card>

        {canOrganizeEvents(user.role) && (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Mis Eventos
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eventsCount}</div>
                <p className="text-xs text-muted-foreground">
                  Eventos creados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Tickets Vendidos
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{ticketsSoldCount}</div>
                <p className="text-xs text-muted-foreground">
                  En mis eventos
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/events">
                <Calendar className="w-4 h-4 mr-2" />
                Explorar Eventos
              </Link>
            </Button>

            {canOrganizeEvents(user.role) && (
              <Button asChild className="w-full">
                <Link href="/events/create">
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Evento
                </Link>
              </Button>
            )}

            {canAccessAdmin(user.role) && (
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin">
                  <Settings className="w-4 h-4 mr-2" />
                  Panel de Admin
                </Link>
              </Button>
            )}

            <Button asChild variant="outline" className="w-full">
              <Link href="/profile">
                <Users className="w-4 h-4 mr-2" />
                Mi Perfil
              </Link>
            </Button>
          </CardContent>
        </Card>

        {user.role === 'CLIENT' && (
          <RoleRequestForm />
        )}

        {user.role !== 'CLIENT' || recentTickets.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Mis Tickets Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{ticket.event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(ticket.event.startDate).toLocaleDateString()} - {ticket.event.location}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Ticket: {ticket.qrCode.slice(-8)}
                      </div>
                      <div className="mt-2">
                        <QRCodeDisplay qrCodeValue={ticket.qrCode} />
                      </div>
                    </div>
                    <Badge variant={ticket.isUsed ? "secondary" : "default"}>
                      {ticket.isUsed ? "Usado" : "Válido"}
                    </Badge>
                  </div>
                ))}
                
                {recentTickets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No tienes tickets aún
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : null}

        {canOrganizeEvents(user.role) && (
          <Card>
            <CardHeader>
              <CardTitle>Mis Eventos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {userEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(event.startDate).toLocaleDateString()} - {event.location}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {event._count.tickets} tickets vendidos • {event._count.orders} órdenes
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={event.isPublished ? "default" : "secondary"}>
                        {event.isPublished ? "Publicado" : "Borrador"}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {userEvents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No has creado eventos aún
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {roleRequests.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Mis Solicitudes de Rol</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roleRequests.map((request) => (
                  <div key={request.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">
                        {ROLE_LABELS[request.currentRole]} → {ROLE_LABELS[request.requestedRole]}
                      </div>
                      <Badge 
                        variant={
                          request.status === 'APPROVED' ? 'default' :
                          request.status === 'REJECTED' ? 'destructive' : 'secondary'
                        }
                      >
                        {request.status === 'PENDING' ? 'Pendiente' :
                         request.status === 'APPROVED' ? 'Aprobada' : 'Rechazada'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Solicitado: {new Date(request.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}