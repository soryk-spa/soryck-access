
import { requireAdmin } from "@/lib/auth";

export const dynamic = 'force-dynamic'
import { prisma } from "@/lib/prisma";
import { RoleRequestsPageClient } from "@/components/role-requests-page-client";

export default async function RoleRequestsPage() {
  const currentUser = await requireAdmin();

  
  const [
    allRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
  ] = await Promise.all([
    
    prisma.roleRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    
    prisma.roleRequest.findMany({
      where: { status: "PENDING" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    
    prisma.roleRequest.count({
      where: {
        status: "APPROVED",
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),

    
    prisma.roleRequest.count({
      where: {
        status: "REJECTED",
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  const totalRequests = allRequests.length;
  const pendingCount = pendingRequests.length;
  const responseRate =
    totalRequests > 0
      ? ((approvedRequests + rejectedRequests) / totalRequests) * 100
      : 0;

  
  const serializedRequests = allRequests.map((request) => ({
    ...request,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    reviewedAt: request.reviewedAt?.toISOString() || null,
    user: {
      ...request.user,
      createdAt: request.user.createdAt.toISOString(),
    },
  }));

  return (
    <RoleRequestsPageClient
      totalRequests={totalRequests}
      pendingCount={pendingCount}
      responseRate={responseRate}
      serializedRequests={serializedRequests}
      currentUserRole={currentUser.role}
    />
  );
}
