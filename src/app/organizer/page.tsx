import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Armchair, Calendar, MapPin, Plus, Settings } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Gestión de Asientos | SorykPass",
  description: "Administra venues, secciones y asientos para tus eventos",
};

export default function OrganizerPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Asientos</h1>
        <p className="text-muted-foreground">
          Configura venues, crea secciones y administra los asientos para tus eventos
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Mis Eventos */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Calendar className="h-6 w-6 text-primary mr-3" />
            <div>
              <CardTitle className="text-lg">Mis Eventos</CardTitle>
              <CardDescription>
                Ver y configurar asientos para eventos existentes
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Accede a tus eventos para configurar o editar sus sistemas de asientos
            </p>
            <Button asChild className="w-full">
              <Link href="/dashboard/events">
                <Calendar className="h-4 w-4 mr-2" />
                Ver Mis Eventos
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Crear Venue */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <MapPin className="h-6 w-6 text-primary mr-3" />
            <div>
              <CardTitle className="text-lg">Venues</CardTitle>
              <CardDescription>
                Administra tus venues y plantillas reutilizables
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Crea y gestiona venues con configuraciones de asientos reutilizables
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/organizer/venues">
                <MapPin className="h-4 w-4 mr-2" />
                Gestionar Venues
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Configuración */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Settings className="h-6 w-6 text-primary mr-3" />
            <div>
              <CardTitle className="text-lg">Configuración</CardTitle>
              <CardDescription>
                Preferencias y configuración del sistema
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Ajusta las configuraciones predeterminadas para nuevos venues
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/organizer/settings">
                <Settings className="h-4 w-4 mr-2" />
                Configuración
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started Guide */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Armchair className="h-5 w-5" />
            Guía de Inicio Rápido
          </CardTitle>
          <CardDescription>
            Aprende a configurar tu primer sistema de asientos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">1. Configura un Venue</h4>
              <p className="text-sm text-muted-foreground">
                Crea un venue con secciones y asientos que puedas reutilizar en múltiples eventos.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">2. Asigna a un Evento</h4>
              <p className="text-sm text-muted-foreground">
                Desde la gestión de eventos, asigna un venue y configura precios por sección.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">3. Personaliza Precios</h4>
              <p className="text-sm text-muted-foreground">
                Ajusta precios específicos para cada sección según el tipo de evento.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">4. Publica y Vende</h4>
              <p className="text-sm text-muted-foreground">
                Los usuarios podrán seleccionar asientos específicos al comprar tickets.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button asChild>
              <Link href="/dashboard/events">
                <Calendar className="h-4 w-4 mr-2" />
                Configurar Primer Evento
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/organizer/venues">
                <Plus className="h-4 w-4 mr-2" />
                Crear Venue
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Features Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="text-center">
          <CardContent className="pt-6">
            <Armchair className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="font-semibold mb-2">Editor Visual</h3>
            <p className="text-sm text-muted-foreground">
              Dibuja secciones y genera asientos con herramientas intuitivas
            </p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <MapPin className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="font-semibold mb-2">Venues Reutilizables</h3>
            <p className="text-sm text-muted-foreground">
              Crea plantillas que puedes usar en múltiples eventos
            </p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="pt-6">
            <Calendar className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="font-semibold mb-2">Integración Completa</h3>
            <p className="text-sm text-muted-foreground">
              Funciona perfectamente con el sistema de tickets existente
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
