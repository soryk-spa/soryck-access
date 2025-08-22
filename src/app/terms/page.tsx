import { Metadata } from "next";
import Link from "next/link";
import { 
  Scale, 
  Shield, 
  Users, 
  CreditCard, 
  Bell, 
  FileText, 
  Calendar,
  ArrowLeft,
  Mail,
  Phone
} from "lucide-react";

export const metadata: Metadata = {
  title: "Términos y Condiciones | SorykPass",
  description: "Términos y condiciones de uso de la plataforma SorykPass para gestión de eventos y venta de tickets digitales.",
  keywords: "términos, condiciones, legal, política, SorykPass, eventos, tickets",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
                <Scale className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Términos y Condiciones
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
                <FileText className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  1. Introducción
                </h2>
              </div>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Bienvenido a <strong>SorykPass</strong> (&ldquo;nosotros&rdquo;, &ldquo;nuestro&rdquo;, &ldquo;la plataforma&rdquo;). 
                  Estos Términos y Condiciones (&ldquo;Términos&rdquo;) rigen el uso de nuestra plataforma digital 
                  de gestión de eventos, venta de tickets y control de acceso.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  Al acceder o utilizar SorykPass, usted acepta estar sujeto a estos Términos. 
                  Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestros servicios.
                </p>
              </div>
            </section>

            {/* Definiciones */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Users className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  2. Definiciones
                </h2>
              </div>
              <div className="grid gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Plataforma</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    El sitio web y aplicación SorykPass, incluyendo todas sus funcionalidades y servicios.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Usuario</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Cualquier persona que acceda o utilice la plataforma, incluyendo compradores, organizadores y administradores.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Organizador</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Usuario que crea, gestiona y vende tickets para eventos a través de la plataforma.
                  </p>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Comprador</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Usuario que adquiere tickets para eventos a través de la plataforma.
                  </p>
                </div>
              </div>
            </section>

            {/* Uso de la Plataforma */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-6 w-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  3. Uso de la Plataforma
                </h2>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    3.1 Registro y Cuenta
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Debe proporcionar información precisa y actualizada durante el registro</li>
                    <li>Es responsable de mantener la confidencialidad de sus credenciales</li>
                    <li>Debe notificar inmediatamente cualquier uso no autorizado de su cuenta</li>
                    <li>Solo puede crear una cuenta por persona o entidad</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    3.2 Conducta Aceptable
                  </h3>
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                    <p className="text-red-800 dark:text-red-300 font-medium mb-2">Está prohibido:</p>
                    <ul className="list-disc list-inside space-y-1 text-red-700 dark:text-red-300">
                      <li>Usar la plataforma para actividades ilegales o fraudulentas</li>
                      <li>Crear eventos falsos o engañosos</li>
                      <li>Revender tickets sin autorización del organizador</li>
                      <li>Interferir con el funcionamiento de la plataforma</li>
                      <li>Acceder a cuentas de otros usuarios</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Eventos y Tickets */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Calendar className="h-6 w-6 text-orange-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  4. Eventos y Tickets
                </h2>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    4.1 Responsabilidades del Organizador
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Proporcionar información precisa y completa sobre el evento</li>
                    <li>Cumplir con todas las regulaciones legales aplicables</li>
                    <li>Notificar cambios o cancelaciones con anticipación razonable</li>
                    <li>Gestionar adecuadamente la capacidad y seguridad del evento</li>
                    <li>Honrar todos los tickets vendidos válidos</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    4.2 Compra de Tickets
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Los tickets son válidos solo para el evento especificado</li>
                    <li>Los precios incluyen todas las tarifas aplicables</li>
                    <li>La compra está sujeta a disponibilidad</li>
                    <li>Los códigos QR son únicos e intransferibles sin autorización</li>
                    <li>Es responsabilidad del comprador verificar los detalles del evento</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Pagos y Reembolsos */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  5. Pagos y Reembolsos
                </h2>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    5.1 Procesamiento de Pagos
                  </h3>
                  <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                    <li>Los pagos se procesan a través de Transbank y otros proveedores seguros</li>
                    <li>Todos los precios se muestran en pesos chilenos (CLP)</li>
                    <li>SorykPass cobra una comisión por cada transacción</li>
                    <li>Los organizadores reciben los pagos según el cronograma establecido</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    5.2 Política de Reembolsos
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <ul className="list-disc list-inside space-y-2 text-blue-800 dark:text-blue-300">
                      <li>Los reembolsos están sujetos a la política del organizador del evento</li>
                      <li>Cancelaciones por parte del organizador generan reembolso completo</li>
                      <li>Cambios significativos pueden justificar reembolsos parciales</li>
                      <li>Los reembolsos se procesan en 5-10 días hábiles</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Propiedad Intelectual */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="h-6 w-6 text-indigo-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  6. Propiedad Intelectual
                </h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  SorykPass y todos sus contenidos, características y funcionalidades son propiedad 
                  de SorykPass Team y están protegidos por derechos de autor, marcas registradas y 
                  otras leyes de propiedad intelectual.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Los usuarios conservan la propiedad de su contenido, pero otorgan a SorykPass 
                  una licencia para usar, mostrar y procesar dicho contenido en relación con 
                  los servicios de la plataforma.
                </p>
              </div>
            </section>

            {/* Privacidad y Datos */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  7. Privacidad y Protección de Datos
                </h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Su privacidad es importante para nosotros. Recopilamos, usamos y protegemos 
                  su información personal de acuerdo con nuestra Política de Privacidad.
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 dark:text-green-300 mb-2">
                    Nos comprometemos a:
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-green-700 dark:text-green-300">
                    <li>Proteger sus datos personales con medidas de seguridad apropiadas</li>
                    <li>No vender su información a terceros</li>
                    <li>Permitir el acceso y corrección de sus datos</li>
                    <li>Cumplir con las leyes de protección de datos aplicables</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Limitación de Responsabilidad */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Bell className="h-6 w-6 text-yellow-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  8. Limitación de Responsabilidad
                </h2>
              </div>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="space-y-4 text-yellow-800 dark:text-yellow-300">
                  <p>
                    SorykPass actúa como intermediario entre organizadores y compradores. 
                    No somos responsables de:
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>La calidad, seguridad o legalidad de los eventos</li>
                    <li>Cancelaciones o cambios realizados por los organizadores</li>
                    <li>Daños indirectos o consecuenciales</li>
                    <li>Pérdidas que excedan el monto pagado por el ticket</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Modificaciones */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="h-6 w-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  9. Modificaciones de los Términos
                </h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Nos reservamos el derecho de modificar estos Términos en cualquier momento. 
                  Los cambios entrarán en vigor inmediatamente después de su publicación en la plataforma.
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  Es su responsabilidad revisar periódicamente estos Términos. El uso continuado 
                  de la plataforma después de los cambios constituye su aceptación de los nuevos términos.
                </p>
              </div>
            </section>

            {/* Ley Aplicable */}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Scale className="h-6 w-6 text-red-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  10. Ley Aplicable y Jurisdicción
                </h2>
              </div>
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Estos Términos se rigen por las leyes de la República de Chile. 
                  Cualquier disputa será resuelta en los tribunales competentes de Santiago, Chile.
                </p>
              </div>
            </section>

            {/* Contacto */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Mail className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  11. Contacto
                </h2>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Para preguntas sobre estos Términos y Condiciones, contáctenos:
                </p>
                <div className="grid gap-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Email: <a href="mailto:legal@sorykpass.com" className="text-blue-600 hover:underline">legal@sorykpass.com</a>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-blue-600" />
                    <span className="text-gray-700 dark:text-gray-300">
                      Teléfono: +56 2 1234 5678
                    </span>
                  </div>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
