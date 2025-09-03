"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import FeaturedEvents from "@/components/featured-events"
import Link from "next/link"
import Image from "next/image"
import { 
  Calendar, 
  Ticket, 
  Users, 
  Shield, 
  Zap, 
  Globe,
  Star,
  ChevronRight,
  CheckCircle,
  Award,
  Mail,
  Tag,
  QrCode,
  BarChart3
} from "lucide-react"

const SorykPassLogo = ({
  className = "",
  size = "default",
  variant = "auto",
}: {
  className?: string;
  size?: "sm" | "default" | "lg";
  variant?: "light" | "dark" | "auto";
}) => {
  const sizeClasses = {
    sm: "h-8 w-auto",
    default: "h-10 w-auto",
    lg: "h-12 w-auto",
  };

  return (
    <Link
      href="/"
      className={`transition-transform hover:scale-105 ${className}`}
    >
      {variant === "auto" ? (
        <>
          <Image
            src="/sorykpass_horizontal_black.png"
            alt="SorykPass"
            width={200}
            height={40}
            className={`${sizeClasses[size]} dark:hidden`}
            priority
          />
          <Image
            src="/sorykpass_horizontal_white.png"
            alt="SorykPass"
            width={200}
            height={40}
            className={`${sizeClasses[size]} hidden dark:block`}
            priority
          />
        </>
      ) : (
        <Image
          src={variant === "dark" ? "/logo/logo-white.svg" : "/logo/logo.svg"}
          alt="SorykPass"
          width={200}
          height={40}
          className={sizeClasses[size]}
          priority
        />
      )}
    </Link>
  );
};

export default function Homepage() {
  const features = [
    {
      icon: Calendar,
      title: "Gestión Completa de Eventos",
      description: "Crea eventos con tipos de tickets, precios dinámicos y gestión de asientos visuales para venues.",
      gradient: "from-[#FDBD00] to-[#FE4F00]"
    },
    {
      icon: Ticket,
      title: "Códigos QR Únicos",
      description: "Tickets seguros con QR único, validación en tiempo real y control de accesos múltiples.",
      gradient: "from-[#FE4F00] to-[#CC66CC]"
    },
    {
      icon: Users,
      title: "Sistema de Validadores",
      description: "Asigna scanners a eventos, valida entradas en tiempo real y controla accesos múltiples.",
      gradient: "from-[#CC66CC] to-[#0053CC]"
    },
    {
      icon: Shield,
      title: "Códigos Promocionales Avanzados",
      description: "Descuentos por porcentaje, monto fijo, tickets gratuitos e invitaciones de cortesía.",
      gradient: "from-[#0053CC] to-[#01CBFE]"
    },
    {
      icon: Zap,
      title: "Gestión de Comisiones",
      description: "Control transparente de comisiones por evento, pagos automáticos y reportes detallados.",
      gradient: "from-[#01CBFE] to-[#FDBD00]"
    },
    {
      icon: Globe,
      title: "Editor Visual de Asientos",
      description: "Diseña layouts de venues, gestiona secciones VIP y optimiza la distribución de asientos.",
      gradient: "from-[#FDBD00] to-[#CC66CC]"
    }
  ]

  const testimonials = [
    {
      name: "María González",
      role: "Organizadora de Eventos",
      company: "EventPro",
      content: "Los códigos promocionales y el sistema de comisiones me ahorraron horas. La validación QR es súper práctica.",
      rating: 5
    },
    {
      name: "Carlos Mendoza",
      role: "Director de Venue",
      company: "Centro de Convenciones",
      content: "El editor de asientos visual y la gestión de validadores transformó completamente nuestra operación.",
      rating: 5
    },
    {
      name: "Ana Rodríguez",
      role: "Coordinadora de Festivales",
      company: "Festivales Chile",
      content: "La validación QR y los códigos promocionales funcionan perfecto. Solo pagamos 6% de comisión cuando vendemos.",
      rating: 5
    }
  ]

  const pricingPlans = [
    {
      name: "Cliente",
      price: "Gratis",
      description: "Para asistentes a eventos",
      features: [
        "Compra de tickets sin costo extra",
        "Tickets con QR únicos",
        "Historial completo de eventos",
        "Soporte en línea",
        "Aplicación de códigos promocionales"
      ],
      cta: "Registrarse Gratis",
      popular: false,
      commission: null,
      gradient: "from-[#01CBFE] to-[#0053CC]"
    },
    {
      name: "Organizador",
      price: "Solo 6% por venta",
      description: "Para creadores de eventos",
      features: [
        "Eventos y venues ilimitados",
        "Editor visual de asientos",
        "Códigos promocionales avanzados",
        "Sistema de validadores QR",
        "Gestión de comisiones",
        "Sin costos fijos mensuales"
      ],
      cta: "Comenzar Ahora",
      popular: true,
      commission: "6%",
      gradient: "from-[#FDBD00] to-[#FE4F00]"
    },
    {
      name: "Empresarial",
      price: "Solo 6% por venta",
      description: "Para organizaciones grandes",
      features: [
        "API personalizada disponible",
        "Integración con sistemas ERP",
        "Reportes personalizados",
        "Soporte 24/7 dedicado",
        "Gerente de cuenta personal",
        "Configuraciones enterprise"
      ],
      cta: "Contactar Ventas",
      popular: false,
      commission: "6%",
      gradient: "from-[#CC66CC] to-[#0053CC]"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section Mejorado */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/30 to-cyan-50/20 dark:from-gray-900 dark:via-blue-950/20 dark:to-gray-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] rounded-full opacity-10 blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-32 h-32 bg-gradient-to-r from-[#FE4F00] to-[#CC66CC] rounded-full opacity-10 blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-20 w-24 h-24 bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] rounded-full opacity-10 blur-xl animate-pulse delay-500"></div>

        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center py-20 lg:py-28">
            
            {/* Left Column - Content */}
            <div className="text-center lg:text-left space-y-8">
              {/* Logo */}
              <div className="inline-block lg:mx-0 mx-auto">
                <SorykPassLogo size="lg" />
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#0053CC]/10 to-[#01CBFE]/10 border border-[#0053CC]/20 rounded-full text-sm font-medium text-[#0053CC] dark:text-[#01CBFE]">
                <div className="w-2 h-2 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] rounded-full animate-pulse"></div>
                Sistema completo de eventos
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tighter leading-tight">
                  <span className="block text-foreground">Eventos que</span>
                  <span className="block bg-gradient-to-r from-[#0053CC] via-[#01CBFE] to-[#0053CC] bg-clip-text text-transparent animate-gradient">
                    se organizan solos
                  </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto lg:mx-0 font-light leading-relaxed">
                  La plataforma que combina{" "}
                  <span className="font-semibold text-foreground">códigos QR únicos</span>,{" "}
                  <span className="font-semibold text-foreground">validación automática</span> y{" "}
                  <span className="font-semibold text-foreground">gestión visual de asientos</span>
                  {" "}en una sola herramienta.
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 py-6 border-t border-b border-border/20">
                <div className="text-center lg:text-left">
                  <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#0053CC] to-[#01CBFE] bg-clip-text text-transparent">
                    6%
                  </div>
                  <div className="text-sm text-muted-foreground">Solo cuando vendes</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#FE4F00] to-[#CC66CC] bg-clip-text text-transparent">
                    QR
                  </div>
                  <div className="text-sm text-muted-foreground">Validación única</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] bg-clip-text text-transparent">
                    0$
                  </div>
                  <div className="text-sm text-muted-foreground">Costos fijos</div>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  size="lg"
                  asChild
                  className="group relative min-w-[240px] h-14 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] hover:from-[#0053CC]/90 hover:to-[#01CBFE]/90 text-white shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <Link href="/events/create">
                    <span className="relative z-10 flex items-center justify-center gap-2 font-semibold">
                      Crear Mi Primer Evento
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  </Link>
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="min-w-[200px] h-14 border-2 border-[#0053CC]/20 hover:border-[#0053CC]/40 hover:bg-[#0053CC]/5 transition-all duration-300"
                >
                  <Link href="/events" className="flex items-center gap-2 font-semibold">
                    <Calendar className="w-5 h-5" />
                    Ver Demo en Vivo
                  </Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-6">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Sin configuración
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Eventos ilimitados
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Gratis hasta vender
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative lg:pl-8">
              {/* Main Dashboard Mockup */}
              <div className="relative">
                {/* Background Glow */}
                <div className="absolute -inset-8 bg-gradient-to-r from-[#0053CC]/20 via-[#01CBFE]/20 to-[#FDBD00]/20 rounded-3xl blur-2xl opacity-60"></div>
                
                {/* Dashboard Container */}
                <div className="relative bg-background/80 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-[#0053CC] to-[#01CBFE] p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                          <Ticket className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-semibold text-sm">Mi Evento</div>
                          <div className="text-white/70 text-xs">En vivo ahora</div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                        <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                        <div className="w-2 h-2 bg-white/30 rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-4 rounded-xl border border-green-200/50 dark:border-green-800/50">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">347</div>
                        <div className="text-xs text-green-600/70 dark:text-green-400/70">Tickets Vendidos</div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-800/50">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">$850K</div>
                        <div className="text-xs text-blue-600/70 dark:text-blue-400/70">Ingresos Totales</div>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 rounded-xl border">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-semibold">Validación QR</div>
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      </div>
                      <div className="w-16 h-16 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <QrCode className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>

                    {/* Promo Codes */}
                    <div className="space-y-2">
                      <div className="text-sm font-semibold">Códigos Promocionales</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Códigos Activos</span>
                          <span className="font-semibold">12</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div className="bg-gradient-to-r from-[#FE4F00] to-[#CC66CC] h-1.5 rounded-full w-3/4"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Features */}
                <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#FE4F00] to-[#CC66CC] rounded-lg flex items-center justify-center">
                      <Tag className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold">Promo Codes</div>
                      <div className="text-xs text-muted-foreground">Avanzados</div>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold">Scanners</div>
                      <div className="text-xs text-muted-foreground">Validadores</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FeaturedEvents />
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="mb-4 border-[#CC66CC] text-[#0053CC]"
            >
              Características
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Todo lo que necesitas para
              <span className="bg-gradient-to-r from-[#FE4F00] to-[#CC66CC] bg-clip-text text-transparent">
                {" "}
                eventos exitosos
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Desde la publicación hasta el análisis post-evento, nuestras
              herramientas están diseñadas para que solo te preocupes de una
              cosa: crear una experiencia inolvidable.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800"
              >
                <CardContent className="p-0">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Nueva sección de funcionalidades técnicas */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-800 dark:to-blue-950/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="mb-4 border-[#0053CC] text-[#0053CC]"
            >
              Tecnología Avanzada
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Funcionalidades que 
              <span className="bg-gradient-to-r from-[#0053CC] to-[#01CBFE] bg-clip-text text-transparent">
                {" "}
                realmente importan
              </span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#FE4F00] to-[#CC66CC] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Tag className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Códigos Promocionales Inteligentes</h3>
                  <p className="text-muted-foreground">
                    Descuentos por porcentaje, monto fijo o tickets completamente gratis. 
                    Sistema de invitaciones de cortesía y límites de uso configurables.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] rounded-xl flex items-center justify-center flex-shrink-0">
                  <QrCode className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Validación QR Automática</h3>
                  <p className="text-muted-foreground">
                    Asigna validadores a eventos específicos. Escaneo en tiempo real 
                    con detección de duplicados y control de horarios de acceso.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] rounded-xl flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Sistema de Comisiones</h3>
                  <p className="text-muted-foreground">
                    Control transparente de comisiones por evento, reportes detallados 
                    de ventas, seguimiento de códigos promocionales y gestión de pagos.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative h-80 lg:h-[400px] w-full">
              <div className="absolute -inset-2 bg-gradient-to-br from-[#0053CC] via-[#01CBFE] to-[#FDBD00] rounded-2xl opacity-20 blur-xl"></div>
              <Card className="relative h-full bg-background/95 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6 h-full flex flex-col justify-center">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Ventas en tiempo real</span>
                      <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        +127 tickets
                      </Badge>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Tickets VIP</span>
                        <span className="font-semibold">$45,000</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-[#FE4F00] to-[#CC66CC] h-2 rounded-full w-3/4"></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-2xl font-bold text-[#0053CC]">15.3%</p>
                        <p className="text-xs text-muted-foreground">Conversión</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-[#01CBFE]">$12,450</p>
                        <p className="text-xs text-muted-foreground">Promedio/ticket</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gradient-to-br from-[#01CBFE]/5 to-[#0053CC]/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="mb-4 border-[#01CBFE] text-[#0053CC]"
            >
              Testimonios
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Organizadores que confían en
              <span className="bg-gradient-to-r from-[#01CBFE] to-[#0053CC] bg-clip-text text-transparent">
                {" "}
                SorykPass
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-xl transition-all duration-300 bg-background border-l-4 border-l-[#01CBFE]"
              >
                <CardContent className="p-0">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-[#FDBD00] text-[#FDBD00]"
                      />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">
                    &quot;{testimonial.content}&quot;
                  </p>
                  <div>
                    <div className="font-semibold text-[#0053CC]">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role} • {testimonial.company}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="mb-4 border-[#FE4F00] text-[#0053CC]"
            >
              Precios
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Un precio
              <span className="bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] bg-clip-text text-transparent">
                {" "}
                simple y transparente
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Sin costos fijos ni mensualidades. Solo cobramos 6% de comisión 
              cuando vendas un ticket. Si tu evento es gratuito, también lo es 
              usar SorykPass. Incluye validación QR, códigos promocionales y editor visual.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`p-6 relative hover:shadow-xl transition-all duration-300 ${
                  plan.popular ? "border-2 scale-105 shadow-xl" : "border"
                }`}
                style={
                  plan.popular
                    ? {
                        borderImage:
                          "linear-gradient(135deg, #FDBD00, #FE4F00, #CC66CC) 1",
                      }
                    : {}
                }
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] text-white shadow-lg">
                      <Award className="h-3 w-3 mr-1" />
                      Más Popular
                    </Badge>
                  </div>
                )}
                <CardContent className="p-0">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div
                      className={`text-3xl font-bold mb-2 ${plan.popular ? "bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] bg-clip-text text-transparent" : "text-[#0053CC]"}`}
                    >
                      {plan.price}
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                    {plan.commission && (
                      <Badge
                        variant="outline"
                        className="mt-2 border-[#01CBFE] text-[#0053CC]"
                      >
                        {plan.commission} comisión por venta
                      </Badge>
                    )}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li
                        key={featureIndex}
                        className="flex items-center gap-3"
                      >
                        <CheckCircle className="h-4 w-4 text-[#01CBFE] flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] hover:from-[#FDBD00]/90 hover:to-[#FE4F00]/90"
                        : "bg-gradient-to-r from-[#0053CC] to-[#01CBFE] hover:from-[#0053CC]/90 hover:to-[#01CBFE]/90"
                    }`}
                    asChild
                  >
                    <Link href="/sign-up">{plan.cta}</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24 bg-gradient-to-br from-[#0053CC] via-[#CC66CC] to-[#01CBFE] text-white relative overflow-hidden">
        <div className="absolute top-10 right-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>

        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            ¿Listo para tu primer evento profesional?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Únete a organizadores que ya están usando validación QR, editor visual, 
            códigos promocionales y sistema de comisiones. Solo pagas cuando vendes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="secondary"
              asChild
              className="min-w-[200px] bg-white text-[#0053CC] hover:bg-white/90"
            >
              <Link href="/sign-up">
                Regístrate Gratis
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
      <section>
        <div className="bg-gradient-to-r from-[#FDBD00]/10 to-[#01CBFE]/10">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-2xl font-bold mb-4 text-[#0053CC]">
                Mantente al día con SorykPass
              </h3>
              <p className="text-muted-foreground mb-6">
                Recibe las últimas actualizaciones, consejos para organizadores
                y casos de éxito directamente en tu inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="flex-1 px-4 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#01CBFE] focus:border-transparent"
                />
                <Button className="bg-gradient-to-r from-[#0053CC] to-[#01CBFE]">
                  <Mail className="w-4 h-4 mr-2" />
                  Suscribirse
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Sin spam. Cancela cuando quieras.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}