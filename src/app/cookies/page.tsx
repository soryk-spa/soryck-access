import { Metadata } from "next";
import Link from "next/link";
import { 
  Cookie, 
  Settings, 
  BarChart3, 
  Shield, 
  Eye,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Política de Cookies | SorykPass",
  description: "Información sobre el uso de cookies y tecnologías similares en SorykPass. Conoce qué datos recopilamos y cómo puedes gestionarlos.",
  keywords: "cookies, tracking, analytics, preferencias, SorykPass, privacidad",
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 dark:from-gray-900 dark:to-gray-800">
      {}
      <div className="bg-white dark:bg-gray-900 shadow-sm border-b">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              Volver al inicio
            </Link>
          </div>
          <div className="mt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <Cookie className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Política de Cookies
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Última actualización: 22 de agosto de 2025
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg">
          <div className="p-8 lg:p-12">
            
            {}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Cookie className="h-6 w-6 text-amber-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  ¿Qué son las Cookies?
                </h2>
              </div>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Las cookies son pequeños archivos de texto que se almacenan en su dispositivo 
                  cuando visita un sitio web. En <strong>SorykPass</strong>, utilizamos cookies 
                  y tecnologías similares para mejorar su experiencia, personalizar contenido 
                  y analizar el uso de nuestra plataforma.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
                  Esta política explica qué tipos de cookies utilizamos, por qué las usamos 
                  y cómo puede controlar su uso.
                </p>
              </div>
            </section>

            {}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Tipos de Cookies que Utilizamos
                </h2>
              </div>

              <div className="space-y-6">
                {}
                <div className="border border-green-200 dark:border-green-800 rounded-xl p-6 bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-green-500 text-white rounded-lg">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
                          Cookies Estrictamente Necesarias
                        </h3>
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                          SIEMPRE ACTIVAS
                        </span>
                      </div>
                      <p className="text-green-700 dark:text-green-300 mb-3">
                        Estas cookies son esenciales para el funcionamiento de la plataforma y no se pueden desactivar.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Propósito:</h4>
                          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                            <li>• Mantener su sesión activa</li>
                            <li>• Recordar sus preferencias de idioma</li>
                            <li>• Procesar pagos de forma segura</li>
                            <li>• Prevenir ataques de seguridad</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">Ejemplos:</h4>
                          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
                            <li>• <code>auth_token</code></li>
                            <li>• <code>session_id</code></li>
                            <li>• <code>csrf_token</code></li>
                            <li>• <code>locale_preference</code></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {}
                <div className="border border-blue-200 dark:border-blue-800 rounded-xl p-6 bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-blue-500 text-white rounded-lg">
                      <Settings className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">
                          Cookies de Funcionalidad
                        </h3>
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                          OPCIONAL
                        </span>
                      </div>
                      <p className="text-blue-700 dark:text-blue-300 mb-3">
                        Mejoran la funcionalidad de la plataforma y personalizan su experiencia.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Propósito:</h4>
                          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                            <li>• Recordar configuraciones del dashboard</li>
                            <li>• Personalizar la interfaz</li>
                            <li>• Mantener preferencias de vista</li>
                            <li>• Autocompletar formularios</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">Duración:</h4>
                          <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                            <li>• Entre 30 días y 1 año</li>
                            <li>• Se eliminan al cerrar sesión</li>
                            <li>• Renovables automáticamente</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {}
                <div className="border border-purple-200 dark:border-purple-800 rounded-xl p-6 bg-purple-50 dark:bg-purple-900/20">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-purple-500 text-white rounded-lg">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300">
                          Cookies de Analítica
                        </h3>
                        <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
                          OPCIONAL
                        </span>
                      </div>
                      <p className="text-purple-700 dark:text-purple-300 mb-3">
                        Nos ayudan a entender cómo los usuarios interactúan con la plataforma.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Información recopilada:</h4>
                          <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                            <li>• Páginas visitadas</li>
                            <li>• Tiempo de permanencia</li>
                            <li>• Errores encontrados</li>
                            <li>• Rutas de navegación</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-purple-800 dark:text-purple-300 mb-2">Proveedores:</h4>
                          <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                            <li>• Google Analytics</li>
                            <li>• Hotjar (mapas de calor)</li>
                            <li>• Analytics propios</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {}
                <div className="border border-orange-200 dark:border-orange-800 rounded-xl p-6 bg-orange-50 dark:bg-orange-900/20">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-orange-500 text-white rounded-lg">
                      <Eye className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-orange-800 dark:text-orange-300">
                          Cookies de Marketing
                        </h3>
                        <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded-full">
                          OPCIONAL
                        </span>
                      </div>
                      <p className="text-orange-700 dark:text-orange-300 mb-3">
                        Permiten mostrar anuncios relevantes y medir la efectividad de las campañas.
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-2">Uso:</h4>
                          <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                            <li>• Personalizar anuncios</li>
                            <li>• Medir conversiones</li>
                            <li>• Retargeting</li>
                            <li>• Análisis de audiencia</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium text-orange-800 dark:text-orange-300 mb-2">Plataformas:</h4>
                          <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                            <li>• Google Ads</li>
                            <li>• Facebook Pixel</li>
                            <li>• LinkedIn Insights</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Cómo Gestionar sus Cookies
                </h2>
              </div>
              
              <div className="space-y-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4">
                    Centro de Preferencias de SorykPass
                  </h3>
                  <p className="text-green-700 dark:text-green-300 mb-4">
                    Puede gestionar sus preferencias de cookies directamente desde nuestra plataforma:
                  </p>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Settings className="h-4 w-4 mr-2" />
                    Gestionar Preferencias de Cookies
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      A través del Navegador
                    </h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                      <li>• <strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
                      <li>• <strong>Firefox:</strong> Preferencias → Privacidad y seguridad</li>
                      <li>• <strong>Safari:</strong> Preferencias → Privacidad</li>
                      <li>• <strong>Edge:</strong> Configuración → Cookies y permisos</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Herramientas de Terceros
                    </h4>
                    <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-2">
                      <li>• <a href="https://example.com/tool1">Herramienta 1</a></li>
                      <li>• <a href="https://example.com/tool2">Herramienta 2</a></li>
                      <li>• <a href="https://example.com/tool3">Herramienta 3</a></li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Info className="h-6 w-6 text-amber-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Impacto de Deshabilitar Cookies
                </h2>
              </div>
              
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                      <XCircle className="h-5 w-5" />
                      Si deshabilita cookies funcionales:
                    </h4>
                    <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                      <li>• Tendrá que volver a configurar preferencias</li>
                      <li>• La experiencia será menos personalizada</li>
                      <li>• Algunos formularios no se autocompletarán</li>
                      <li>• Ciertas funciones pueden no trabajar correctamente</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-3 flex items-center gap-2">
                      <XCircle className="h-5 w-5" />
                      Si deshabilita cookies de analytics/marketing:
                    </h4>
                    <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                      <li>• Seguirá funcionando normalmente</li>
                      <li>• No ayudará a mejorar la plataforma</li>
                      <li>• Verá anuncios menos relevantes</li>
                      <li>• No recibirá recomendaciones personalizadas</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {}
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <Eye className="h-6 w-6 text-purple-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Cookies de Terceros
                </h2>
              </div>
              
              <div className="space-y-4">
                <p className="text-gray-700 dark:text-gray-300">
                  Algunos servicios externos que utilizamos pueden establecer sus propias cookies:
                </p>
                
                <div className="grid gap-4">
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Google Analytics</h4>
                      <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Analytics</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Análisis de uso y comportamiento del sitio web.
                    </p>
                    <a href="https://example.com/privacy" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                      Ver política de privacidad →
                    </a>
                  </div>
                  
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Transbank</h4>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Pagos</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Procesamiento seguro de pagos y prevención de fraude.
                    </p>
                    <a href="https://example.com/transbank-privacy" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                      Ver política de privacidad →
                    </a>
                  </div>
                  
                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Clerk</h4>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Autenticación</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Gestión de sesiones de usuario y autenticación segura.
                    </p>
                    <a href="https://example.com/clerk-privacy" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                      Ver política de privacidad →
                    </a>
                  </div>
                </div>
              </div>
            </section>

            {}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Info className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Actualizaciones de esta Política
                </h2>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
                <p className="text-blue-800 dark:text-blue-300 mb-4">
                  Podemos actualizar esta Política de Cookies ocasionalmente para reflejar 
                  cambios en nuestras prácticas o por otros motivos operativos, legales o regulatorios.
                </p>
                <p className="text-blue-800 dark:text-blue-300">
                  Le notificaremos sobre cambios significativos a través de un banner en 
                  la plataforma o por email, y la fecha de &ldquo;Última actualización&rdquo; 
                  al inicio de esta política será revisada.
                </p>
              </div>
            </section>

          </div>
        </div>

        {}
        <div className="mt-12 text-center space-y-4">
          <div className="flex justify-center gap-6">
            <Link 
              href="/terms"
              className="text-amber-600 hover:text-amber-700 transition-colors"
            >
              Términos y Condiciones
            </Link>
            <Link 
              href="/privacy"
              className="text-amber-600 hover:text-amber-700 transition-colors"
            >
              Política de Privacidad
            </Link>
          </div>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
