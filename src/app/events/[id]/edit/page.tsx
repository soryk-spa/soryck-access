import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canAccessEvent } from "@/lib/auth";
import EditEventForm from "@/components/edit-event-form";
import type { Metadata } from "next";

// ✅ CORRECCIÓN: Tipos definidos directamente en la función
export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const { id } = params;
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

function formatForDateTimeLocal(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
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
          select: { id: true, firstName: true, lastName: true, email: true },
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

// ✅ CORRECCIÓN: Tipos definidos directamente en la función
export default async function EditEventPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const result = await getEventForEdit(id);

  if (!result) {
    notFound();
  }

  const { event, user } = result;
  const categories = await getCategories();

  const serializedEvent = {
    ...event,
    startDate: formatForDateTimeLocal(event.startDate),
    endDate: event.endDate ? formatForDateTimeLocal(event.endDate) : null,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    ticketTypes: event.ticketTypes.map((tt) => ({
      ...tt,
      createdAt: tt.createdAt.toISOString(),
      updatedAt: tt.updatedAt.toISOString(),
    })),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <EditEventForm
        event={serializedEvent}
        categories={categories}
        user={user}
      />
    </div>
  );
}
