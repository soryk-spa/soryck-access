import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Armchair, Plus, Building } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Administración de Venues | SorykPass Admin",
  description: "Gestión global de venues y plantillas de asientos",
};

export default function AdminVenuesPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Administración de Venues</h1>
          <p className="text-muted-foreground">
            Gestión global de venues y plantillas de asientos del sistema
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/venues/create">
            <Plus className="h-4 w-4 mr-2" />
            Crear Venue Global
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Venues Totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Armchair className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Asientos Configurados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Building className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">0</p>
                <p className="text-xs text-muted-foreground">Venues Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      <Card className="text-center py-12">
        <CardContent>
          <Building className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="mb-2">No hay venues configurados</CardTitle>
          <CardDescription className="mb-6">
            Crea venues globales que los organizadores puedan usar como plantillas
          </CardDescription>
          <Button asChild>
            <Link href="/admin/venues/create">
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Venue
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Venues Globales</h3>
            <p className="text-sm text-muted-foreground">
              Los venues globales pueden ser utilizados por cualquier organizador 
              como plantillas para sus eventos, facilitando la configuración 
              de lugares comunes.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Gestión Centralizada</h3>
            <p className="text-sm text-muted-foreground">
              Desde aquí puedes ver todos los venues del sistema, tanto los 
              creados por organizadores como los globales, y gestionar su 
              configuración.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
