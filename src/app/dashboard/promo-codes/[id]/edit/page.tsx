// src/app/dashboard/promo-codes/[id]/edit/page.tsx
import { requireOrganizer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditPromoCodeForm from "@/components/edit-promo-code-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function EditPromoCodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireOrganizer();

  // Obtener el código promocional
  const promoCode = await prisma.promoCode.findFirst({
    where: {
      id,
      createdBy: user.id,
    },
    include: {
      event: {
        select: { id: true, title: true },
      },
      _count: {
        select: { usages: true },
      },
    },
  });

  if (!promoCode) {
    notFound();
  }

  // Obtener eventos del organizador para el selector
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

  // Serializar datos
  const serializedPromoCode = {
    ...promoCode,
    description: promoCode.description ?? "",
    usageLimit: promoCode.usageLimit ?? undefined,
    usageLimitPerUser: promoCode.usageLimitPerUser ?? undefined,
    validFrom: promoCode.validFrom.toISOString().slice(0, 16),
    validUntil: promoCode.validUntil?.toISOString().slice(0, 16) || "",
    eventId: promoCode.eventId || "all",
    createdAt: promoCode.createdAt.toISOString(),
    updatedAt: promoCode.updatedAt.toISOString(),
    event: promoCode.event || undefined,
  };

  const canEdit = promoCode._count.usages === 0;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/promo-codes">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Editar Código Promocional</h1>
            <p className="text-muted-foreground">
              Código:{" "}
              <code className="bg-muted px-2 py-1 rounded font-mono">
                {promoCode.code}
              </code>
            </p>
          </div>
        </div>

        {/* Formulario */}
        <EditPromoCodeForm
          promoCode={serializedPromoCode}
          events={events}
          canEdit={canEdit}
        />
      </div>
    </div>
  );
}
