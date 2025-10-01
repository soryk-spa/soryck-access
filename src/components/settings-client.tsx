"use client";

import { useState } from "react";
import { useUpdateSettings } from "@/hooks/useUpdateSettings";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  User,
  Bell,
  Palette,
  Shield,
  CreditCard,
  Settings,
  Camera,
  Mail,
  Lock,
  Monitor,
  Moon,
  Sun,
  Smartphone,
  Eye,
  Save,
  Upload,
  Trash2,
  CheckCircle,
  Info,
} from "lucide-react";

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  producerName: string;
  websiteUrl: string;
  twitterUrl: string;
  instagramUrl: string;
  avatar?: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  eventReminders: boolean;
  marketingEmails: boolean;
  securityAlerts: boolean;
  weeklyReports: boolean;
}

interface AppearanceSettings {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  currency: string;
  dateFormat: string;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordLastChanged: string;
}

export function SettingsClient({
  initialUserData,
  userRole,
}: {
  initialUserData: UserData;
  userRole: string;
}) {
  const [userData, setUserData] = useState<UserData>(initialUserData);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    eventReminders: true,
    marketingEmails: false,
    securityAlerts: true,
    weeklyReports: true,
  });
  
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    theme: "system",
    language: "es",
    timezone: "America/Santiago",
    currency: "CLP",
    dateFormat: "DD/MM/YYYY",
  });

  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    sessionTimeout: 30,
    passwordLastChanged: "2024-01-15",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const { updateSettings, loading, error: updateError, success } = useUpdateSettings();

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateSettings({
        firstName: userData.firstName,
        lastName: userData.lastName,
        bio: userData.bio,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header con gradiente */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              ⚙️ Configuración
            </h1>
            <p className="text-blue-100 mt-2">
              Gestiona tu cuenta y preferencias de la plataforma
            </p>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              {userRole}
            </Badge>
            <Button 
              onClick={handleSave} 
              disabled={saving || loading}
              variant="secondary"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                Guardando...
              </>
            ) : saved ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Guardado
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
          </div>
        </div>
      </div>

      {/* Mobile save button */}
      <div className="md:hidden">
        <Button 
          onClick={handleSave} 
          disabled={saving || loading}
          className="w-full"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
              Guardando...
            </>
          ) : saved ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Guardado
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </>
          )}
        </Button>
      </div>

      {(saved || success) && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Configuración guardada exitosamente.
          </AlertDescription>
        </Alert>
      )}

      {updateError && (
        <Alert variant="destructive">
          <AlertDescription>
            Error al guardar: {updateError}
          </AlertDescription>
        </Alert>
      )}

      {}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificaciones</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Apariencia</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Seguridad</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Facturación</span>
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Avanzado</span>
          </TabsTrigger>
        </TabsList>

        {}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
              <CardDescription>
                Actualiza tu información de perfil y foto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={userData.avatar} alt={userData.firstName} />
                  <AvatarFallback className="text-lg">
                    {userData.firstName?.[0]}{userData.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Cambiar Foto
                  </Button>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              </div>

              <Separator />

              {}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    value={userData.firstName}
                    onChange={(e) => setUserData({...userData, firstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Apellido</Label>
                  <Input
                    id="lastName"
                    value={userData.lastName}
                    onChange={(e) => setUserData({...userData, lastName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userData.email}
                    onChange={(e) => setUserData({...userData, email: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="producerName">Nombre del Productor</Label>
                  <Input
                    id="producerName"
                    value={userData.producerName || ''}
                    onChange={(e) => setUserData({...userData, producerName: e.target.value})}
                    placeholder="Nombre de tu empresa o marca"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="websiteUrl">Sitio Web</Label>
                  <Input
                    id="websiteUrl"
                    type="url"
                    value={userData.websiteUrl || ''}
                    onChange={(e) => setUserData({...userData, websiteUrl: e.target.value})}
                    placeholder="https://www.ejemplo.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitterUrl">Twitter</Label>
                  <Input
                    id="twitterUrl"
                    type="url"
                    value={userData.twitterUrl || ''}
                    onChange={(e) => setUserData({...userData, twitterUrl: e.target.value})}
                    placeholder="https://twitter.com/usuario"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagramUrl">Instagram</Label>
                  <Input
                    id="instagramUrl"
                    type="url"
                    value={userData.instagramUrl || ''}
                    onChange={(e) => setUserData({...userData, instagramUrl: e.target.value})}
                    placeholder="https://instagram.com/usuario"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Biografía</Label>
                <Textarea
                  id="bio"
                  value={userData.bio}
                  onChange={(e) => setUserData({...userData, bio: e.target.value})}
                  placeholder="Cuéntanos sobre ti..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferencias de Notificaciones</CardTitle>
              <CardDescription>
                Controla cómo y cuándo recibes notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <Label>Notificaciones por Email</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Recibe actualizaciones importantes por correo
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked: boolean) => 
                      setNotifications({...notifications, emailNotifications: checked})
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4" />
                      <Label>Notificaciones Push</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Recibe notificaciones en tiempo real
                    </p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked: boolean) => 
                      setNotifications({...notifications, pushNotifications: checked})
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Recordatorios de Eventos</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones antes de tus eventos
                    </p>
                  </div>
                  <Switch
                    checked={notifications.eventReminders}
                    onCheckedChange={(checked: boolean) => 
                      setNotifications({...notifications, eventReminders: checked})
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Emails de Marketing</Label>
                    <p className="text-sm text-muted-foreground">
                      Novedades, tips y promociones
                    </p>
                  </div>
                  <Switch
                    checked={notifications.marketingEmails}
                    onCheckedChange={(checked: boolean) => 
                      setNotifications({...notifications, marketingEmails: checked})
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <Label>Alertas de Seguridad</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones sobre actividad de seguridad
                    </p>
                  </div>
                  <Switch
                    checked={notifications.securityAlerts}
                    onCheckedChange={(checked: boolean) => 
                      setNotifications({...notifications, securityAlerts: checked})
                    }
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Reportes Semanales</Label>
                    <p className="text-sm text-muted-foreground">
                      Resumen de actividad semanal
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked: boolean) => 
                      setNotifications({...notifications, weeklyReports: checked})
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {}
        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Apariencia y Preferencias</CardTitle>
              <CardDescription>
                Personaliza la interfaz según tus preferencias
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      variant={appearance.theme === "light" ? "default" : "outline"}
                      onClick={() => setAppearance({...appearance, theme: "light"})}
                      className="flex items-center space-x-2"
                    >
                      <Sun className="h-4 w-4" />
                      <span>Claro</span>
                    </Button>
                    <Button
                      variant={appearance.theme === "dark" ? "default" : "outline"}
                      onClick={() => setAppearance({...appearance, theme: "dark"})}
                      className="flex items-center space-x-2"
                    >
                      <Moon className="h-4 w-4" />
                      <span>Oscuro</span>
                    </Button>
                    <Button
                      variant={appearance.theme === "system" ? "default" : "outline"}
                      onClick={() => setAppearance({...appearance, theme: "system"})}
                      className="flex items-center space-x-2"
                    >
                      <Monitor className="h-4 w-4" />
                      <span>Sistema</span>
                    </Button>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="language">Idioma</Label>
                    <Select
                      value={appearance.language}
                      onValueChange={(value) => setAppearance({...appearance, language: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="pt">Português</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Zona Horaria</Label>
                    <Select
                      value={appearance.timezone}
                      onValueChange={(value) => setAppearance({...appearance, timezone: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Santiago">Santiago (GMT-3)</SelectItem>
                        <SelectItem value="America/Buenos_Aires">Buenos Aires (GMT-3)</SelectItem>
                        <SelectItem value="America/Lima">Lima (GMT-5)</SelectItem>
                        <SelectItem value="America/Bogota">Bogotá (GMT-5)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Moneda</Label>
                    <Select
                      value={appearance.currency}
                      onValueChange={(value) => setAppearance({...appearance, currency: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CLP">CLP - Peso Chileno</SelectItem>
                        <SelectItem value="USD">USD - Dólar Americano</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="ARS">ARS - Peso Argentino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Formato de Fecha</Label>
                    <Select
                      value={appearance.dateFormat}
                      onValueChange={(value) => setAppearance({...appearance, dateFormat: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad de la Cuenta</CardTitle>
              <CardDescription>
                Mantén tu cuenta segura y protegida
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <Label>Autenticación de Dos Factores</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Agrega una capa extra de seguridad a tu cuenta
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={security.twoFactorEnabled}
                      onCheckedChange={(checked: boolean) => 
                        setSecurity({...security, twoFactorEnabled: checked})
                      }
                    />
                    {security.twoFactorEnabled && (
                      <Badge variant="secondary">Activado</Badge>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Cambiar Contraseña</Label>
                  <p className="text-sm text-muted-foreground">
                    Última actualización: {security.passwordLastChanged}
                  </p>
                  <Button variant="outline">
                    <Lock className="h-4 w-4 mr-2" />
                    Cambiar Contraseña
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Tiempo de Sesión (minutos)</Label>
                  <Select
                    value={security.sessionTimeout.toString()}
                    onValueChange={(value) => 
                      setSecurity({...security, sessionTimeout: parseInt(value)})
                    }
                  >
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutos</SelectItem>
                      <SelectItem value="30">30 minutos</SelectItem>
                      <SelectItem value="60">1 hora</SelectItem>
                      <SelectItem value="120">2 horas</SelectItem>
                      <SelectItem value="480">8 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Sesiones Activas</Label>
                  <p className="text-sm text-muted-foreground">
                    Gestiona las sesiones activas en tus dispositivos
                  </p>
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Sesiones Activas
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Facturación y Pagos</CardTitle>
              <CardDescription>
                Gestiona tus métodos de pago y configuración de comisiones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Esta funcionalidad estará disponible próximamente.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Métodos de Pago</Label>
                  <p className="text-sm text-muted-foreground">
                    Configura tus métodos de pago para recibir ingresos
                  </p>
                  <Button variant="outline" disabled>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Agregar Método de Pago
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Configuración de Comisiones</Label>
                  <p className="text-sm text-muted-foreground">
                    Revisa las comisiones aplicadas a tus transacciones
                  </p>
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span>Comisión por transacción:</span>
                      <Badge>3.5%</Badge>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Historial de Pagos</Label>
                  <p className="text-sm text-muted-foreground">
                    Revisa el historial de tus pagos y comisiones
                  </p>
                  <Button variant="outline" disabled>
                    <Upload className="h-4 w-4 mr-2" />
                    Ver Historial
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración Avanzada</CardTitle>
              <CardDescription>
                Configuraciones técnicas y opciones avanzadas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Exportar Datos</Label>
                  <p className="text-sm text-muted-foreground">
                    Descarga una copia de todos tus datos
                  </p>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Solicitar Exportación
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>API y Integraciones</Label>
                  <p className="text-sm text-muted-foreground">
                    Gestiona claves API y configuraciones de integración
                  </p>
                  <Button variant="outline" disabled>
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar API
                  </Button>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-destructive">Zona de Peligro</Label>
                  <p className="text-sm text-muted-foreground">
                    Acciones irreversibles que afectan tu cuenta
                  </p>
                  <div className="space-y-2">
                    <Button variant="destructive" disabled>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Eliminar Cuenta
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
