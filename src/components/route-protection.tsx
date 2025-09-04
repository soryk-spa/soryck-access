"use client";

import { useRouter } from "next/navigation";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, ArrowLeft } from "lucide-react";

interface RouteProtectionProps {
  children: React.ReactNode;
  requiredRole: "ORGANIZER" | "SCANNER" | "ADMIN";
  fallbackPath?: string;
}

export default function RouteProtection({ 
  children, 
  requiredRole, 
  fallbackPath = "/dashboard" 
}: RouteProtectionProps) {
  const { role, loading, error } = useUserRole();
  const router = useRouter();

  const hasPermission = () => {
    if (role === "ADMIN") return true; 
    if (requiredRole === "ORGANIZER" && (role === "ORGANIZER" || role === "SCANNER")) return true;
    if (requiredRole === "SCANNER" && role === "SCANNER") return true;
    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="max-w-md mx-auto mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Error de Verificación
          </CardTitle>
          <CardDescription>
            No se pudo verificar tus permisos de acceso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} className="w-full">
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!hasPermission()) {
    const roleMessages = {
      ORGANIZER: {
        title: "Acceso Restringido a Organizadores",
        description: "Esta sección está disponible solo para usuarios con rol de Organizador.",
        suggestion: "Solicita acceso como organizador para gestionar eventos y códigos promocionales."
      },
      SCANNER: {
        title: "Acceso Restringido a Escáneres",
        description: "Esta sección está disponible solo para usuarios con rol de Escáner.",
        suggestion: "Contacta con un administrador para obtener permisos de escáner."
      },
      ADMIN: {
        title: "Acceso Restringido a Administradores",
        description: "Esta sección está disponible solo para administradores del sistema.",
        suggestion: "Solo los administradores pueden acceder a esta funcionalidad."
      }
    };

    const message = roleMessages[requiredRole];

    return (
      <div className="max-w-2xl mx-auto mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-600">
              <Shield className="h-5 w-5" />
              {message.title}
            </CardTitle>
            <CardDescription>
              Tu rol actual: <span className="font-medium capitalize">{role.toLowerCase()}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800 mb-2">{message.description}</p>
              <p className="text-sm text-amber-700">{message.suggestion}</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => router.push(fallbackPath)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al Dashboard
              </Button>
              
              {requiredRole === "ORGANIZER" && (
                <Button onClick={() => router.push("/dashboard/upgrade")}>
                  Solicitar Acceso como Organizador
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
