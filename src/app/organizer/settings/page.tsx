import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { Settings } from "lucide-react";

export const metadata: Metadata = {
  title: "Configuración de Asientos | SorykPass",
  description: "Configuración del sistema de asientos",
};

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Ajusta las preferencias del sistema de asientos
        </p>
      </div>

      {/* Coming Soon */}
      <Card className="text-center py-12">
        <CardContent>
          <Settings className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <CardTitle className="mb-2">Configuración Avanzada</CardTitle>
          <CardDescription>
            Esta sección estará disponible próximamente con opciones para configurar 
            comportamientos predeterminados, colores de secciones, y más.
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
