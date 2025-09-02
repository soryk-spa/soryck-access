import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  Globe,
  Calendar,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  Save,
  CheckCircle,
  AlertCircle,
  Info,
} from "lucide-react";
import Link from "next/link";

export default async function SettingsPage() {
  const user = await requireAuth();

  // Obtener estadísticas del organizador
  const stats = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      organizedEvents: {
        select: {
          id: true,
          isPublished: true,
          startDate: true,
          _count: {
            select: { tickets: true }
          }
        }
      },
      createdVenues: {
        select: { id: true }
      },
      _count: {
        select: {
          organizedEvents: true,
          createdVenues: true,
        }
      }
    }
  });

  const totalTicketsSold = stats?.organizedEvents.reduce((sum, event) => sum + event._count.tickets, 0) || 0;
  const activeEvents = stats?.organizedEvents.filter(event => 
    event.isPublished && new Date(event.startDate) > new Date()
  ).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Configuración</h1>
          <p className="text-slate-600 mt-1">
            Gestiona tu perfil y preferencias de organizador
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Perfil del Organizador */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5" />
                <span>Perfil de Organizador</span>
              </CardTitle>
              <CardDescription>
                Información básica y datos de contacto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Información Personal */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700">Nombre</label>
                  <div className="mt-1 p-3 border border-slate-200 rounded-lg bg-slate-50">
                    {user.firstName || "No especificado"}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Apellido</label>
                  <div className="mt-1 p-3 border border-slate-200 rounded-lg bg-slate-50">
                    {user.lastName || "No especificado"}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <div className="mt-1 p-3 border border-slate-200 rounded-lg bg-slate-50">
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Información de Productor */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Información del Productor</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Nombre del Productor</label>
                    <div className="mt-1 p-3 border border-slate-200 rounded-lg bg-slate-50">
                      {user.producerName || "No especificado"}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Biografía</label>
                    <div className="mt-1 p-3 border border-slate-200 rounded-lg bg-slate-50 min-h-[80px]">
                      {user.bio || "No especificado"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Redes Sociales */}
              <div className="border-t border-slate-200 pt-6">
                <h3 className="text-lg font-medium text-slate-900 mb-4">Redes Sociales</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Sitio Web</label>
                    <div className="mt-1 p-3 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between">
                      <span>{user.websiteUrl || "No especificado"}</span>
                      {user.websiteUrl && (
                        <Link href={user.websiteUrl} target="_blank">
                          <ExternalLink className="w-4 h-4 text-slate-400" />
                        </Link>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Twitter</label>
                      <div className="mt-1 p-3 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between">
                        <span>{user.twitterUrl || "No especificado"}</span>
                        {user.twitterUrl && (
                          <Link href={user.twitterUrl} target="_blank">
                            <ExternalLink className="w-4 h-4 text-slate-400" />
                          </Link>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">Instagram</label>
                      <div className="mt-1 p-3 border border-slate-200 rounded-lg bg-slate-50 flex items-center justify-between">
                        <span>{user.instagramUrl || "No especificado"}</span>
                        {user.instagramUrl && (
                          <Link href={user.instagramUrl} target="_blank">
                            <ExternalLink className="w-4 h-4 text-slate-400" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Link href="/dashboard/organizer/settings/profile">
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Editar Perfil
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Notificaciones */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="w-5 h-5" />
                <span>Notificaciones</span>
              </CardTitle>
              <CardDescription>
                Controla qué notificaciones deseas recibir
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900">Nuevas Ventas</h4>
                    <p className="text-sm text-slate-500">Recibe notificaciones cuando se vendan tickets</p>
                  </div>
                  <Badge variant="default">Activado</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900">Recordatorios de Eventos</h4>
                    <p className="text-sm text-slate-500">Alertas antes de que inicien tus eventos</p>
                  </div>
                  <Badge variant="default">Activado</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900">Reportes Semanales</h4>
                    <p className="text-sm text-slate-500">Resumen semanal de ventas y estadísticas</p>
                  </div>
                  <Badge variant="secondary">Desactivado</Badge>
                </div>

                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <h4 className="font-medium text-slate-900">Promociones</h4>
                    <p className="text-sm text-slate-500">Información sobre nuevas funciones y ofertas</p>
                  </div>
                  <Badge variant="secondary">Desactivado</Badge>
                </div>
              </div>
              
              <div className="flex justify-end pt-4">
                <Button variant="outline">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Resumen de Cuenta */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Resumen de Cuenta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Eventos Creados</span>
                <span className="font-semibold">{stats?._count.organizedEvents || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Eventos Activos</span>
                <span className="font-semibold">{activeEvents}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Tickets Vendidos</span>
                <span className="font-semibold">{totalTicketsSold}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Venues Creados</span>
                <span className="font-semibold">{stats?._count.createdVenues || 0}</span>
              </div>
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center space-x-2">
                  <Badge variant={user.role === "ORGANIZER" ? "default" : "secondary"}>
                    {user.role === "ORGANIZER" ? "Organizador Verificado" : "Usuario"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acciones Rápidas */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/dashboard/organizer/settings/security" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Seguridad
                </Button>
              </Link>
              
              <Link href="/dashboard/organizer/settings/billing" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Facturación
                </Button>
              </Link>
              
              <Link href="/dashboard/organizer/settings/integrations" className="block">
                <Button variant="outline" className="w-full justify-start">
                  <Globe className="w-4 h-4 mr-2" />
                  Integraciones
                </Button>
              </Link>
              
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                <AlertCircle className="w-4 h-4 mr-2" />
                Eliminar Cuenta
              </Button>
            </CardContent>
          </Card>

          {/* Información de Ayuda */}
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">¿Necesitas Ayuda?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900">Centro de Ayuda</h4>
                  <p className="text-sm text-slate-600">
                    Encuentra respuestas a preguntas frecuentes
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-slate-900">Contacto</h4>
                  <p className="text-sm text-slate-600">
                    Escríbenos para soporte personalizado
                  </p>
                </div>
              </div>
              
              <div className="pt-3">
                <Button variant="outline" size="sm" className="w-full">
                  Ver Documentación
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
