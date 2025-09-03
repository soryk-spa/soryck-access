import Link from 'next/link';
import { Metadata } from 'next';
import { ChevronLeft, BookOpen } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Artículos de ayuda | SorykPass',
  description: 'Listado de artículos del centro de ayuda de SorykPass',
};

const sampleArticles = [
  'Cómo crear tu primer evento',
  'Configurar tipos de tickets',
  'Escanear códigos QR',
  'Configurar comisiones y retiros',
  'Verificar tickets con código QR',
];

const slugify = (s: string) =>
  encodeURIComponent(
    s
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '')
  );

export default function ArticlesIndex() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/help" className="flex items-center gap-2 text-blue-600 hover:underline">
            <ChevronLeft className="h-4 w-4" /> Volver al Centro de Ayuda
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BookOpen className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Artículos de ayuda</h1>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sampleArticles.map((a) => (
              <Link
                key={a}
                href={`/help/articles/${slugify(a)}`}
                className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              >
                <h3 className="font-medium text-gray-900 dark:text-white">{a}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Guía paso a paso</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
