import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canAccessEvent } from "@/lib/auth";
import CourtesyInvitationsManagement from "@/components/courtesy-invitations-management";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const event = await prisma.event.findUnique({
      where: { id },
      select: { title: true },
    });
    if (event) {
      return {
        title: `Invitaciones de Cortesía - ${event.title} | SorykPass`,
        description: `Gestiona las invitaciones de cortesía para ${event.title}`,
      };
    }
  } catch (error) {
    console.error("Error fetching event for metadata:", error);
  }
  return {
    title: "Invitaciones de Cortesía | SorykPass",
    description: "Gestiona las invitaciones de cortesía para tu evento",
  };
}

async function getEventDetails(id: string) {
  try {
    const { canAccess, user } = await canAccessEvent(id);
    if (!canAccess) {
      redirect("/unauthorized?required=organizer");
    }

    const event = await prisma.event.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        startDate: true,
        endDate: true,
        allowCourtesy: true,
        courtesyLimit: true,
        organizerId: true,
        _count: {
          select: {
            courtesyInvitations: true,
          },
        },
      },
    });

    if (!event) {
      return null;
    }

    return { event, user };
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

export default async function EventCourtesyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getEventDetails(id);

  if (!result) {
    notFound();
  }

  const { event, user } = result;

  // Verificar si las cortesías están habilitadas para este evento
  if (!event.allowCourtesy) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h1 className="text-3xl font-bold">Cortesías No Habilitadas</h1>
          <p className="text-muted-foreground text-lg">
            Las invitaciones de cortesía no están habilitadas para este evento.
          </p>
          <p className="text-sm text-muted-foreground">
            Puedes habilitar las cortesías editando la configuración del evento.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href={`/organizer/events/${event.id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Editar Evento
            </a>
            <a
              href="/organizer"
              className="inline-flex items-center px-4 py-2 border border-input bg-background hover:bg-accent rounded-md transition-colors"
            >
              Volver al Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <a href="/organizer" className="hover:text-foreground">Dashboard</a>
        <span>/</span>
        <a href={`/organizer/events/${event.id}/edit`} className="hover:text-foreground">
          {event.title}
        </a>
        <span>/</span>
        <span className="text-foreground">Cortesías</span>
      </nav>

      {/* Información del evento */}
      <div className="bg-card rounded-lg border p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
            <p className="text-muted-foreground mb-4">{event.description}</p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>📍 {event.location}</span>
              <span>📅 {new Date(event.startDate).toLocaleDateString('es-CL')}</span>
              {event.courtesyLimit && (
                <span>🎫 Límite: {event.courtesyLimit} cortesías</span>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Invitaciones creadas</p>
            <p className="text-3xl font-bold">{event._count.courtesyInvitations}</p>
            {event.courtesyLimit && (
              <p className="text-xs text-muted-foreground">
                de {event.courtesyLimit} máximo
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Componente de gestión de cortesías */}
      <CourtesyInvitationsManagement 
        eventId={event.id} 
        eventTitle={event.title}
      />
    </div>
  );
}
