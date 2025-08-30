"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Trash2, Users, Armchair } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Venue {
  id: string;
  name: string;
  description?: string;
  address?: string;
  capacity?: number;
  totalSeats: number;
  totalSections: number;
  createdAt: string;
}

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await fetch("/api/venues");
        if (response.ok) {
          const data = await response.json();
          setVenues(data);
        }
      } catch (error) {
        console.error("Error fetching venues:", error);
        toast.error("Error al cargar los venues");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVenues();
  }, []);

  const handleDeleteVenue = async (venueId: string, venueName: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el venue "${venueName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/venues/${venueId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el venue");
      }

      toast.success("Venue eliminado exitosamente");
      setVenues(venues.filter(v => v.id !== venueId));
    } catch (error) {
      console.error("Error deleting venue:", error);
      toast.error("Error al eliminar el venue");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p>Cargando venues...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Mis Venues</h1>
          <p className="text-muted-foreground">
            Gestiona tus venues y plantillas de asientos reutilizables
          </p>
        </div>
        <Button asChild>
          <Link href="/organizer/venues/create">
            <Plus className="h-4 w-4 mr-2" />
            Crear Venue
          </Link>
        </Button>
      </div>

      {venues.length === 0 ? (
        <>
          {/* Empty State */}
          <Card className="text-center py-12">
            <CardContent>
              <MapPin className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <CardTitle className="mb-2">No tienes venues configurados</CardTitle>
              <CardDescription className="mb-6">
                Crea tu primer venue para empezar a configurar sistemas de asientos reutilizables
              </CardDescription>
              <Button asChild>
                <Link href="/organizer/venues/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Mi Primer Venue
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Info Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">¿Qué es un Venue?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Un venue es una plantilla reutilizable que contiene la configuración completa 
                  de asientos para un lugar específico. Una vez creado, puedes usarlo en 
                  múltiples eventos sin tener que recrear el layout cada vez.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ventajas de los Venues</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Reutilizable en múltiples eventos</li>
                  <li>• Consistencia en la experiencia del usuario</li>
                  <li>• Ahorro de tiempo en configuración</li>
                  <li>• Facilita la gestión de lugares recurrentes</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <>
          {/* Venues Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => (
              <Card key={venue.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-1">{venue.name}</CardTitle>
                      {venue.description && (
                        <CardDescription className="line-clamp-2 mt-1">
                          {venue.description}
                        </CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Stats */}
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{venue.totalSeats} asientos</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{venue.totalSections} secciones</span>
                    </div>
                  </div>

                  {/* Address */}
                  {venue.address && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      📍 {venue.address}
                    </p>
                  )}

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    <Badge variant={venue.totalSeats > 0 ? "default" : "secondary"}>
                      {venue.totalSeats > 0 ? "Configurado" : "Sin asientos"}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/organizer/venues/${venue.id}/editor`}>
                        <Armchair className="h-4 w-4 mr-2" />
                        Editar Layout
                      </Link>
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteVenue(venue.id, venue.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Add New Venue Card */}
          <Card className="border-dashed border-2 hover:shadow-md transition-shadow">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Plus className="h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle className="mb-2">Crear Nuevo Venue</CardTitle>
              <CardDescription className="mb-4">
                Agrega otro venue para tener más opciones de asientos
              </CardDescription>
              <Button asChild>
                <Link href="/organizer/venues/create">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Venue
                </Link>
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
