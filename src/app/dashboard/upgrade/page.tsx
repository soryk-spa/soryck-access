import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  Tag,
  Users,
  BarChart3,
  Star,
  Check,
  Crown,
  Zap
} from "lucide-react";

export default function UpgradePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] text-white rounded-full text-sm font-medium">
          <Crown className="h-4 w-4" />
          Hazte Organizador
        </div>
        <h1 className="text-4xl font-bold tracking-tight">
          Convierte en Organizador de Eventos
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Accede a herramientas profesionales para crear, gestionar y promocionar tus eventos
        </p>
      </div>

      {}
      <div className="grid md:grid-cols-2 gap-6">
        {}
        <Card className="relative">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Plan Cliente
              <Badge variant="outline">Tu plan actual</Badge>
            </CardTitle>
            <CardDescription>
              Perfecto para asistir a eventos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold">Gratis</div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Comprar tickets</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Ver mis tickets</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Recibir notificaciones</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {}
        <Card className="relative border-[#0053CC] shadow-lg">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-[#0053CC] to-[#01CBFE] text-white px-4 py-1">
              <Star className="h-3 w-3 mr-1" />
              Recomendado
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#0053CC]" />
              Plan Organizador
            </CardTitle>
            <CardDescription>
              Herramientas completas para eventos profesionales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-3xl font-bold text-[#0053CC]">Gratis</div>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Todo del plan Cliente</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[#0053CC]" />
                <span className="text-sm font-medium">Crear eventos ilimitados</span>
              </li>
              <li className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-[#0053CC]" />
                <span className="text-sm font-medium">Códigos promocionales</span>
              </li>
              <li className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#0053CC]" />
                <span className="text-sm font-medium">Estadísticas avanzadas</span>
              </li>
              <li className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[#0053CC]" />
                <span className="text-sm font-medium">Gestión de asistentes</span>
              </li>
            </ul>
            <Button 
              className="w-full bg-gradient-to-r from-[#0053CC] to-[#01CBFE] hover:opacity-90"
              size="lg"
            >
              <Crown className="h-4 w-4 mr-2" />
              Solicitar Acceso como Organizador
            </Button>
          </CardContent>
        </Card>
      </div>

      {}
      <Card>
        <CardHeader>
          <CardTitle>¿Qué incluye el Plan Organizador?</CardTitle>
          <CardDescription>
            Todas las herramientas que necesitas para eventos exitosos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#0053CC]" />
                <h4 className="font-medium">Gestión de Eventos</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Crea, edita y gestiona todos tus eventos desde un solo lugar
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-[#0053CC]" />
                <h4 className="font-medium">Promociones</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Crea códigos de descuento y promociones especiales
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-[#0053CC]" />
                <h4 className="font-medium">Analíticas</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Métricas detalladas de ventas y asistencia
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#0053CC]" />
                <h4 className="font-medium">Gestión de Asistentes</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Lista de asistentes y control de acceso
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-[#0053CC]" />
                <h4 className="font-medium">Perfil Público</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Página de organizador personalizable
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#0053CC]" />
                <h4 className="font-medium">Soporte Prioritario</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Asistencia técnica especializada
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      <Card>
        <CardHeader>
          <CardTitle>Preguntas Frecuentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">¿Cuánto tiempo toma la aprobación?</h4>
            <p className="text-sm text-muted-foreground">
              Normalmente procesamos las solicitudes en 1-2 días hábiles. Te notificaremos por email cuando tu cuenta sea aprobada.
            </p>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium">¿Hay algún costo?</h4>
            <p className="text-sm text-muted-foreground">
              No, el plan organizador es completamente gratuito. Solo cobramos una pequeña comisión por cada ticket vendido.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">¿Qué necesito para ser aprobado?</h4>
            <p className="text-sm text-muted-foreground">
              Una cuenta verificada y proporcionar información básica sobre el tipo de eventos que planeas organizar.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
