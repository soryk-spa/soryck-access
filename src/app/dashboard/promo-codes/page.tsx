import { requireOrganizer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PromoCodesManagement from "@/components/promo-codes-management";


export const dynamic = 'force-dynamic'

export default async function PromoCodesPage() {
  const user = await requireOrganizer();

  const promoCodes = await prisma.promoCode.findMany({
    where: {
      createdBy: user.id,
    },
    include: {
      event: {
        select: { id: true, title: true },
      },
      category: {
        select: { id: true, name: true },
      },
      ticketType: {
        select: { id: true, name: true, price: true },
      },
      _count: {
        select: { usages: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const serializedPromoCodes = promoCodes.map((code) => {
    let status = code.status;

    if (code.validUntil && code.validUntil < now && status === "ACTIVE") {
      status = "EXPIRED";
    }

    if (
      code.usageLimit &&
      code.usedCount >= code.usageLimit &&
      status === "ACTIVE"
    ) {
      status = "USED_UP";
    }

    return {
      ...code,
      status,
      usedCount: code.usedCount || 0,
      discountValue: code.value || 0,
      description: code.description ?? undefined,
      minOrderAmount: code.minOrderAmount ?? undefined,
      maxDiscountAmount: code.maxDiscountAmount ?? undefined,
      usageLimit: code.usageLimit ?? undefined,
      usageLimitPerUser: code.usageLimitPerUser ?? undefined,
      validFrom: code.validFrom.toISOString(),
      validUntil: code.validUntil?.toISOString() ?? undefined,
      createdAt: code.createdAt.toISOString(),
      updatedAt: code.updatedAt.toISOString(),
      event: code.event ?? undefined,
      category: code.category ?? undefined,
      ticketType: code.ticketType ?? undefined,
      eventId: code.eventId ?? null,
      categoryId: code.categoryId ?? null,
      ticketTypeId: code.ticketTypeId ?? null,
    };
  });

  return <PromoCodesManagement initialPromoCodes={serializedPromoCodes} />;
}
