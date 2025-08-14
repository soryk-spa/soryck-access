import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import PublicEventsList from "@/components/public-events-list";
import type { Metadata } from "next";
import { Prisma } from "@prisma/client";

interface EventsPageProps {
  searchParams: Promise<{
    search?: string;
    categoryId?: string;
    location?: string;
    minPrice?: string;
    maxPrice?: string;
    dateFrom?: string;
    dateTo?: string;
    isFree?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: string;
  }>;
}

interface PublicEventFilters {
  search?: string;
  categoryId?: string;
  location?: string;
  minPrice?: string;
  maxPrice?: string;
  dateFrom?: string;
  dateTo?: string;
  isFree?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
}

async function getPublicEvents(filters: PublicEventFilters) {
  const {
    search = "",
    categoryId = "",
    location = "",
    minPrice,
    maxPrice,
    dateFrom,
    dateTo,
    isFree,
    sortBy = "startDate",
    sortOrder = "asc",
    page = "1",
  } = filters;

  const currentPage = parseInt(page) || 1;
  const limit = 12;
  const skip = (currentPage - 1) * limit;

  const whereClause: Prisma.EventWhereInput = {
    isPublished: true,
    startDate: {
      gte: new Date(),
    },
  };

  if (search) {
    whereClause.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  if (location) {
    whereClause.location = { contains: location, mode: "insensitive" };
  }

  // La lógica de `isFree` y precios ahora se aplica a los `ticketTypes` anidados.
  if (isFree === "true") {
    whereClause.ticketTypes = { some: { price: { equals: 0 } } };
  } else if (isFree === "false") {
    whereClause.ticketTypes = { some: { price: { gt: 0 } } };
  }

  if (minPrice || maxPrice) {
    whereClause.ticketTypes = {
      some: {
        AND: [
          minPrice ? { price: { gte: parseFloat(minPrice) } } : {},
          maxPrice ? { price: { lte: parseFloat(maxPrice) } } : {},
        ],
      },
    };
  }

  if (dateFrom) {
    whereClause.startDate = {
      ...(typeof whereClause.startDate === "object" &&
      whereClause.startDate !== null
        ? whereClause.startDate
        : {}),
      gte: new Date(dateFrom),
    };
  }

  if (dateTo) {
    whereClause.startDate = {
      ...(typeof whereClause.startDate === "object" &&
      whereClause.startDate !== null
        ? whereClause.startDate
        : {}),
      lte: new Date(dateTo),
    };
  }

  const getOrderBy = () => {
    const order = sortOrder as "asc" | "desc";
    // La ordenación por precio ahora es más compleja, así que la manejamos como un caso especial.
    // Para una ordenación precisa por precio mínimo, se requeriría una consulta más avanzada.
    // Por ahora, mantenemos la ordenación por fecha como la principal.
    switch (sortBy) {
      case "title":
        return { title: order };
      case "createdAt":
        return { createdAt: order };
      default:
        return { startDate: order };
    }
  };

  const [events, totalCount] = await Promise.all([
    prisma.event.findMany({
      where: whereClause,
      include: {
        category: {
          select: { id: true, name: true },
        },
        organizer: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        _count: {
          select: { tickets: true, orders: true },
        },
        // ✅ CAMBIO CLAVE: Incluimos los tipos de entrada en la consulta.
        ticketTypes: {
          select: {
            price: true,
            currency: true,
            capacity: true,
          },
          orderBy: {
            price: "asc", // Ordenamos para obtener fácilmente el precio mínimo.
          },
        },
      },
      orderBy: getOrderBy(),
      skip,
      take: limit,
    }),
    prisma.event.count({ where: whereClause }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);
  const pagination = {
    currentPage,
    totalPages,
    totalCount,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    limit,
  };

  // Aseguramos que los datos serializados incluyan los `ticketTypes`.
  const serializedEvents = events.map((event) => ({
    ...event,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate ? event.endDate.toISOString() : undefined,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    description: event.description ?? "",
    imageUrl: event.imageUrl === null ? undefined : event.imageUrl,
  }));

  return { events: serializedEvents, pagination };
}

async function getCategories() {
  return await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

function EventsPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        <div className="text-center">
          <div className="h-8 bg-muted rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-muted rounded w-96 mx-auto"></div>
        </div>

        <div className="h-32 bg-muted rounded"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-96 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function EventsPageContent({ searchParams }: EventsPageProps) {
  const params = await searchParams;

  const [{ events, pagination }, categories] = await Promise.all([
    getPublicEvents(params),
    getCategories(),
  ]);

  const initialFilters = {
    search: params.search || "",
    categoryId: params.categoryId || "",
    location: params.location || "",
    minPrice: params.minPrice || "",
    maxPrice: params.maxPrice || "",
    dateFrom: params.dateFrom || "",
    dateTo: params.dateTo || "",
    isFree: params.isFree || "all",
    sortBy: params.sortBy || "startDate",
    sortOrder: params.sortOrder || "asc",
    page: params.page || "1", // ✅ Agregar esta línea
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Descubre Eventos Increíbles
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Encuentra los mejores eventos cerca de ti. Conciertos, conferencias,
          deportes y mucho más.
        </p>
      </div>
      <PublicEventsList
        initialEvents={events}
        initialPagination={pagination}
        categories={categories}
        initialFilters={initialFilters}
      />
    </div>
  );
}

export default function EventsPage(props: EventsPageProps) {
  return (
    <Suspense fallback={<EventsPageSkeleton />}>
      <EventsPageContent {...props} />
    </Suspense>
  );
}

export async function generateMetadata({
  searchParams,
}: EventsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const search = params.search;
  const categoryId = params.categoryId;

  let title = "Eventos | SorykPass";
  let description =
    "Descubre eventos increíbles cerca de ti. Conciertos, conferencias, deportes y más en SorykPass.";
  const keywords =
    "eventos, tickets, conciertos, conferencias, deportes, cultura, chile";

  if (search) {
    title = `Eventos: ${search} | SorykPass`;
    description = `Encuentra eventos relacionados con ${search} en SorykPass`;
  }

  if (categoryId) {
    try {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { name: true },
      });
      if (category) {
        title = `Eventos de ${category.name} | SorykPass`;
        description = `Descubre los mejores eventos de ${category.name} en SorykPass`;
      }
    } catch (error) {
      console.error("Error fetching category for metadata:", error);
    }
  }

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
