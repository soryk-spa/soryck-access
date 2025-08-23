import { Metadata } from "next";
import Link from "next/link";
import { 
  HelpCircle, 
  Search, 
  BookOpen, 
  Video, 
  MessageSquare,
  ArrowLeft,
  ChevronRight,
  Users,
  Calendar,
  CreditCard,
  BarChart3,
  Ticket,
  QrCode,
  Mail,
  ExternalLink,
  Download,
  Play
} from "lucide-react";

export const metadata: Metadata = {
  title: "Centro de Ayuda | SorykPass",
  description: "Centro de ayuda de SorykPass. Encuentra guías, tutoriales y respuestas a las preguntas más frecuentes sobre nuestra plataforma.",
  keywords: "ayuda, soporte, guías, tutoriales, FAQ, SorykPass, help center",
};

export default function HelpPage() {
  const helpCategories = [
    {
      icon: Calendar,
      title: "Gestión de Eventos",
      description: "Aprende a crear, configurar y gestionar tus eventos",
      articles: [
        { title: "Cómo crear tu primer evento", link: "#" },
        { title: "Configurar tipos de tickets", link: "#" },
        { title: "Gestionar fechas y horarios", link: "#" },
        { title: "Subir imágenes y contenido", link: "#" }
      ]
    },
    {
      icon: Ticket,
      title: "Venta de Tickets",
      description: "Todo sobre la venta y distribución de entradas",
      articles: [
        { title: "Configurar precios y promociones", link: "#" },
        { title: "Códigos promocionales", link: "#" },
        { title: "Límites de venta", link: "#" },
        { title: "Reportes de ventas", link: "#" }
      ]
    },
    {
      icon: QrCode,
      title: "Verificación y Acceso",
      description: "Sistema de verificación y control de acceso",
      articles: [
        { title: "Escanear códigos QR", link: "#" },
        { title: "Configurar usuarios escaneadores", link: "#" },
        { title: "Reportes de asistencia", link: "#" },
        { title: "Solucionar problemas de escaneo", link: "#" }
      ]
    },
    {
      icon: CreditCard,
      title: "Pagos y Facturación",
      description: "Gestión de pagos, comisiones y facturación",
      articles: [
        { title: "Métodos de pago disponibles", link: "#" },
        { title: "Configurar comisiones", link: "#" },
        { title: "Retiros y transferencias", link: "#" },
        { title: "Facturas y reportes financieros", link: "#" }
      ]
    },
    {
      icon: Users,
      title: "Cuenta y Perfil",
      description: "Configuración de cuenta y perfil de organizador",
      articles: [
        { title: "Completar perfil de organizador", link: "#" },
        { title: "Verificar identidad", link: "#" },
        { title: "Cambiar contraseña", link: "#" },
        { title: "Configuraciones de notificaciones", link: "#" }
      ]
    },
    {
      icon: BarChart3,
      title: "Reportes y Análisis",
      description: "Analiza el rendimiento de tus eventos",
      articles: [
        { title: "Dashboard de eventos", link: "#" },
        { title: "Métricas de ventas", link: "#" },
        { title: "Análisis de audiencia", link: "#" },
        { title: "Exportar datos", link: "#" }
      ]
    }
  ];

  const quickActions = [
    {
      icon: Video,
      title: "Video Tutoriales",
      description: "Aprende visualmente con nuestros tutoriales",
      link: "#",
      color: "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
    },
    {
      icon: Download,
      title: "Descargar Guías",
      description: "Guías en PDF para uso offline",
      link: "#",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
    },
    {
      icon: MessageSquare,
      title: "Chat en Vivo",
      description: "Habla con nuestro equipo de soporte",
      link: "#",
      color: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
    },
    {
      icon: Mail,
      title: "Contactar Soporte",
      description: "Envía un mensaje a nuestro equipo",
      link: "/contact",
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-400"
    }
  ];

  const popularArticles = [
    "Cómo crear tu primer evento en SorykPass",
    "Configurar códigos promocionales",
    "Verificar tickets con código QR",
    "Configurar comisiones y retiros",
    "Solucionar problemas de pago"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver al inicio
            </Link>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Centro de Ayuda
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Encuentra respuestas y aprende a usar SorykPass
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Search className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              ¿En qué podemos ayudarte?
            </h2>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar en el centro de ayuda..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              href={action.link}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
            >
              <div className={`p-3 rounded-lg ${action.color} w-fit mb-4`}>
                <action.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {action.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {action.description}
              </p>
              <div className="flex items-center gap-1 mt-3 text-blue-600 dark:text-blue-400">
                <span className="text-sm font-medium">Acceder</span>
                <ChevronRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>

        {/* Help Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {helpCategories.map((category, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <category.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {category.description}
                  </p>
                </div>
              </div>
              
              <div className="space-y-2">
                {category.articles.map((article, articleIndex) => (
                  <Link
                    key={articleIndex}
                    href={article.link}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors group"
                  >
                    <span className="text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {article.title}
                    </span>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                  </Link>
                ))}
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="#"
                  className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium"
                >
                  Ver todos los artículos
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Popular Articles */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Artículos Populares
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {popularArticles.map((article, index) => (
              <Link
                key={index}
                href="#"
                className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
              >
                <div className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-lg p-2 text-sm font-bold min-w-fit">
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    {article}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    Guía paso a paso
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <Play className="h-6 w-6" />
            <h2 className="text-2xl font-bold">
              ¿Nuevo en SorykPass?
            </h2>
          </div>
          <p className="text-blue-100 mb-6 max-w-2xl">
            Comienza tu journey con nuestro tutorial interactivo. Te guiaremos paso a paso 
            para crear tu primer evento y vender tus primeros tickets.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="#"
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2 w-fit"
            >
              <Play className="h-4 w-4" />
              Comenzar Tutorial
            </Link>
            <Link
              href="/contact"
              className="border border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors flex items-center gap-2 w-fit"
            >
              <MessageSquare className="h-4 w-4" />
              Hablar con Soporte
            </Link>
          </div>
        </div>

        {/* Still Need Help */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="text-center">
            <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg w-fit mx-auto mb-4">
              <MessageSquare className="h-6 w-6 text-gray-600 dark:text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              ¿Aún necesitas ayuda?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
              No encontraste lo que buscabas? Nuestro equipo de soporte está aquí para ayudarte.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 w-fit mx-auto"
              >
                <Mail className="h-4 w-4" />
                Contactar Soporte
              </Link>
              <button className="border border-blue-600 text-blue-600 dark:text-blue-400 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors flex items-center gap-2 w-fit mx-auto">
                <MessageSquare className="h-4 w-4" />
                Chat en Vivo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
