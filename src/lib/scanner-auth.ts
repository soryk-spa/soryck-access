import { prisma } from "@/lib/prisma";

type ScannerAssignmentWithRelations = {
  id: string;
  assignedAt: Date;
  event: {
    id: string;
    title: string;
    description: string | null;
    startDate: Date;
    endDate: Date | null;
    isPublished: boolean;
    imageUrl: string | null;
    venue: {
      id: string;
      name: string;
      address: string | null;
    } | null;
    organizer: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      producerName: string | null;
    };
  };
  assigner: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
};


export async function canScannerAccessEvent(
  scannerId: string, 
  eventId: string
): Promise<{ canAccess: boolean; reason?: string }> {
  try {
    
    const scannerAssignment = await prisma.eventScanner.findFirst({
      where: {
        scannerId,
        eventId,
        isActive: true, 
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            isPublished: true,
          },
        },
        scanner: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!scannerAssignment) {
      return {
        canAccess: false,
        reason: "No tienes permisos para validar tickets de este evento",
      };
    }

    
    if (!scannerAssignment.event.isPublished) {
      return {
        canAccess: false,
        reason: "El evento no está publicado",
      };
    }

    
    if (scannerAssignment.scanner.role !== "SCANNER") {
      return {
        canAccess: false,
        reason: "El usuario no tiene permisos de validador",
      };
    }

    
    const now = new Date();
    const eventStart = new Date(scannerAssignment.event.startDate);
    const eventEnd = scannerAssignment.event.endDate 
      ? new Date(scannerAssignment.event.endDate)
      : new Date(eventStart.getTime() + 24 * 60 * 60 * 1000); 

    
    const validationStart = new Date(eventStart.getTime() - 2 * 60 * 60 * 1000);
    const validationEnd = new Date(eventEnd.getTime() + 2 * 60 * 60 * 1000);

    if (now < validationStart) {
      return {
        canAccess: false,
        reason: "Aún no es posible validar tickets para este evento",
      };
    }

    if (now > validationEnd) {
      return {
        canAccess: false,
        reason: "El período de validación para este evento ha terminado",
      };
    }

    return { canAccess: true };

  } catch (error) {
    console.error("Error checking scanner access:", error);
    return {
      canAccess: false,
      reason: "Error al verificar permisos",
    };
  }
}


export async function getScannerEvents(scannerId: string) {
  try {
    const scannerAssignments = await prisma.eventScanner.findMany({
      where: {
        scannerId,
        isActive: true,
      },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            isPublished: true,
            imageUrl: true,
            venue: {
              select: {
                id: true,
                name: true,
                address: true,
              },
            },
            organizer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                producerName: true,
              },
            },
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
        event: {
          startDate: "asc",
        },
      },
    });

    return scannerAssignments.map((assignment: ScannerAssignmentWithRelations) => ({
      ...assignment.event,
      assignedAt: assignment.assignedAt.toISOString(),
      assignedBy: assignment.assigner,
    }));

  } catch (error) {
    console.error("Error getting scanner events:", error);
    return [];
  }
}
