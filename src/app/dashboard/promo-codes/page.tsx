import { requireOrganizer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PromoCodesManagement from "@/components/promo-codes-management";

export default async function PromoCodesPage() {
  const user = await requireOrganizer();

  const promoCodes = await prisma.promoCode.findMany({
    where: {
      createdBy: user.id,
    },
    include: {
      event: {
        select: { title: true },
      },
      _count: {
        select: { usages: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const serializedPromoCodes = promoCodes.map((code) => ({
    ...code,
    description: code.description ?? undefined,
    usageLimit: code.usageLimit ?? undefined,
    validFrom: code.validFrom.toISOString(),
    validUntil: code.validUntil?.toISOString() || undefined,
    createdAt: code.createdAt.toISOString(),
    updatedAt: code.updatedAt.toISOString(),
    event: code.event || undefined,
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      <PromoCodesManagement initialPromoCodes={serializedPromoCodes} />
    </div>
  );
}
