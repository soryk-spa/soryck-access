import { Suspense } from "react";
import { requireOrganizer } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardEventNewPage } from "@/components/dashboard-event-new-page";
import { Loader2 } from "lucide-react";
import type { Category } from "@/types";

// Force dynamic rendering for this page
export const dynamic = 'force-dynamic'


function LoadingSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
        <h2 className="text-xl font-semibold mb-2">Preparando el formulario...</h2>
        <p className="text-muted-foreground">Cargando las categorías disponibles</p>
      </div>
    </div>
  );
}


async function CreateEventPage() {
  
  await requireOrganizer();

  
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      description: true,
    },
  });

  
  const transformedCategories: Category[] = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    description: cat.description || undefined,
  }));

  return <DashboardEventNewPage categories={transformedCategories} />;
}

export default function NewEventPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <CreateEventPage />
    </Suspense>
  );
}
