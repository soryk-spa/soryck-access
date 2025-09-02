import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Plus,
  MapPin,
  Users,
  Calendar,
  Settings,
  Edit,
  Trash2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default async function VenuesPage() {
  const user = await requireAuth();

  const venues = await prisma.venue.findMany({
    where: { createdBy: user.id },
    include: {
      _count: {
        select: { events: true }
      },
      events: {
        select: {
          title: true,
          startDate: true,
          isPublished: true,
        },
        orderBy: { startDate: "desc" },
        take: 3,
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Venues</h1>
          <p className="text-muted-foreground mt-1">
            Administra tus espacios y configuraciones de asientos
          </p>
        </div>
        <Link href="/dashboard/organizer/venues/new">
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Venue
          </Button>
        </Link>
      </div>

      {venues.length === 0 ? (
        /* Estado vacío */
        <Card className="border-dashed border-2 border-border">
          <CardContent className="p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
              <Building className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              ¡Crea tu primer venue!
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Los venues te permiten gestionar espacios, configurar asientos y organizar eventos de manera eficiente
            </p>
            <Link href="/dashboard/organizer/venues/new">
              <Button size="lg" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                <Plus className="w-5 h-5 mr-2" />
                Crear Primer Venue
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        /* Lista de venues */
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <Card key={venue.id} className="border hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Building className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{venue.name}</CardTitle>
                      <Badge variant="outline" className="mt-1">
                        {venue._count.events} eventos
                      </Badge>
                    </div>
                  </div>
                  <Link href={`/dashboard/organizer/venues/${venue.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {venue.description && (
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {venue.description}
                  </p>
                )}

                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  {venue.capacity && (
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{venue.capacity} personas</span>
                    </div>
                  )}
                  {venue.address && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate">{venue.address}</span>
                    </div>
                  )}
                </div>

                {venue.events.length > 0 && (
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Eventos Recientes</h4>
                    <div className="space-y-2">
                      {venue.events.map((event, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground truncate flex-1 mr-2">
                            {event.title}
                          </span>
                          <Badge 
                            variant={event.isPublished ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {event.isPublished ? "Publicado" : "Borrador"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-4 border-t border">
                  <Link href={`/dashboard/organizer/venues/${venue.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <ArrowRight className="w-4 h-4 mr-2" />
                      Ver Detalles
                    </Button>
                  </Link>
                  <Link href={`/dashboard/organizer/venues/${venue.id}/edit`}>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Información adicional */}
      {venues.length > 0 && (
        <Card className="border">
          <CardHeader>
            <CardTitle className="text-lg">Consejos para Venues</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <p className="text-sm text-muted-foreground">
                Configura la capacidad y layout de asientos para maximizar la experiencia de tus eventos
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <p className="text-sm text-muted-foreground">
                Usa direcciones específicas para ayudar a los asistentes a encontrar el lugar
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <p className="text-sm text-muted-foreground">
                Los venues reutilizables te ahorran tiempo al crear eventos similares
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
