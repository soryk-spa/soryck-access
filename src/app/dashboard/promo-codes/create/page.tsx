import { requireOrganizer } from "@/lib/auth";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'
import { prisma } from "@/lib/prisma";
import CreatePromoCodeForm from "@/components/create-promo-code-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function CreatePromoCodePage() {
  const user = await requireOrganizer();

  const events = await prisma.event.findMany({
    where: {
      organizerId: user.id,
      isPublished: true,
    },
    select: {
      id: true,
      title: true,
    },
    orderBy: {
      startDate: "asc",
    },
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/promo-codes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Crear Código Promocional</h1>
            <p className="text-muted-foreground">
              Crea descuentos y promociones para incrementar las ventas de tus
              eventos
            </p>
          </div>
        </div>

        <CreatePromoCodeForm events={events} />
      </div>
    </div>
  );
}
