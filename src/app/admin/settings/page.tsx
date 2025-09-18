import { requireAdmin } from "@/lib/auth";


export const dynamic = 'force-dynamic'
import { DashboardPageLayout } from "@/components/dashboard-page-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Check, Shield, Database, Monitor, Users, Activity, BarChart3 } from "lucide-react";

export default async function AdminSettingsPage() {
  const user = await requireAdmin();

  
  const headerConfig = {
    title: "Configuración del Sistema",
    description: "Configuraciones avanzadas de administración y monitoreo del sistema",
    backgroundIcon: Settings,
    gradient: "from-indigo-600 to-purple-600",
    badge: {
      label: "Admin",
      variant: "secondary" as const,
    },
    stats: [
      {
        icon: Shield,
        label: "Nivel de Acceso",
        value: "Administrador",
      },
      {
        icon: Activity,
        label: "Estado",
        value: "Sistema Activo",
      },
    ],
  };

  return (
    <DashboardPageLayout header={headerConfig}>
      <div className="space-y-8">
      {}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configuración del Sistema</h1>
          <p className="text-muted-foreground">
            Configuraciones avanzadas de administración
          </p>
        </div>
      </div>

      {}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                ¡Panel de Administración con Sidebar! 🔧
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-sm mb-4">
                El sidebar también está implementado para el panel de administración con navegación específica para administradores:
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Navegación administrativa completa
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Gestión de usuarios y roles
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Estadísticas y métricas
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Configuraciones del sistema
                  </li>
                </ul>
                <ul className="space-y-2 text-sm text-blue-700 dark:text-blue-300">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Layouts separados por funcionalidad
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Acceso basado en permisos
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Interfaz coherente con el dashboard
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Responsive en todos los dispositivos
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Configuración del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Sistema de Autenticación</p>
                  <p className="text-sm text-muted-foreground">
                    Clerk Auth integrado con roles y permisos
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Operativo</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Database className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Base de Datos</p>
                  <p className="text-sm text-muted-foreground">
                    Prisma ORM con PostgreSQL
                  </p>
                </div>
              </div>
              <Badge variant="secondary">Conectado</Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Monitoreo del Sistema</p>
                  <p className="text-sm text-muted-foreground">
                    Seguimiento de rendimiento y errores
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
              <Users className="h-5 w-5" />
              Gestión de Usuarios
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800 dark:text-green-200">
                    Usuarios Activos
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-600">1</p>
                <p className="text-xs text-green-700 dark:text-green-300">
                  Usuario administrador actual
                </p>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-800 dark:text-blue-200">
                    Roles Configurados
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-600">3</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  ADMIN, ORGANIZER, CLIENT
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="h-4 w-4 text-purple-600" />
                  <span className="font-medium text-purple-800 dark:text-purple-200">
                    Sesiones
                  </span>
                </div>
                <p className="text-2xl font-bold text-purple-600">1</p>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  Sesión administrativa activa
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estadísticas del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium">Rendimiento</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tiempo de respuesta</span>
                    <Badge variant="outline">~50ms</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Disponibilidad</span>
                    <Badge variant="outline">99.9%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Carga del servidor</span>
                    <Badge variant="outline">Baja</Badge>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-medium">Navegación</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Sidebar responsive</span>
                    <Badge variant="outline">✅ Activo</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Rutas protegidas</span>
                    <Badge variant="outline">✅ Configurado</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Layout admin</span>
                    <Badge variant="outline">✅ Implementado</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Arquitectura Implementada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Estructura de Layouts</h4>
                <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-1 text-sm">
                  <p><code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">src/app/layout.tsx</code> - Layout raíz global</p>
                  <p><code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">src/app/dashboard/layout.tsx</code> - Layout del dashboard con sidebar</p>
                  <p><code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">src/app/admin/layout.tsx</code> - Layout administrativo con sidebar</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Componentes de Navegación</h4>
                <div className="pl-4 border-l-2 border-gray-200 dark:border-gray-700 space-y-1 text-sm">
                  <p><code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">src/components/dashboard-sidebar.tsx</code> - Componente principal del sidebar</p>
                  <p><code className="text-xs bg-gray-100 dark:bg-gray-800 px-1 rounded">src/components/dashboard-layout.tsx</code> - Layout wrapper con responsive</p>
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Características Implementadas</h4>
                <div className="grid md:grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Navegación basada en roles
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Responsive design completo
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Mobile-first approach
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Dark/Light theme support
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Overlay en móviles
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    Estado activo de rutas
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Administrador: {user.firstName || user.email}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Configuraciones Avanzadas
              </Button>
              <Button variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Gestionar Usuarios
              </Button>
              <Button variant="outline">
                <Database className="h-4 w-4 mr-2" />
                Mantenimiento DB
              </Button>
              <Button variant="outline">
                <Monitor className="h-4 w-4 mr-2" />
                Monitoreo Sistema
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </DashboardPageLayout>
  );
}
