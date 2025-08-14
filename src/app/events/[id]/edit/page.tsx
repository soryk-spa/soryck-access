import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canAccessEvent } from "@/lib/auth";
import EditEventForm from "@/components/edit-event-form";
import type { Metadata } from "next";

/**
 * Props for EditEventPage and generateMetadata.
 * params: { id: string }
 */
type EditEventPageProps = {
  params: {
    id: string;
  };
};

/**
 * Formatea una fecha UTC a un string 'datetime-local' para la zona horaria de Chile.
 * Esta función es crucial para que el formulario de edición muestre la hora correcta.
 * @param date - El objeto Date (desde Prisma, en UTC).
 * @returns Un string en formato YYYY-MM-DDTHH:mm.
 */
function formatForDateTimeLocal(date: Date): string {
  // Usamos Intl.DateTimeFormat para obtener las partes de la fecha en la zona horaria correcta
  const formatter = new Intl.DateTimeFormat("en-CA", {
    // 'en-CA' da el formato YYYY-MM-DD
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // Usar formato de 24 horas
    timeZone: "America/Santiago", // ¡La clave está aquí!
  });

  const parts = formatter.formatToParts(date);
  const find = (type: string) =>
    parts.find((p) => p.type === type)?.value || "";

  const year = find("year");
  const month = find("month");
  const day = find("day");
  const hour = find("hour");
  const minute = find("minute");

  // Intl puede devolver '24' para la medianoche, lo corregimos a '00'
  const formattedHour = hour === "24" ? "00" : hour;

  return `${year}-${month}-${day}T${formattedHour}:${minute}`;
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
        category: {
          select: { id: true, name: true },
        },
        organizer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        _count: {
          select: { tickets: true, orders: true },
        },
        ticketTypes: {
          include: {
            _count: {
              select: { tickets: true },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!event) {
      return null;
    }

    return { event, user };
  } catch (error) {
    console.error("Error fetching event for edit:", error);
    return null;
  }
}

async function getCategories() {
  return prisma.category.findMany({
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}

export async function generateMetadata({
  params,
}: EditEventPageProps): Promise<Metadata> {
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

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
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
