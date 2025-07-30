"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import FeaturedEvents from "@/components/featured-events"
import Link from "next/link"
import { 
  Calendar, 
  Ticket, 
  Users, 
  Shield, 
  Zap, 
  Globe,
  Star,
  ChevronRight,
  Play,
  CheckCircle,
  Award,
  Clock,
  Mail
} from "lucide-react"
const SorykPassLogo = () => (
  <div className="flex items-center space-x-3">
    <div className="relative w-10 h-10">
      <div className="absolute inset-0 bg-gradient-to-br from-[#FDBD00] via-[#FE4F00] to-[#01CBFE] rounded-lg transform rotate-12"></div>
      <div className="absolute inset-1 bg-background rounded-md flex items-center justify-center">
        <span className="text-lg font-bold bg-gradient-to-r from-[#0053CC] to-[#01CBFE] bg-clip-text text-transparent">S</span>
      </div>
    </div>
    <span className="font-bold text-2xl text-foreground tracking-tight">
      SORYKPASS
    </span>
  </div>
)

export default function Homepage() {
  const features = [
    {
      icon: Calendar,
      title: "Gestión Completa de Eventos",
      description: "Crea, organiza y gestiona eventos de cualquier tamaño con herramientas profesionales.",
      gradient: "from-[#FDBD00] to-[#FE4F00]"
    },
    {
      icon: Ticket,
      title: "Venta de Tickets Segura",
      description: "Sistema de tickets con QR único, validación en tiempo real y procesamiento seguro de pagos.",
      gradient: "from-[#FE4F00] to-[#CC66CC]"
    },
    {
      icon: Users,
      title: "Sistema de Roles Avanzado",
      description: "Organizadores, clientes y administradores con permisos específicos para cada rol.",
      gradient: "from-[#CC66CC] to-[#0053CC]"
    },
    {
      icon: Shield,
      title: "Seguridad Garantizada",
      description: "Autenticación robusta, encriptación de datos y protección contra fraudes.",
      gradient: "from-[#0053CC] to-[#01CBFE]"
    },
    {
      icon: Zap,
      title: "Dashboard en Tiempo Real",
      description: "Estadísticas en vivo, métricas de ventas y análisis de participación.",
      gradient: "from-[#01CBFE] to-[#FDBD00]"
    },
    {
      icon: Globe,
      title: "Acceso Global",
      description: "Plataforma disponible 24/7 desde cualquier dispositivo y ubicación.",
      gradient: "from-[#FDBD00] to-[#CC66CC]"
    }
  ]

  const testimonials = [
    {
      name: "María González",
      role: "Organizadora de Eventos",
      company: "EventPro",
      content: "SorykPass revolucionó la forma en que organizamos eventos. La plataforma es intuitiva y poderosa.",
      rating: 5
    },
    {
      name: "Carlos Mendoza",
      role: "Director de Marketing",
      company: "Tech Conferences",
      content: "El sistema de roles y la gestión de tickets nos ahorraron horas de trabajo. Altamente recomendado.",
      rating: 5
    },
    {
      name: "Ana Rodríguez",
      role: "Coordinadora de Eventos",
      company: "Cultural Events",
      content: "La seguridad y facilidad de uso de SorykPass nos dieron la confianza para eventos masivos.",
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
        "Gestión de órdenes",
        "Historial de eventos",
        "Soporte básico",
        "Tickets con código QR"
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
        "Eventos ilimitados",
        "Dashboard con estadísticas",
        "Procesamiento de pagos seguro",
        "Códigos QR únicos",
        "Soporte prioritario",
        "Sin costos mensuales"
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
        "Comisión reducida al 6%",
        "API personalizada",
        "Integración con sistemas",
        "Soporte 24/7 dedicado",
        "Gerente de cuenta personal",
        "Reportes avanzados"
      ],
      cta: "Contactar Ventas",
      popular: false,
      commission: "6%",
      gradient: "from-[#CC66CC] to-[#0053CC]"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#01CBFE]/10 via-[#0053CC]/5 to-[#CC66CC]/10"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-[#FDBD00] to-[#FE4F00] rounded-full opacity-20 blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-[#CC66CC] to-[#0053CC] rounded-full opacity-20 blur-xl"></div>
        <div className="container mx-auto px-4 py-24 sm:py-32 relative">
          <div className="text-center">
            <Badge variant="outline" className="mb-6 text-sm border-[#01CBFE] text-[#0053CC]">
              ✨ La Puerta de Entrada al Presente
            </Badge>
            <div className="flex justify-center mb-8">
              <SorykPassLogo />
            </div>
            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-gradient-to-r from-[#0053CC] via-[#CC66CC] to-[#01CBFE] bg-clip-text text-transparent">
                El Futuro de los Eventos
              </span>
              <br />
              <span className="text-foreground">
                Es Digital
              </span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              Un sistema ágil, confiable y sin fricciones, donde el pase digital 
              se vuelve parte natural del día a día. Más que una marca: es la puerta de entrada al presente.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button size="lg" asChild className="min-w-[200px] bg-gradient-to-r from-[#0053CC] to-[#01CBFE] hover:from-[#0053CC]/90 hover:to-[#01CBFE]/90">
                <Link href="/sign-up">
                  Comenzar Gratis
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="min-w-[200px] border-[#0053CC] text-[#0053CC] hover:bg-[#0053CC] hover:text-white">
                <Play className="mr-2 h-4 w-4" />
                Ver Demo
              </Button>
            </div>
            
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#01CBFE]" />
                Setup en 5 minutos
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#01CBFE]" />
                Solo pagas cuando vendes
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#01CBFE]" />
                Soporte 24/7
              </div>
            </div>
          </div>
        </div>
      </section>
      <FeaturedEvents />
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-[#CC66CC] text-[#0053CC]">
              Características
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Todo lo que necesitas para
              <span className="bg-gradient-to-r from-[#FE4F00] to-[#CC66CC] bg-clip-text text-transparent"> eventos exitosos</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Herramientas profesionales diseñadas para organizadores que buscan la excelencia
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                <CardContent className="p-0">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mb-6 shadow-lg`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24 bg-gradient-to-br from-[#01CBFE]/5 to-[#0053CC]/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 border-[#01CBFE] text-[#0053CC]">
              Testimonios
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Organizadores que confían en
              <span className="bg-gradient-to-r from-[#01CBFE] to-[#0053CC] bg-clip-text text-transparent"> SorykPass</span>
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-xl transition-all duration-300 bg-background border-l-4 border-l-[#01CBFE]">
                <CardContent className="p-0">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-[#FDBD00] text-[#FDBD00]" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 italic">&quot;{testimonial.content}&quot;</p>
                  <div>
                    <div className="font-semibold text-[#0053CC]">{testimonial.name}</div>
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
            <Badge variant="outline" className="mb-4 border-[#FE4F00] text-[#0053CC]">
              Precios
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Solo cobramos cuando
              <span className="bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] bg-clip-text text-transparent"> tú vendes</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Sin costos mensuales ni suscripciones. Únicamente una pequeña comisión por cada ticket vendido.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`p-6 relative hover:shadow-xl transition-all duration-300 ${
                plan.popular 
                  ? 'border-2 scale-105 shadow-xl' 
                  : 'border'
              }`}
              style={plan.popular ? {
                borderImage: 'linear-gradient(135deg, #FDBD00, #FE4F00, #CC66CC) 1'
              } : {}}>
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
                    <div className={`text-3xl font-bold mb-2 ${plan.popular ? 'bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] bg-clip-text text-transparent' : 'text-[#0053CC]'}`}>
                      {plan.price}
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                    {plan.commission && (
                      <Badge variant="outline" className="mt-2 border-[#01CBFE] text-[#0053CC]">
                        {plan.commission} comisión por venta
                      </Badge>
                    )}
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-[#01CBFE] flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.popular 
                      ? 'bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] hover:from-[#FDBD00]/90 hover:to-[#FE4F00]/90' 
                      : 'bg-gradient-to-r from-[#0053CC] to-[#01CBFE] hover:from-[#0053CC]/90 hover:to-[#01CBFE]/90'
                    }`}
                    asChild
                  >
                    <Link href="/sign-up">
                      {plan.cta}
                    </Link>
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
            ¿Listo para crear eventos increíbles?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Únete a miles de organizadores que ya confían en SorykPass para sus eventos más importantes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="min-w-[200px] bg-white text-[#0053CC] hover:bg-white/90">
              <Link href="/sign-up">
                Comenzar Ahora
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="min-w-[200px] border-white text-white hover:bg-white hover:text-[#0053CC]">
              <Clock className="mr-2 h-4 w-4" />
              Agendar Demo
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
                Recibe las últimas actualizaciones, consejos para organizadores y casos de éxito directamente en tu inbox.
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
  )
}