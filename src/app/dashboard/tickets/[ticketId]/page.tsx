import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import TicketDetailClient from '@/components/ticket-detail-client';

interface TicketDetailPageProps {
  params: {
    ticketId: string;
  };
}

export default async function TicketDetailPage({ params }: TicketDetailPageProps) {
  const user = await requireAuth();

  const ticket = await prisma.ticket.findFirst({
    where: {
      id: params.ticketId,
      userId: user.id,
    },
    include: {
      event: {
        select: {
          title: true,
          startDate: true,
          location: true,
          imageUrl: true,
        },
      },
    },
  });

  if (!ticket) {
    notFound();
  }

  return <TicketDetailClient ticket={ticket} />;
}