import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Armchair,
  Calendar,
  MapPin,
  Plus,
  Settings,
  Shield,
  TrendingUp,
  Users,
  Zap,
  Star,
  ArrowRight,
  Sparkles,
  Mail,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard Organizador | SorykPass",
  description: "Centro de control para organizadores de eventos - Gestiona eventos, asientos y validadores",
};

export default function OrganizerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0053CC]/5 via-[#01CBFE]/5 to-[#CC66CC]/5">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0053CC] via-[#01CBFE] to-[#CC66CC] p-8 text-white">
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                    Dashboard Organizador
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                    ¡Bienvenido de vuelta!
                  </h1>
                  <p className="text-xl text-white/90 max-w-2xl">
                    Gestiona tus eventos, configura sistemas de asientos y administra validadores desde un solo lugar
                  </p>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="w-32 h-32 bg-white/10 rounded-3xl backdrop-blur-sm flex items-center justify-center">
                  <TrendingUp className="w-16 h-16 text-white" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        </section>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group overflow-hidden">
            <CardHeader className="relative z-10 pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-gradient-to-r from-[#0053CC]/10 to-[#01CBFE]/10 text-[#0053CC] border-[#0053CC]/20">
                  Principal
                </Badge>
              </div>
              <CardTitle className="text-xl">
                Mis Eventos
              </CardTitle>
              <CardDescription>
                Gestiona y configura asientos para tus eventos
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <p className="text-sm text-muted-foreground">
                Accede a todos tus eventos para configurar sistemas de asientos, gestionar ventas y más
              </p>
              <Button asChild className="w-full bg-gradient-to-r from-[#0053CC] to-[#01CBFE] hover:from-[#0053CC]/90 hover:to-[#01CBFE]/90 text-white border-0">
                <Link href="/dashboard/events">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Mis Eventos
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group overflow-hidden">
            <CardHeader className="relative z-10 pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-[#CC66CC] to-[#FE4F00] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-gradient-to-r from-[#CC66CC]/10 to-[#FE4F00]/10 text-[#CC66CC] border-[#CC66CC]/20">
                  Seguridad
                </Badge>
              </div>
              <CardTitle className="text-xl">
                Validadores
              </CardTitle>
              <CardDescription>
                Gestiona los validadores de tus eventos
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <p className="text-sm text-muted-foreground">
                Asigna y administra validadores que pueden verificar tickets en tiempo real
              </p>
              <Button asChild className="w-full bg-gradient-to-r from-[#CC66CC] to-[#FE4F00] hover:from-[#CC66CC]/90 hover:to-[#FE4F00]/90 text-white border-0">
                <Link href="/organizer/scanners">
                  <Shield className="h-4 w-4 mr-2" />
                  Gestionar Validadores
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group overflow-hidden">
            <CardHeader className="relative z-10 pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-[#FE4F00] to-[#FDBD00] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-gradient-to-r from-[#FE4F00]/10 to-[#FDBD00]/10 text-[#FE4F00] border-[#FE4F00]/20">
                  Ubicaciones
                </Badge>
              </div>
              <CardTitle className="text-xl">
                Venues
              </CardTitle>
              <CardDescription>
                Administra venues y plantillas reutilizables
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <p className="text-sm text-muted-foreground">
                Crea y gestiona venues con configuraciones de asientos reutilizables
              </p>
              <Button asChild variant="outline" className="w-full border-2 border-[#FE4F00]/30 hover:border-[#FE4F00] hover:bg-[#FE4F00]/10 transition-colors">
                <Link href="/dashboard/organizer/venues">
                  <MapPin className="h-4 w-4 mr-2" />
                  Gestionar Venues
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group overflow-hidden">
            <CardHeader className="relative z-10 pb-3">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-r from-[#01CBFE] to-[#CC66CC] rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Settings className="h-6 w-6 text-white" />
                </div>
                <Badge className="bg-gradient-to-r from-[#01CBFE]/10 to-[#CC66CC]/10 text-[#01CBFE] border-[#01CBFE]/20">
                  Sistema
                </Badge>
              </div>
              <CardTitle className="text-xl">
                Configuración
              </CardTitle>
              <CardDescription>
                Preferencias y configuración del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <p className="text-sm text-muted-foreground">
                Ajusta configuraciones predeterminadas y preferencias del organizador
              </p>
              <Button asChild variant="outline" className="w-full border-2 border-[#01CBFE]/30 hover:border-[#01CBFE] hover:bg-[#01CBFE]/10 transition-colors">
                <Link href="/organizer/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </section>

        {/* Nueva sección destacada para cortesías */}
        <section>
          <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
            <div className="bg-gradient-to-r from-[#CC66CC]/10 via-[#FE4F00]/10 to-[#FDBD00]/10 p-6">
              <CardHeader className="p-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#CC66CC] to-[#FE4F00] rounded-xl flex items-center justify-center">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        Sistema de Cortesías
                        <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                          Nuevo
                        </Badge>
                      </CardTitle>
                      <CardDescription className="text-base">
                        Gestiona invitaciones gratuitas para tus eventos
                      </CardDescription>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-20 h-20 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                      <Mail className="w-10 h-10 text-[#CC66CC]" />
                    </div>
                  </div>
                </div>
              </CardHeader>
            </div>
            <CardContent className="p-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Características principales
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Invitaciones individuales y masivas</li>
                    <li>• QR tickets enviados automáticamente por email</li>
                    <li>• Validación en tiempo real con escáner</li>
                    <li>• No requiere registro del invitado</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    Cómo usar
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>1. Ve a la gestión de tu evento</li>
                    <li>2. Habilita cortesías en configuración</li>
                    <li>3. Agrega emails de invitados</li>
                    <li>4. Los QR se envían automáticamente</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-2">
                <Button asChild className="bg-gradient-to-r from-[#CC66CC] to-[#FE4F00] hover:from-[#CC66CC]/90 hover:to-[#FE4F00]/90 text-white border-0">
                  <Link href="/dashboard/events">
                    <Calendar className="h-4 w-4 mr-2" />
                    Ver Mis Eventos
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="border-2 border-[#CC66CC]/30 hover:border-[#CC66CC] hover:bg-[#CC66CC]/10">
                  <Link href="/organizer/scanners">
                    <Users className="h-4 w-4 mr-2" />
                    Configurar Validadores
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border-0 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-[#0053CC]/10 via-[#01CBFE]/10 to-[#CC66CC]/10 p-6">
              <CardHeader className="p-0">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] rounded-xl flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      Guía de Inicio Rápido
                      <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
                        <Star className="w-3 h-3 mr-1" />
                        Nuevo
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-base mt-1">
                      Aprende a configurar tu primer sistema de asientos en 4 pasos sencillos
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </div>
            
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-[#0053CC]/5 to-[#01CBFE]/5 border border-[#0053CC]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      1
                    </div>
                    <h4 className="font-semibold text-lg">Configura un Venue</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Crea un venue con secciones y asientos que puedas reutilizar en múltiples eventos. 
                    Define capacidades, precios base y configuraciones especiales.
                  </p>
                </div>
                
                <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-[#CC66CC]/5 to-[#FE4F00]/5 border border-[#CC66CC]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#CC66CC] to-[#FE4F00] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      2
                    </div>
                    <h4 className="font-semibold text-lg">Asigna a un Evento</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Desde la gestión de eventos, asigna un venue y configura precios específicos 
                    por sección según el tipo de evento.
                  </p>
                </div>
                
                <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-[#FE4F00]/5 to-[#FDBD00]/5 border border-[#FE4F00]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#FE4F00] to-[#FDBD00] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      3
                    </div>
                    <h4 className="font-semibold text-lg">Personaliza Precios</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Ajusta precios específicos para cada sección según el tipo de evento, 
                    demanda esperada y estrategia de ventas.
                  </p>
                </div>
                
                <div className="space-y-4 p-4 rounded-xl bg-gradient-to-br from-[#01CBFE]/5 to-[#CC66CC]/5 border border-[#01CBFE]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#01CBFE] to-[#CC66CC] rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      4
                    </div>
                    <h4 className="font-semibold text-lg">Publica y Vende</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Los usuarios podrán seleccionar asientos específicos al comprar tickets. 
                    Monitorea ventas en tiempo real.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button asChild size="lg" className="bg-gradient-to-r from-[#0053CC] to-[#01CBFE] hover:from-[#0053CC]/90 hover:to-[#01CBFE]/90 text-white border-0">
                  <Link href="/dashboard/events">
                    <Calendar className="h-4 w-4 mr-2" />
                    Configurar Primer Evento
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-2 border-[#CC66CC]/30 hover:border-[#CC66CC] hover:bg-[#CC66CC]/10">
                  <Link href="/dashboard/organizer/venues">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Venue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-3">
              Características Principales
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Herramientas poderosas diseñadas para organizadores profesionales
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group text-center overflow-hidden">
              <CardContent className="relative z-10 pt-8 pb-6">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Armchair className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3">
                  Editor Visual Intuitivo
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Dibuja secciones y genera asientos con herramientas visuales fáciles de usar. 
                  Arrastrar, redimensionar y personalizar nunca fue tan simple.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Drag & Drop</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group text-center overflow-hidden">
              <CardContent className="relative z-10 pt-8 pb-6">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-[#FE4F00] to-[#FDBD00] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3">
                  Venues Reutilizables
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Crea plantillas de venues que puedes usar en múltiples eventos. 
                  Ahorra tiempo y mantén consistencia en tus configuraciones.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-[#FE4F00] to-[#FDBD00] rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Plantillas</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 group text-center overflow-hidden">
              <CardContent className="relative z-10 pt-8 pb-6">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-[#CC66CC] to-[#01CBFE] rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3">
                  Integración Completa
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Funciona perfectamente con el sistema de tickets existente. 
                  Ventas, validación y reportes en tiempo real.
                </p>
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 bg-gradient-to-r from-[#CC66CC] to-[#01CBFE] rounded-full"></div>
                  <span className="text-xs text-muted-foreground">Tiempo Real</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
