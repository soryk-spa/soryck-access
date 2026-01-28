import { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen, Mail, ChevronLeft } from 'lucide-react';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const title = decodeURIComponent(slug).replace(/-/g, ' ');
  return {
    title: `${title} | Centro de Ayuda - SorykPass`,
  };
}

export default async function HelpArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = decodeURIComponent(slug).replace(/-/g, ' ');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800">
  <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="mb-6">
          <Link href="/help/articles" className="flex items-center gap-2 text-blue-600 hover:underline">
            <ChevronLeft className="h-4 w-4" /> Volver a artículos
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p>Este artículo es un marcador de posición. Pronto añadiremos la guía completa para <strong>{title}</strong>.</p>
            <h3>¿Necesitas ayuda ahora?</h3>
            <p>Contacta a soporte y te ayudaremos a resolverlo inmediatamente.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:underline">
              <Mail className="h-4 w-4" /> Contactar Soporte
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
