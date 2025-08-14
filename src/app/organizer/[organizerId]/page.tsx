import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OrganizerPublicProfile from "@/components/organizer-public-profile";
import type { Metadata } from "next";

interface OrganizerPageProps {
  params: Promise<{ organizerId: string }>;
}

async function getOrganizerData(organizerId: string) {
  try {
    const organizer = await prisma.user.findUnique({
      where: {
        id: organizerId,
        role: {
          in: ["ORGANIZER", "ADMIN"],
        },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        producerName: true,
        bio: true,
        websiteUrl: true,
        twitterUrl: true,
        instagramUrl: true,
      },
    });

    if (!organizer) {
      return null;
    }

    // ✅ CORRECIÓN: Incluir ticketTypes en la consulta de eventos
    const events = await prisma.event.findMany({
      where: {
        organizerId: organizerId,
        isPublished: true,
        startDate: {
          gte: new Date(), // Solo eventos futuros
        },
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        organizer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        // ✅ AGREGAR: Incluir ticketTypes
        ticketTypes: {
          select: {
            price: true,
            currency: true,
            capacity: true,
          },
        },
        _count: {
          select: {
            tickets: true,
            orders: true,
          },
        },
      },
      orderBy: {
        startDate: "asc",
      },
    });

    return { organizer, events };
  } catch (error) {
    console.error("Error fetching organizer data:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: OrganizerPageProps): Promise<Metadata> {
  const { organizerId } = await params;
  const data = await getOrganizerData(organizerId);

  if (!data) {
    return {
      title: "Organizador no encontrado | SorykPass",
    };
  }

  const organizerName =
    data.organizer.producerName ||
    `${data.organizer.firstName || ""} ${data.organizer.lastName || ""}`.trim() ||
    "Organizador";

  const title = `${organizerName} | SorykPass`;
  const description =
    data.organizer.bio || `Eventos organizados por ${organizerName}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      images: data.organizer.imageUrl ? [data.organizer.imageUrl] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: data.organizer.imageUrl ? [data.organizer.imageUrl] : [],
    },
  };
}

export default async function OrganizerPage({ params }: OrganizerPageProps) {
  const { organizerId } = await params;
  const data = await getOrganizerData(organizerId);

  if (!data) {
    notFound();
  }

  // ✅ SERIALIZACIÓN: Convertir fechas y manejar null/undefined
  const serializedEvents = data.events.map((event) => ({
    ...event,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate ? event.endDate.toISOString() : undefined,
    description: event.description ?? undefined,
    imageUrl: event.imageUrl ?? undefined,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    // ticketTypes ya está incluido desde la consulta
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <OrganizerPublicProfile
        organizer={data.organizer}
        events={serializedEvents}
      />
    </div>
  );
}
