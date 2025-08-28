import { requireOrganizer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OrganizerProfileForm from "@/components/organizer-profile-form-updated";

export default async function OrganizerProfilePage() {
  const user = await requireOrganizer();

  // Obtener estadísticas del usuario
  const [eventsCount, ordersCount] = await Promise.all([
    prisma.event.count({
      where: { organizerId: user.id },
    }),
    prisma.order.count({
      where: { 
        event: { 
          organizerId: user.id 
        } 
      },
    }),
  ]);

  const userWithStats = {
    ...user,
    createdAt: user.createdAt.toISOString(),
    _count: { 
      events: eventsCount, 
      orders: ordersCount 
    },
  };

  return <OrganizerProfileForm user={userWithStats} />;
}
