"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface VenueFormData {
  name: string;
  description: string;
  address: string;
  capacity: number;
}

export default function CreateVenuePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<VenueFormData>({
    name: "",
    description: "",
    address: "",
    capacity: 0,
  });

  const handleInputChange = (field: keyof VenueFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("El nombre del venue es requerido");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/venues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Error al crear el venue");
      }

      const venue = await response.json();
      
      toast.success("Venue creado exitosamente");
      
      // Redirigir al editor de asientos del venue
      router.push(`/organizer/venues/${venue.id}/editor`);
      
    } catch (error) {
      console.error("Error creating venue:", error);
      toast.error("Error al crear el venue. Inténtalo nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/organizer/venues">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Venue</h1>
          <p className="text-muted-foreground">
            Configura la información básica y luego diseña el layout de asientos
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Venue</CardTitle>
          <CardDescription>
            Completa los datos básicos del venue. Después podrás configurar el layout de asientos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del Venue *</Label>
              <Input
                id="name"
                placeholder="Ej: Teatro Municipal, Centro de Convenciones..."
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Describe el venue, sus características principales..."
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
              />
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <Label htmlFor="address">Dirección</Label>
              <Input
                id="address"
                placeholder="Dirección completa del venue"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
              />
            </div>

            {/* Capacidad */}
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacidad Total</Label>
              <Input
                id="capacity"
                type="number"
                placeholder="Número máximo de personas"
                value={formData.capacity || ""}
                onChange={(e) => handleInputChange("capacity", parseInt(e.target.value) || 0)}
                min="1"
              />
              <p className="text-xs text-muted-foreground">
                Este número se ajustará automáticamente según los asientos que configures
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Crear y Configurar Asientos
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/organizer/venues">
                  Cancelar
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-2">Próximos pasos</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>1. Completa la información básica del venue</p>
            <p>2. Diseña el layout usando el editor visual de asientos</p>
            <p>3. Crea secciones y configura los asientos</p>
            <p>4. Usa este venue en tus eventos futuros</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
