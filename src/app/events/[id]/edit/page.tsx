import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { canAccessEvent } from "@/lib/auth";
import EditEventForm from "@/components/edit-event-form";
import type { Metadata } from "next";

interface EditEventPageProps {
  params: Promise<{ id: string }>;
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
        // ✅ CAMBIO CLAVE: Incluimos los ticketTypes y contamos los tickets vendidos para cada uno.
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
  // Fetch categories from the database
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

export async function generateMetadata(): Promise<Metadata> {
  // Provide a default metadata object to satisfy the return type
  return {
    title: "Edit Event",
    description: "Edit your event details",
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
    startDate: event.startDate.toISOString(),
    endDate: event.endDate?.toISOString() || null,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    // Nos aseguramos de serializar las fechas dentro de los ticketTypes también.
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
