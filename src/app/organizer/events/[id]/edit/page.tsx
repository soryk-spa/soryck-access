import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canAccessEvent } from "@/lib/auth";
import EditEventForm from "@/components/edit-event-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import type { Metadata } from "next";
import { formatToChileDatetimeLocal } from "@/lib/date-utils";
import { Mail, QrCode, Settings, Users } from "lucide-react";

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
        title: `Editar: ${event.title} | SorykPass`,
        description: `Edita los detalles del evento ${event.title}`,
      };
    }
  } catch (error) {
    console.error("Error fetching event for metadata:", error);
  }
  return {
    title: "Editar Evento | SorykPass",
    description: "Edita los detalles de tu evento",
  };
}

async function getEventForEdit(id: string) {
  try {
    const { canAccess, user } = await canAccessEvent(id);
    if (!canAccess) {
      redirect("/unauthorized?required=organizer");
    }
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true } },
        organizer: {
          select: { id: true, firstName: true, lastName: true, email: true, role: true },
        },
        _count: { select: { tickets: true, orders: true } },
        ticketTypes: {
          include: { _count: { select: { tickets: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });
    if (!event) return null;
    return { event, user };
  } catch (error) {
    console.error("Error fetching event for edit:", error);
    return null;
  }
}

async function getCategories() {
  return prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const result = await getEventForEdit(id);
  if (!result) {
    notFound();
  }
  const { event, user } = result;
  const categories = await getCategories();

  const serializedEvent = {
    ...event,
    description: event.description === null ? "" : event.description,
    startDate: formatToChileDatetimeLocal(event.startDate),
    endDate: event.endDate ? formatToChileDatetimeLocal(event.endDate) : undefined,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    ticketTypes: event.ticketTypes.map((tt) => ({
      ...tt,
      description: tt.description === null ? undefined : tt.description,
      createdAt: tt.createdAt.toISOString(),
      updatedAt: tt.updatedAt.toISOString(),
    })),
    imageUrl: event.imageUrl === null ? undefined : event.imageUrl,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Editar Evento</h1>
          <p className="text-sm text-muted-foreground">
            Modifica los detalles de tu evento: {event.title}
          </p>
        </div>
      </div>

      {/* Enlaces de navegación rápida */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Invitaciones de Cortesía
            </CardTitle>
            <CardDescription className="text-sm">
              Gestiona invitaciones gratuitas para tu evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/organizer/events/${event.id}/courtesy`}>
              <Button variant="outline" className="w-full">
                Gestionar Cortesías
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              Escáner de Tickets
            </CardTitle>
            <CardDescription className="text-sm">
              Valida tickets y cortesías en el evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/organizer/events/${event.id}/scan`}>
              <Button variant="outline" className="w-full">
                Abrir Escáner
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Validadores
            </CardTitle>
            <CardDescription className="text-sm">
              Administra los validadores del evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/organizer/scanners">
              <Button variant="outline" className="w-full">
                Gestionar Validadores
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <EditEventForm
        event={serializedEvent}
        categories={categories}
        user={{
          ...user,
          imageUrl: user.imageUrl === null ? undefined : user.imageUrl,
          createdAt: user.createdAt.toISOString(),
          updatedAt: user.updatedAt.toISOString(),
        }}
      />
    </div>
  );
}
