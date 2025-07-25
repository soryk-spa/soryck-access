"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  TrendingUp,
  Award,
  Clock,
  Mail
} from "lucide-react"

export default function Homepage() {
  const features = [
    {
      icon: Calendar,
      title: "Gestión Completa de Eventos",
      description: "Crea, organiza y gestiona eventos de cualquier tamaño con herramientas profesionales."
    },
    {
      icon: Ticket,
      title: "Venta de Tickets Segura",
      description: "Sistema de tickets con QR único, validación en tiempo real y procesamiento seguro de pagos."
    },
    {
      icon: Users,
      title: "Sistema de Roles Avanzado",
      description: "Organizadores, clientes y administradores con permisos específicos para cada rol."
    },
    {
      icon: Shield,
      title: "Seguridad Garantizada",
      description: "Autenticación robusta, encriptación de datos y protección contra fraudes."
    },
    {
      icon: Zap,
      title: "Dashboard en Tiempo Real",
      description: "Estadísticas en vivo, métricas de ventas y análisis de participación."
    },
    {
      icon: Globe,
      title: "Acceso Global",
      description: "Plataforma disponible 24/7 desde cualquier dispositivo y ubicación."
    }
  ]

  const stats = [
    { number: "10K+", label: "Eventos Creados", icon: Calendar },
    { number: "50K+", label: "Tickets Vendidos", icon: Ticket },
    { number: "5K+", label: "Organizadores", icon: Users },
    { number: "99.9%", label: "Uptime", icon: TrendingUp }
  ]

  const testimonials = [
    {
      name: "María González",
      role: "Organizadora de Eventos",
      company: "EventPro",
      content: "Soryck Access revolucionó la forma en que organizamos eventos. La plataforma es intuitiva y poderosa.",
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
      content: "La seguridad y facilidad de uso de Soryck Access nos dieron la confianza para eventos masivos.",
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
      commission: null
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
      commission: "6%"
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
      commission: "6%"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <section className="relative bg-background">
        <div className="container mx-auto px-4 py-24 sm:py-32">
          <div className="text-center">
            <Badge variant="outline" className="mb-4 text-sm">
              ✨ Nueva Plataforma de Eventos
            </Badge>            
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-primary">
                Soryck Access
              </span>
              <br />
              <span className="text-foreground">
                El Futuro de los Eventos
              </span>
            </h1>            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Plataforma completa para crear, gestionar y vender tickets de eventos. 
              Sin costos mensuales, solo una pequeña comisión cuando vendes tickets.
            </p>            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button size="lg" asChild className="min-w-[200px]">
                <Link href="/sign-up">
                  Comenzar Gratis
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="min-w-[200px]">
                <Play className="mr-2 h-4 w-4" />
                Ver Demo
              </Button>
            </div>            
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Setup en 5 minutos
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Solo pagas cuando vendes
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Soporte 24/7
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Características
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Todo lo que necesitas para
              <span className="text-primary"> eventos exitosos</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Herramientas profesionales diseñadas para organizadores que buscan la excelencia
            </p>
          </div>      
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-0">
                  <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">
              Testimonios
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Organizadores que confían en
              <span className="text-primary"> Soryck Access</span>
            </h2>
          </div>          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow duration-300 bg-background">
                <CardContent className="p-0">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6">&quot;{testimonial.content}&quot;</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
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
            <Badge variant="outline" className="mb-4">
              Precios
            </Badge>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              Solo cobramos cuando
              <span className="text-primary"> tú vendes</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Sin costos mensuales ni suscripciones. Únicamente una pequeña comisión por cada ticket vendido.
            </p>
          </div>          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`p-6 relative hover:shadow-lg transition-shadow duration-300 ${
                plan.popular 
                  ? 'border-primary border-2 bg-primary/5' 
                  : ''
              }`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Award className="h-3 w-3 mr-1" />
                    Más Popular
                  </Badge>
                )}
                <CardContent className="p-0">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-primary mb-2">{plan.price}</div>
                    <p className="text-muted-foreground">{plan.description}</p>
                    {plan.commission && (
                      <Badge variant="outline" className="mt-2">
                        {plan.commission} comisión por venta
                      </Badge>
                    )}
                  </div>
                  
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>                  
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
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
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            ¿Listo para crear eventos increíbles?
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
            Únete a miles de organizadores que ya confían en Soryck Access para sus eventos más importantes
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="min-w-[200px]">
              <Link href="/sign-up">
                Comenzar Ahora
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="min-w-[200px] border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
              <Clock className="mr-2 h-4 w-4" />
              Agendar Demo
            </Button>
          </div>
        </div>
      </section>
      <section>
        <div className="bg-muted">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-4">
              Mantente al día con Soryck Access
            </h3>
            <p className="text-muted-foreground mb-6">
              Recibe las últimas actualizaciones, consejos para organizadores y casos de éxito directamente en tu inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-4 py-2 rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button>
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