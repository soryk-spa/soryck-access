import { Metadata } from "next";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import OrganizersScannersManagement from "@/components/organizer-scanners-management";

export const metadata: Metadata = {
  title: "Gestión de Validadores | SorykPass",
  description: "Administra los validadores (scanners) asignados a tus eventos",
};

export default async function OrganizersScannersPage() {
  const user = await requireAuth();

  // Verificar que el usuario sea organizador
  if (user.role !== "ORGANIZER" && user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  // Obtener todos los scanners asignados por este organizador
  const organizerScanners = await prisma.eventScanner.findMany({
    where: {
      assignedBy: user.id,
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          startDate: true,
          isPublished: true,
        },
      },
      scanner: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      },
      assigner: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Obtener eventos del organizador para poder asignar scanners
  const organizerEvents = await prisma.event.findMany({
    where: {
      organizerId: user.id,
    },
    select: {
      id: true,
      title: true,
      startDate: true,
      isPublished: true,
    },
    orderBy: {
      startDate: "asc",
    },
  });

  // Obtener usuarios con rol SCANNER disponibles
  const availableScanners = await prisma.user.findMany({
    where: {
      role: "SCANNER",
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
    },
    orderBy: {
      email: "asc",
    },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Validadores</h1>
          <p className="text-muted-foreground">
            Administra los validadores (scanners) que pueden verificar tickets en tus eventos
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Organizador
        </Badge>
      </div>

      {/* Management Component */}
      <OrganizersScannersManagement
        organizerScanners={organizerScanners.map(scanner => ({
          ...scanner,
          assignedAt: scanner.assignedAt.toISOString(),
          event: {
            ...scanner.event,
            startDate: scanner.event.startDate.toISOString()
          }
        }))}
        organizerEvents={organizerEvents.map(event => ({
          ...event,
          startDate: event.startDate.toISOString()
        }))}
        availableScanners={availableScanners}
      />
    </div>
  );
}
