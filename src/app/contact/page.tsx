import { Metadata } from "next";
import Link from "next/link";
import { 
  Mail, 
  Phone,
  Send, 
  MessageCircle,
  ArrowLeft,
  ExternalLink,
  Building2,
  HeartHandshake,
  FileText,
  Shield
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contacto | SorykPass",
  description: "Ponte en contacto con el equipo de SorykPass. Soporte técnico, consultas comerciales y atención al cliente.",
  keywords: "contacto, soporte, ayuda, SorykPass, atención al cliente, support",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 dark:from-gray-900 dark:to-gray-800">
      {}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-purple-600 hover:text-purple-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver al inicio
            </Link>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Mail className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Contacto
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Estamos aquí para ayudarte con cualquier consulta
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <HeartHandshake className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Información de Contacto
                </h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Email</h3>
                    <a 
                      href="mailto:soporte@sorykpass.com" 
                      className="text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      soporte@sorykpass.com
                    </a>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Para consultas generales y soporte técnico
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Ventas y Comercial</h3>
                    <a 
                      href="mailto:ventas@sorykpass.com" 
                      className="text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      ventas@sorykpass.com
                    </a>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Para consultas comerciales y planes empresariales
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-1" />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Teléfono</h3>
                    <p className="text-gray-900 dark:text-white">+56 9 5653 2975</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Atención de lunes a viernes, 9:00 - 18:00 hrs
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <ExternalLink className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Enlaces Rápidos
                </h2>
              </div>
              
              <div className="space-y-3">
                <Link 
                  href="/help" 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-gray-900 dark:text-white">Centro de Ayuda</span>
                </Link>
                
                <Link 
                  href="/terms" 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-gray-900 dark:text-white">Términos y Condiciones</span>
                </Link>
                
                <Link 
                  href="/privacy" 
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                >
                  <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-gray-900 dark:text-white">Política de Privacidad</span>
                </Link>
              </div>
            </div>
          </div>

          {}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Send className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Envíanos un Mensaje
              </h2>
            </div>

            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tipo de Consulta
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white">
                  <option value="">Selecciona una opción</option>
                  <option value="support">Soporte Técnico</option>
                  <option value="sales">Consulta Comercial</option>
                  <option value="billing">Facturación</option>
                  <option value="feature">Solicitud de Funcionalidad</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="+56 9 1234 5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mensaje *
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Describe tu consulta o problema..."
                />
              </div>

              <button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Send className="h-4 w-4" />
                Enviar Mensaje
              </button>
            </form>

            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
              * Campos obligatorios. Nos pondremos en contacto contigo en un plazo máximo de 24 horas.
            </p>
          </div>
        </div>

        {}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                ¿Cuánto tiempo toma recibir una respuesta?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Nuestro equipo responde consultas en un plazo máximo de 24 horas durante días hábiles.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                ¿Ofrecen soporte telefónico?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sí, ofrecemos soporte telefónico de lunes a viernes de 9:00 a 18:00 hrs.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                ¿Tienen planes empresariales?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sí, contáctanos en ventas@sorykpass.com para conocer nuestros planes empresariales.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                ¿Dónde puedo encontrar más ayuda?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Visita nuestro <Link href="/help" className="text-purple-600 dark:text-purple-400 hover:underline">Centro de Ayuda</Link> para guías detalladas y tutoriales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
