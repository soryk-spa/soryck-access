import { Suspense } from "react";
import { prisma } from "@/lib/prisma";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import PublicEventsList from "@/components/public-events-list";
import type { Metadata } from "next";
import { Prisma } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Clock,
} from "lucide-react";

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
        ticketTypes: {
          select: {
            price: true,
            currency: true,
            capacity: true,
          },
          orderBy: {
            price: "asc",
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

  const serializedEvents = events.map((event) => ({
    ...event,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate ? event.endDate.toISOString() : undefined,
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    description: event.description ?? "",
    imageUrl: event.imageUrl === null ? undefined : event.imageUrl,
    ticketTypes: event.ticketTypes || [],
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-20">
        <div className="space-y-16">
          {}
          <div className="space-y-6">
            <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 w-24 bg-muted border border-border rounded-full animate-pulse"
                ></div>
              ))}
            </div>
          </div>

          {}
          <div className="space-y-6">
            <div className="h-10 bg-muted rounded w-80 animate-pulse"></div>
            <div className="bg-muted/50 border border-border rounded-3xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-96 bg-muted border border-border rounded-2xl animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          </div>
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
    page: params.page || "1",
  };

  return (
    <div className="min-h-screen bg-background">
      {}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-[#CC66CC] to-[#FE4F00] rounded-xl flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-foreground">Eventos disponibles</h2>
                <p className="text-muted-foreground text-sm">Encuentra tu próxima experiencia</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge 
                variant="secondary" 
                className="px-4 py-2"
              >
                {pagination.totalCount} resultados
              </Badge>
            </div>
          </div>

          <div className="bg-muted/50 border border-border rounded-3xl p-8">
            <PublicEventsList
              initialEvents={events}
              initialPagination={pagination}
              categories={categories}
              initialFilters={initialFilters}
            />
          </div>
        </div>
      </section>
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

  let title = "Descubre Eventos Increíbles | SorykPass";
  let description =
    "Encuentra los mejores eventos cerca de ti. Conciertos, conferencias, deportes, gastronomía y más experiencias únicas en SorykPass.";
  const keywords =
    "eventos, tickets, conciertos, conferencias, deportes, cultura, gastronomía, experiencias, chile";

  if (search) {
    title = `Eventos: ${search} | SorykPass`;
    description = `Descubre eventos relacionados con ${search}. Compra tickets de forma segura en SorykPass.`;
  }

  if (categoryId) {
    try {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
        select: { name: true },
      });
      if (category) {
        title = `Eventos de ${category.name} | SorykPass`;
        description = `Explora los mejores eventos de ${category.name}. Tickets seguros y experiencias únicas en SorykPass.`;
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
      images: [
        {
          url: "/og-events.jpg",
          width: 1200,
          height: 630,
          alt: "Descubre eventos increíbles en SorykPass",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-events.jpg"],
    },
  };
}
