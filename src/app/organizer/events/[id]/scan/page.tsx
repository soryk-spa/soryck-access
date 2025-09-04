import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canAccessEvent } from "@/lib/auth";
import TicketScanner from "@/components/ticket-scanner";
import Link from "next/link";
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
        title: `Escáner - ${event.title} | SorykPass`,
        description: `Escáner de tickets para ${event.title}`,
      };
    }
  } catch (error) {
    console.error("Error fetching event for metadata:", error);
  }
  return {
    title: "Escáner de Tickets | SorykPass",
    description: "Escáner de tickets para eventos",
  };
}

async function getEventForScanning(id: string) {
  try {
    const { canAccess, user } = await canAccessEvent(id);
    if (!canAccess) {
      redirect("/unauthorized?required=scanner");
    }

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        scanners: {
          where: { scannerId: user!.id },
          select: {
            id: true,
            isActive: true,
            assignedAt: true,
          },
        },
        _count: {
          select: {
            tickets: true,
            courtesyInvitations: true,
          },
        },
      },
    });

    if (!event) {
      return null;
    }

    
    const isOrganizer = event.organizerId === user!.id;
    const isScanner = event.scanners.length > 0 && event.scanners[0].isActive;
    const isAdmin = user!.role === 'ADMIN';

    if (!isOrganizer && !isScanner && !isAdmin) {
      redirect("/unauthorized?required=scanner");
    }

    return { event, user, isOrganizer, isScanner, isAdmin };
  } catch (error) {
    console.error("Error fetching event for scanning:", error);
    return null;
  }
}

export default async function EventScanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getEventForScanning(id);

  if (!result) {
    notFound();
  }

  const { event, user, isOrganizer, isScanner } = result;

  const roleDisplay = isOrganizer ? "Organizador" : isScanner ? "Validador" : "Administrador";

  return (
    <div className="container mx-auto px-4 py-8">
      {}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/organizer" className="hover:text-foreground">Dashboard</Link>
        <span>/</span>
        <Link href={`/organizer/events/${event.id}/edit`} className="hover:text-foreground">
          {event.title}
        </Link>
        <span>/</span>
        <span className="text-foreground">Escáner</span>
      </nav>

      {}
      <div className="bg-card rounded-lg border p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>📍 {event.location}</span>
              <span>📅 {new Date(event.startDate).toLocaleDateString('es-CL')}</span>
              <span>👤 {roleDisplay}: {user!.firstName} {user!.lastName}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Total Tickets</p>
            <p className="text-3xl font-bold">{event._count.tickets}</p>
            {event._count.courtesyInvitations > 0 && (
              <p className="text-xs text-muted-foreground">
                + {event._count.courtesyInvitations} cortesías
              </p>
            )}
          </div>
        </div>
      </div>

      {}
      {event.endDate && new Date() > event.endDate && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-yellow-800">
            <span className="text-yellow-600">⚠️</span>
            <span className="font-medium">Evento Finalizado</span>
          </div>
          <p className="text-yellow-700 text-sm mt-1">
            Este evento ya ha terminado. Los tickets pueden seguir validándose para fines de registro.
          </p>
        </div>
      )}

      {}
      <TicketScanner 
        eventId={event.id} 
        eventTitle={event.title}
      />
    </div>
  );
}
