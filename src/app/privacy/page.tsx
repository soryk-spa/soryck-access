import { Metadata } from "next";
import Link from "next/link";
import { 
  Shield, 
  Lock, 
  Eye, 
  Database, 
  UserCheck, 
  AlertTriangle,
  ArrowLeft,
  Mail,
  Phone,
  Cookie
} from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidad | SorykPass",
  description: "Política de privacidad y protección de datos de SorykPass. Conoce cómo recopilamos, usamos y protegemos tu información personal.",
  keywords: "privacidad, datos personales, protección, cookies, SorykPass, GDPR",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver al inicio
            </Link>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Shield className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Política de Privacidad
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Última actualización: 22 de agosto de 2025
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg">
          <div className="p-8 lg:p-12">
            
            {/* Introducción */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  1. Introducción
                </h2>
              </div>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  En <strong>SorykPass</strong>, nos comprometemos a proteger su privacidad y 
                  manejar sus datos personales de manera responsable y transparente. Esta Política 
                  de Privacidad explica cómo recopilamos, utilizamos, almacenamos y protegemos 
                  su información personal.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  Al utilizar nuestros servicios, usted acepta las prácticas descritas en esta política.
                </p>
              </div>
            </section>

            {/* Información que Recopilamos */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Database className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  2. Información que Recopilamos
                </h2>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    2.1 Información Personal Directa
                  </h3>
                  <div className="grid gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <ul className="list-disc list-inside space-y-2 text-blue-800 dark:text-blue-300">
                        <li>Nombre completo y datos de contacto</li>
                        <li>Dirección de correo electrónico</li>
                        <li>Número de teléfono</li>
                        <li>Información de pago y facturación</li>
                        <li>Documento de identidad (cuando sea requerido)</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    2.2 Información de Uso
                  </h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                      <li>Datos de navegación y actividad en la plataforma</li>
                      <li>Preferencias de eventos y categorías</li>
                      <li>Historial de compras y transacciones</li>
                      <li>Interacciones con otros usuarios</li>
                      <li>Logs de acceso y eventos de seguridad</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    2.3 Información Técnica
                  </h3>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <ul className="list-disc list-inside space-y-2 text-purple-800 dark:text-purple-300">
                      <li>Dirección IP y ubicación geográfica</li>
                      <li>Tipo de dispositivo y sistema operativo</li>
                      <li>Navegador web y versión</li>
                      <li>Cookies y tecnologías similares</li>
                      <li>Datos de rendimiento y errores</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Cómo Utilizamos su Información */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <UserCheck className="h-6 w-6 text-indigo-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  3. Cómo Utilizamos su Información
                </h2>
              </div>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-3">
                      Servicios Principales
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-green-700 dark:text-green-300 text-sm">
                      <li>Procesar compras de tickets</li>
                      <li>Gestionar eventos y reservas</li>
                      <li>Facilitar comunicación entre usuarios</li>
                      <li>Proporcionar soporte al cliente</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">
                      Mejoras y Seguridad
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                      <li>Mejorar funcionalidades</li>
                      <li>Detectar fraudes y abusos</li>
                      <li>Mantener seguridad de la plataforma</li>
                      <li>Analizar patrones de uso</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-3">
                      Comunicaciones
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-orange-700 dark:text-orange-300 text-sm">
                      <li>Enviar confirmaciones de compra</li>
                      <li>Notificar cambios de eventos</li>
                      <li>Compartir actualizaciones importantes</li>
                      <li>Marketing (con consentimiento)</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-3">
                      Cumplimiento Legal
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-purple-700 dark:text-purple-300 text-sm">
                      <li>Cumplir obligaciones legales</li>
                      <li>Responder a autoridades</li>
                      <li>Resolver disputas</li>
                      <li>Mantener registros contables</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Compartir Información */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="h-6 w-6 text-orange-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  4. Compartir su Información
                </h2>
              </div>
              <div className="space-y-6">
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-3">
                    Nunca vendemos sus datos personales a terceros.
                  </h4>
                  <p className="text-orange-700 dark:text-orange-300">
                    Solo compartimos información en circunstancias específicas y limitadas:
                  </p>
                </div>
                
                <div className="grid gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Con Organizadores de Eventos
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      Información necesaria para la gestión del evento (nombre, email, tipo de ticket).
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Proveedores de Servicios
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      Empresas que nos ayudan a operar (procesadores de pago, servicios de email, hosting).
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Requerimientos Legales
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">
                      Cuando sea requerido por ley o para proteger nuestros derechos legítimos.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Cookies */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Cookie className="h-6 w-6 text-amber-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  5. Cookies y Tecnologías Similares
                </h2>
              </div>
              <div className="space-y-6">
                <p className="text-gray-700 dark:text-gray-300">
                  Utilizamos cookies y tecnologías similares para mejorar su experiencia en nuestra plataforma.
                </p>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                      Cookies Necesarias
                    </h4>
                    <p className="text-green-700 dark:text-green-300 text-sm">
                      Esenciales para el funcionamiento básico de la plataforma.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                      Cookies de Funcionalidad
                    </h4>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">
                      Recordar sus preferencias y configuraciones.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
                      Cookies Analytics
                    </h4>
                    <p className="text-purple-700 dark:text-purple-300 text-sm">
                      Entender cómo utiliza la plataforma (solo con consentimiento).
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Seguridad */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Lock className="h-6 w-6 text-red-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  6. Seguridad de los Datos
                </h2>
              </div>
              <div className="space-y-6">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 dark:text-red-300 mb-3">
                    Medidas de Seguridad Implementadas:
                  </h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-300 text-sm">
                      <li>Cifrado SSL/TLS para todas las comunicaciones</li>
                      <li>Autenticación multifactor disponible</li>
                      <li>Monitoreo continuo de seguridad</li>
                      <li>Auditorías regulares de seguridad</li>
                    </ul>
                    <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-300 text-sm">
                      <li>Acceso restringido a datos personales</li>
                      <li>Backups seguros y cifrados</li>
                      <li>Detección de actividades sospechosas</li>
                      <li>Actualizaciones de seguridad regulares</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Sus Derechos */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <UserCheck className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  7. Sus Derechos
                </h2>
              </div>
              <div className="space-y-6">
                <p className="text-gray-700 dark:text-gray-300">
                  Usted tiene los siguientes derechos respecto a sus datos personales:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                      Acceso y Portabilidad
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-green-700 dark:text-green-300 text-sm">
                      <li>Solicitar una copia de sus datos</li>
                      <li>Exportar sus datos en formato legible</li>
                      <li>Conocer cómo procesamos su información</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">
                      Corrección y Eliminación
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                      <li>Corregir datos inexactos</li>
                      <li>Solicitar eliminación de datos</li>
                      <li>Restringir el procesamiento</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                    <h4 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">
                      Control de Comunicaciones
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-purple-700 dark:text-purple-300 text-sm">
                      <li>Darse de baja del marketing</li>
                      <li>Gestionar preferencias de notificaciones</li>
                      <li>Revocar consentimientos</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                    <h4 className="font-semibold text-orange-800 dark:text-orange-300 mb-2">
                      Reclamaciones
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-orange-700 dark:text-orange-300 text-sm">
                      <li>Presentar quejas ante autoridades</li>
                      <li>Objetar el procesamiento</li>
                      <li>Buscar compensación</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Retención de Datos */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Database className="h-6 w-6 text-indigo-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  8. Retención de Datos
                </h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Conservamos sus datos personales solo durante el tiempo necesario para cumplir 
                  con los propósitos descritos en esta política o según lo requiera la ley.
                </p>
                
                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
                  <h4 className="font-semibold text-indigo-800 dark:text-indigo-300 mb-3">
                    Períodos de Retención Típicos:
                  </h4>
                  <ul className="list-disc list-inside space-y-2 text-indigo-700 dark:text-indigo-300">
                    <li><strong>Datos de cuenta:</strong> Mientras mantenga su cuenta activa</li>
                    <li><strong>Transacciones:</strong> 7 años (requisitos contables y fiscales)</li>
                    <li><strong>Logs de seguridad:</strong> 2 años</li>
                    <li><strong>Datos de marketing:</strong> Hasta que retire su consentimiento</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Cambios a esta Política */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  9. Cambios a esta Política
                </h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos 
                  sobre cambios significativos a través de la plataforma o por email.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-yellow-800 dark:text-yellow-300">
                    <strong>Recomendación:</strong> Revise esta política periódicamente para 
                    mantenerse informado sobre cómo protegemos su información.
                  </p>
                </div>
              </div>
            </section>

            {/* Contacto */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  10. Contacto para Asuntos de Privacidad
                </h2>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Para ejercer sus derechos o hacer consultas sobre privacidad:
                </p>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Email: <a href="mailto:privacy@sorykpass.com" className="text-blue-600 hover:underline">privacy@sorykpass.com</a>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Teléfono: +56 2 1234 5678 (Opción 2 - Privacidad)
                    </span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-blue-800 dark:text-blue-300 text-sm">
                    <strong>Tiempo de respuesta:</strong> Responderemos a sus solicitudes 
                    relacionadas con privacidad dentro de 30 días hábiles.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center space-y-4">
          <Link 
            href="/terms"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors mr-6"
          >
            Ver Términos y Condiciones
          </Link>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
