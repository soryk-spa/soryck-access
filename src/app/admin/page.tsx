import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { RoleManagement } from '@/components/role-management'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, Ticket, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

type EventWithDetails = {
  id: string
  title: string
  startDate: Date
  location: string
  isPublished: boolean
  createdAt: Date
  organizer: {
    firstName: string | null
    lastName: string | null
    email: string
  }
  category: {
    name: string
  }
  _count: {
    tickets: number
    orders: number
  }
}

export default async function AdminPage() {
  const currentUser = await requireAdmin()
  const [
    totalUsers,
    totalEvents,
    totalTickets,
    totalOrders,
    users,
    usersByRole,
    recentEvents
  ] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.ticket.count(),
    prisma.order.count(),
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true
      },
      orderBy: [
        { role: 'desc' },
        { createdAt: 'desc' }
      ]
    }),
    prisma.user.groupBy({
      by: ['role'],
      _count: {
        role: true
      }
    }),
    prisma.event.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        organizer: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        },
        category: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            tickets: true,
            orders: true
          }
        }
      }
    })
  ])

  const roleStats = usersByRole.reduce((acc, item) => {
    acc[item.role] = item._count.role
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">
          Panel de Administración
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestiona usuarios, eventos y configuración del sistema
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Usuarios
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <div className="text-xs text-muted-foreground">
              {roleStats.ADMIN || 0} admins, {roleStats.ORGANIZER || 0} organizadores, {roleStats.CLIENT || 0} clientes
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Eventos
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Eventos creados en la plataforma
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tickets
            </CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              Tickets vendidos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Órdenes
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Órdenes procesadas
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        <RoleManagement 
          users={users} 
          currentUserRole={currentUser.role}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Contenido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/admin/categories">
                <Calendar className="w-4 h-4 mr-2" />
                Gestionar Categorías
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/events">
                <Calendar className="w-4 h-4 mr-2" />
                Gestionar Eventos
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Herramientas de Sistema</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/sync-users">
                <Users className="w-4 h-4 mr-2" />
                Sincronizar Usuarios
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/settings">
                <DollarSign className="w-4 h-4 mr-2" />
                Configuración
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Eventos Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(recentEvents as EventWithDetails[]).map((event) => (
              <div 
                key={event.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">{event.title}</div>
                  <div className="text-sm text-muted-foreground">
                    Organizador: {event.organizer.firstName || event.organizer.email}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Categoría: {event.category.name}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(event.startDate).toLocaleDateString()} - {event.location}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium">
                    {event._count.tickets} tickets vendidos
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {event._count.orders} órdenes
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {event.isPublished ? 'Publicado' : 'Borrador'}
                  </div>
                </div>
              </div>
            ))}
            
            {recentEvents.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay eventos creados aún
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}