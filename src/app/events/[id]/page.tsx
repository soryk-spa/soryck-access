import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import EventDetailView from "@/components/event-detail-view";
import type { Metadata } from "next";


interface EventPageProps {
  params: Promise<{ id: string }>; 
}

async function getEvent(id: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id },
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
            imageUrl: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
        ticketTypes: {
          include: {
            priceTiers: true
          },
          orderBy: {
            price: "asc",
          },
        },
        sections: {
          include: {
            seats: {
              include: {
                reservations: {
                  where: {
                    expiresAt: {
                      gt: new Date()
                    }
                  }
                }
              }
            }
          },
          orderBy: {
            name: "asc",
          },
        },
      },
    });
    if (!event) {
      return null;
    }
    
    const user = await getCurrentUser();
    const isPublic = event.isPublished;
    const isOwner = user && event.organizerId === user.id;
    const isAdmin = user && user.role === "ADMIN";
    if (!isPublic && !isOwner && !isAdmin) {
      return null;
    }
    return event;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { id } = await params; 
  const event = await getEvent(id);

  if (!event) {
    return {
      title: "Evento no encontrado | SorykPass",
    };
  }

  const title = `${event.title} | SorykPass`;
  const description =
    event.description ||
    `Evento organizado por ${event.organizer.firstName || event.organizer.email}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: event.imageUrl ? [event.imageUrl] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: event.imageUrl ? [event.imageUrl] : [],
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params; 
  const event = await getEvent(id);
  const user = await getCurrentUser();

  if (!event) {
    notFound();
  }

  const serializedEvent = {
    ...event,
    description: event.description ?? undefined,
    imageUrl: event.imageUrl ?? undefined,
    allowCourtesy: event.allowCourtesy, 
    startDate: event.startDate.toISOString(),
    endDate: event.endDate ? event.endDate.toISOString() : undefined,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    organizer: {
      ...event.organizer,
      imageUrl: event.organizer.imageUrl ?? undefined,
      firstName: event.organizer.firstName ?? undefined,
      lastName: event.organizer.lastName ?? undefined,
    },
    ticketTypes: event.ticketTypes.map((tt) => ({
      ...tt,
      description: tt.description ?? undefined,
      createdAt: tt.createdAt.toISOString(),
      updatedAt: tt.updatedAt.toISOString(),
      priceTiers: tt.priceTiers?.map((tier) => ({
        id: tier.id,
        name: tier.name,
        price: tier.price,
        currency: tier.currency,
        startDate: tier.startDate.toISOString(),
        endDate: tier.endDate ? tier.endDate.toISOString() : undefined,
        isActive: tier.isActive,
      })) || [],
    })),
    sections: event.sections.map((section) => ({
      id: section.id,
      name: section.name,
      color: section.color,
      basePrice: section.basePrice ?? 0,
      seatCount: section.seatCount,
      rowCount: section.rowCount,
      seatsPerRow: section.seatsPerRow,
      hasSeats: section.hasSeats,
      description: section.description ?? undefined,
      seats: section.seats.map((seat) => ({
        id: seat.id,
        row: seat.row,
        number: seat.number,
        displayName: `${seat.row}${seat.number}`,
        price: section.basePrice ?? 0,
        status: seat.status === 'BLOCKED' ? 'RESERVED' : (seat.status as "AVAILABLE" | "RESERVED" | "SOLD"),
        isAccessible: false,
        sectionId: seat.sectionId,
        isReserved: seat.reservations.length > 0,
        isAvailable: seat.status === 'AVAILABLE' && seat.reservations.length === 0
      }))
    })),
  };

  const serializedUser = user
    ? {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      }
    : null;

  let userTicketsCount = 0;
  if (user) {
    userTicketsCount = await prisma.ticket.count({
      where: {
        eventId: event.id,
        userId: user.id,
        status: "ACTIVE",
      },
    });
  }

  return (
    <EventDetailView
      event={serializedEvent}
      user={serializedUser}
      userTicketsCount={userTicketsCount}
    />
  );
}
