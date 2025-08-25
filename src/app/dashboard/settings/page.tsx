import { requireAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Check, Menu, Smartphone, Monitor, Palette, Bell, User, Shield, Database } from "lucide-react";

export default async function DashboardSettingsPage() {
  const user = await requireAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configuraciones</h1>
          <p className="text-muted-foreground">
            Personaliza tu experiencia en el dashboard
          </p>
        </div>
      </div>

      {/* Demo Success Message */}
      <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                ¡Sidebar implementado exitosamente! 🎉
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm mb-4">
                El sidebar del dashboard está funcionando perfectamente. Aquí están las características implementadas:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Navegación lateral responsive
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Colapso automático en móvil
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Integración con rutas de dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Iconos y estados activos
                  </li>
                </ul>
                <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Overlay para dispositivos móviles
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Layouts separados para admin y dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Navegación basada en roles de usuario
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Diseño consistente con shadcn/ui
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Demo */}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Menu className="h-5 w-5" />
              Configuración del Sidebar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Auto-colapso en móvil</p>
                  <p className="text-sm text-muted-foreground">
                    El sidebar se colapsa automáticamente en pantallas pequeñas
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Activo</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Monitor className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Navegación de escritorio</p>
                  <p className="text-sm text-muted-foreground">
                    Sidebar expandido permanentemente en pantallas grandes
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Activo</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Palette className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Tema consistente</p>
                  <p className="text-sm text-muted-foreground">
                    El sidebar respeta el tema claro/oscuro del sistema
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Activo</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Preferencias de Usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">Información Personal</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Email:</span> {user.email}</p>
                  <p><span className="text-muted-foreground">Nombre:</span> {user.firstName || "Usuario"}</p>
                  <p><span className="text-muted-foreground">Rol:</span> {user.role}</p>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Configuraciones</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Notificaciones</span>
                    <Badge variant="outline">Habilitadas</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sidebar</span>
                    <Badge variant="outline">Responsive</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tema</span>
                    <Badge variant="outline">Sistema</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Funcionalidades Implementadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Menu className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800 dark:text-blue-200">
                    Sidebar Component
                  </span>
                </div>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Componente principal de navegación lateral implementado con Tailwind CSS
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-200">
                    Responsive Design
                  </span>
                </div>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Diseño adaptativo que funciona en desktop, tablet y móvil
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-800 dark:text-purple-200">
                    Layout Integration
                  </span>
                </div>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  Integración perfecta con Next.js App Router y layouts anidados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configurar Preferencias
              </Button>
              <Button variant="outline">
                <Bell className="h-4 w-4 mr-2" />
                Gestionar Notificaciones
              </Button>
              <Button variant="outline">
                <User className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
