import { requireOrganizer } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { CourtesyDashboard } from '@/components/courtesy-dashboard';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function CourtesyManagementPage({ params }: Props) {
  const { id } = await params;
  const user = await requireOrganizer();

  
  const event = await prisma.event.findFirst({
    where: {
      id,
      organizerId: user.id
    },
    select: {
      id: true,
      title: true,
      allowCourtesy: true,
      startDate: true,
    }
  });

  if (!event) {
    notFound();
  }

  if (!event.allowCourtesy) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Cortesías no habilitadas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Este evento no tiene las cortesías habilitadas. Puedes habilitarlas editando el evento.
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href={`/organizer/events/${event.id}/edit`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Editar Evento
              </a>
              <a
                href="/dashboard/events"
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Volver a Eventos
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <a
            href="/dashboard/events"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            ← Volver a Eventos
          </a>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Gestión de Cortesías
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {event.title}
        </p>
      </div>

      <CourtesyDashboard eventId={event.id} />
    </div>
  );
}
