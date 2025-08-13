import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OrganizerPublicProfile from "@/components/organizer-public-profile";
import type { Metadata } from "next";

interface OrganizerPageProps {
  params: Promise<{ organizerId: string }>;
}

async function getOrganizerData(organizerId: string) {
  const organizer = await prisma.user.findUnique({
    where: {
      id: organizerId,
      role: { in: ["ORGANIZER", "ADMIN"] },
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

  const events = await prisma.event.findMany({
    where: {
      organizerId: organizerId,
      isPublished: true,
      startDate: {
        gte: new Date(),
      },
    },
    include: {
      category: { select: { id: true, name: true } },
      organizer: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      _count: { select: { tickets: true, orders: true } },
    },
    orderBy: {
      startDate: "asc",
    },
    take: 12,
  });

  const serializedEvents = events.map((event) => ({
    ...event,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate ? event.endDate.toISOString() : undefined,
    description: event.description === null ? undefined : event.description,
    imageUrl: event.imageUrl === null ? undefined : event.imageUrl,
  }));

  return { organizer, events: serializedEvents };
}

export async function generateMetadata({
  params,
}: OrganizerPageProps): Promise<Metadata> {
  const data = await getOrganizerData((await params).organizerId);

  if (!data?.organizer) {
    return { title: "Organizador no encontrado" };
  }

  const organizerName =
    data.organizer.producerName ||
    `${data.organizer.firstName} ${data.organizer.lastName}`.trim();
  const title = `${organizerName} | Perfil de Organizador en SorykPass`;
  const description =
    data.organizer.bio ||
    `Descubre todos los eventos organizados por ${organizerName}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: data.organizer.imageUrl ? [data.organizer.imageUrl] : [],
    },
  };
}

export default async function OrganizerPage({ params }: OrganizerPageProps) {
  const data = await getOrganizerData((await params).organizerId);

  if (!data) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <OrganizerPublicProfile organizer={data.organizer} events={data.events} />
    </div>
  );
}
