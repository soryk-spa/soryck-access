import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import PublicEventsList from "@/components/public-events-list";
import type { Metadata } from "next";
import { Prisma } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Sparkles,
  TrendingUp,
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
  }));

  return { events: serializedEvents, pagination };
}

async function getCategories() {
  return await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

async function getEventStats() {
  const [totalEvents, upcomingEvents, categoriesCount] = await Promise.all([
    prisma.event.count({
      where: { isPublished: true },
    }),
    prisma.event.count({
      where: {
        isPublished: true,
        startDate: { gte: new Date() },
      },
    }),
    prisma.category.count(),
  ]);

  return {
    totalEvents,
    upcomingEvents,
    categoriesCount,
  };
}

function EventsPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header skeleton */}
        <div className="text-center space-y-4">
          <div className="h-12 bg-muted rounded w-96 mx-auto animate-pulse"></div>
          <div className="h-6 bg-muted rounded w-[600px] mx-auto animate-pulse"></div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-32 bg-muted rounded-xl animate-pulse"
            ></div>
          ))}
        </div>

        {/* Filters skeleton */}
        <div className="h-32 bg-muted rounded-xl animate-pulse"></div>

        {/* Events grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-96 bg-muted rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function EventsPageContent({ searchParams }: EventsPageProps) {
  const params = await searchParams;

  const [{ events, pagination }, categories, stats] = await Promise.all([
    getPublicEvents(params),
    getCategories(),
    getEventStats(),
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
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0053CC]/5 via-[#01CBFE]/5 to-[#CC66CC]/5 border-b">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-background/80 backdrop-blur-sm border rounded-full px-4 py-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#0053CC]" />
              <span className="text-sm font-medium text-[#0053CC]">
                Descubre experiencias únicas
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Encuentra tu próximo
              <span className="bg-gradient-to-r from-[#0053CC] to-[#01CBFE] bg-clip-text text-transparent">
                {" "}
                evento favorito
              </span>
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Desde conciertos íntimos hasta festivales masivos, conferencias
              inspiradoras y experiencias gastronómicas. Tu próxima aventura te
              está esperando.
            </p>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <Card className="border-0 bg-background/60 backdrop-blur-sm shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#0053CC] to-[#01CBFE] rounded-xl flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">
                        {stats.upcomingEvents}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Eventos próximos
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-background/60 backdrop-blur-sm shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#FE4F00] to-[#CC66CC] rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">
                        {stats.categoriesCount}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Categorías
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 bg-background/60 backdrop-blur-sm shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="text-3xl font-bold">{stats.totalEvents}</p>
                      <p className="text-sm text-muted-foreground">
                        Total eventos
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-24 h-24 bg-gradient-to-r from-[#01CBFE] to-[#0053CC] rounded-full opacity-10 blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-gradient-to-r from-[#CC66CC] to-[#FE4F00] rounded-full opacity-10 blur-xl"></div>
      </section>

      {/* Quick Categories */}
      <section className="py-8 border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#0053CC]" />
              Explora por categoría
            </h2>
            <Badge variant="outline" className="text-xs">
              {categories.length} categorías disponibles
            </Badge>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.slice(0, 8).map((category) => (
              <Badge
                key={category.id}
                variant="outline"
                className="cursor-pointer hover:bg-[#0053CC] hover:text-white transition-colors px-4 py-2 text-sm"
              >
                {category.name}
              </Badge>
            ))}
            {categories.length > 8 && (
              <Badge variant="outline" className="text-muted-foreground">
                +{categories.length - 8} más
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#0053CC]" />
              <h2 className="text-2xl font-bold">Eventos disponibles</h2>
            </div>
            <Badge variant="secondary" className="text-sm">
              {pagination.totalCount} resultados
            </Badge>
          </div>

          <PublicEventsList
            initialEvents={events}
            initialPagination={pagination}
            categories={categories}
            initialFilters={initialFilters}
          />
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
