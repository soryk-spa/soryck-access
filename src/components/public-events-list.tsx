"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  DollarSign,
  Grid3X3,
  List,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Sparkles,
  TrendingUp,
  Clock,
  Users,
  FilterX,
  Heart,
  ExternalLink,
  Bookmark,
} from "lucide-react";
import { toast } from "sonner";

interface TicketType {
  price: number;
  currency: string;
  capacity: number;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  location: string;
  startDate: string;
  endDate?: string;
  isPublished: boolean;
  price: number;
  isFree: boolean;
  category: {
    id: string;
    name: string;
  };
  organizer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  _count: {
    tickets: number;
    orders: number;
  };
  ticketTypes?: TicketType[];
}

interface Category {
  id: string;
  name: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

interface Filters {
  search: string;
  categoryId: string;
  location: string;
  minPrice: string;
  maxPrice: string;
  dateFrom: string;
  dateTo: string;
  isFree: string;
  sortBy: string;
  sortOrder: string;
  page?: string;
}

interface PublicEventsListProps {
  initialEvents: Event[];
  initialPagination: Pagination;
  categories: Category[];
  initialFilters: Filters;
}


const GlassCard = ({
  children,
  className = "",
  ...props
}: React.PropsWithChildren<{ className?: string } & React.HTMLAttributes<HTMLDivElement>>) => (
  <div
    className={`relative overflow-hidden rounded-2xl bg-white/80 dark:bg-black/80 backdrop-blur-lg border border-white/20 dark:border-white/10 shadow-lg hover:shadow-xl transition-all duration-300 ${className}`}
    {...props}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
    {children}
  </div>
);

const EventCardAceternity = ({
  event,
  variant = "default",
}: {
  event: Event;
  variant?: string;
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate().toString().padStart(2, "0"),
      month: date.toLocaleDateString("es-ES", { month: "short", timeZone: "America/Santiago" }).toUpperCase(),
      year: date.getFullYear(),
      time: date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "America/Santiago",
      }),
    };
  };

  const getPriceDisplay = () => {
    
    if (event.isFree) return "Gratis";
    
    
    const allPrices: number[] = [];
    
    
    if (event.price && event.price > 0) {
      allPrices.push(event.price);
    }
    
    
    if (event.ticketTypes?.length) {
      const ticketPrices = event.ticketTypes.map((t) => t.price).filter((p) => p > 0);
      allPrices.push(...ticketPrices);
    }
    
    
    if (allPrices.length === 0) return "Gratis";
    
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    
    
    if (minPrice === maxPrice) {
      return formatPrice(minPrice);
    }
    
    
    return `Desde ${formatPrice(minPrice)}`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const eventDate = formatDate(event.startDate);

  if (variant === "compact") {
    return (
      <div className="group relative">
        <Card className="relative overflow-hidden h-48 bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/25">
          {}
          {event.imageUrl ? (
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              sizes="100vw"
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
              <Calendar className="h-16 w-16 text-white/20" />
            </div>
          )}

          {}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

          {}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer" />
          </div>

          {}
          <div className="relative z-20 p-6 h-full flex">
            {}
            <div className="flex-shrink-0 mr-6">
              <div className="bg-black/50 backdrop-blur-xl rounded-2xl px-4 py-3 border border-white/10 text-center">
                <div className="text-2xl font-bold text-white">
                  {eventDate.day}
                </div>
                <div className="text-xs text-white/70 uppercase tracking-wider">
                  {eventDate.month}
                </div>
              </div>
            </div>

            {}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <Badge className="bg-black/50 backdrop-blur-xl border border-white/10 text-white px-3 py-1 text-xs font-medium mb-3">
                  {event.category.name}
                </Badge>
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
                  {event.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-white/80 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span>{eventDate.time}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-blue-400" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  {getPriceDisplay() === "Gratis" ? (
                    <span className="text-xl font-bold text-green-400">
                      Gratis
                    </span>
                  ) : (
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                      {getPriceDisplay()}
                    </span>
                  )}
                </div>

                <Button
                  size="sm"
                  className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl text-white"
                  asChild
                >
                  <Link href={`/events/${event.id}`}>
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {}
            <div className="flex-shrink-0 ml-4 flex flex-col gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/10 backdrop-blur-sm border-0 text-white hover:bg-white/20 w-10 h-10"
                onClick={() => setIsLiked(!isLiked)}
              >
                <Heart
                  className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
                />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="bg-white/10 backdrop-blur-sm border-0 text-white hover:bg-white/20 w-10 h-10"
                onClick={() => setIsSaved(!isSaved)}
              >
                <Bookmark
                  className={`w-4 h-4 ${isSaved ? "fill-yellow-500 text-yellow-500" : ""}`}
                />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="group relative">
      <Card className="relative overflow-hidden h-[550px] bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/25">
        {}
        {event.imageUrl ? (
          <Image
            src={event.imageUrl}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
            <Calendar className="h-24 w-24 text-white/20" />
          </div>
        )}

        {}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        {}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer" />
        </div>

        {}
        <div className="absolute top-6 left-6 z-20">
          <div className="bg-black/50 backdrop-blur-xl rounded-3xl px-4 py-3 border border-white/10">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {eventDate.day}
              </div>
              <div className="text-xs text-white/70 uppercase tracking-wider">
                {eventDate.month}
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-6 right-6 z-20 space-y-3">
          <Badge className="bg-black/50 backdrop-blur-xl border border-white/10 text-white px-4 py-2 text-xs font-medium block">
            {event.category.name}
          </Badge>

          {}
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="ghost"
              className="bg-black/50 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20 w-10 h-10"
              onClick={() => setIsLiked(!isLiked)}
            >
              <Heart
                className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`}
              />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="bg-black/50 backdrop-blur-xl border border-white/10 text-white hover:bg-white/20 w-10 h-10"
              onClick={() => setIsSaved(!isSaved)}
            >
              <Bookmark
                className={`w-4 h-4 ${isSaved ? "fill-yellow-500 text-yellow-500" : ""}`}
              />
            </Button>
          </div>
        </div>

        {}
        <div className="absolute top-32 right-6 z-20">
          <div className="bg-black/50 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/10">
            {getPriceDisplay() === "Gratis" ? (
              <span className="text-lg font-bold text-green-400">Gratis</span>
            ) : (
              <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                {getPriceDisplay()}
              </span>
            )}
          </div>
        </div>

        {}
        <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
          {}
          <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-6 mb-4 border border-white/10">
            <h3 className="text-2xl font-bold text-white mb-3 line-clamp-2 leading-tight group-hover:text-blue-300 transition-colors">
              {event.title}
            </h3>

            {event.description && (
              <p className="text-white/70 text-sm line-clamp-2 mb-3">
                {event.description}
              </p>
            )}
            <div className="flex items-center justify-between text-sm text-white/80 mb-3"></div>
            <div className="flex items-center justify-between text-sm text-white/80">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-400" />
                <span className="line-clamp-1">{event.location}</span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span>{eventDate.time}</span>
              </div>
            </div>
          </div>

          {}
          <Button
            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl text-white font-semibold py-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10"
            asChild
          >
            <Link
              href={`/events/${event.id}`}
              className="flex items-center justify-center gap-3"
            >
              Ver Evento
              <ExternalLink className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default function PublicEventsList({
  initialEvents,
  initialPagination,
  categories,
  initialFilters,
}: PublicEventsListProps) {
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  const updateFilters = async (
    newFilters: Partial<Filters>,
    resetPage = true
  ) => {
    const updatedFilters = { ...filters, ...newFilters };
    if (resetPage) {
      updatedFilters.page = "1";
    }

    setFilters(updatedFilters);
    setLoading(true);

    try {
      const params = new URLSearchParams();
      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (value && value !== "all" && key !== "page") {
          params.set(key, value);
        }
      });
      if (updatedFilters.page && updatedFilters.page !== "1") {
        params.set("page", updatedFilters.page);
      }

      router.push(`/events?${params.toString()}`, { scroll: false });

      const response = await fetch(`/api/events/public?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setEvents(data.events);
        setPagination(data.pagination);
      } else {
        toast.error("Error al cargar eventos");
      }
    } catch (error) {
      console.error("Error filtering events:", error);
      toast.error("Error al filtrar eventos");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({});
  };

  const clearFilters = () => {
    const clearedFilters: Filters = {
      search: "",
      categoryId: "",
      location: "",
      minPrice: "",
      maxPrice: "",
      dateFrom: "",
      dateTo: "",
      isFree: "all",
      sortBy: "startDate",
      sortOrder: "asc",
      page: "1",
    };
    updateFilters(clearedFilters);
  };

  const goToPage = (page: number) => {
    updateFilters({ page: page.toString() }, false);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    return (
      value &&
      value !== "all" &&
      key !== "sortBy" &&
      key !== "sortOrder" &&
      key !== "page"
    );
  });

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    return (
      value &&
      value !== "all" &&
      key !== "sortBy" &&
      key !== "sortOrder" &&
      key !== "page"
    );
  }).length;

  return (
    <div className="space-y-8 min-h-screen p-6">
      {}
      <GlassCard className="border-2 dark:bg-zinc-900 border-white/30">
        <div className="p-8">
          <div className="space-y-6">
            {}
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search" className="sr-only">
                    Buscar eventos
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="¿Qué tipo de evento buscas? Ej: concierto, conferencia, deportes..."
                      value={filters.search}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          search: e.target.value,
                        }))
                      }
                      className="pl-12 h-14 text-lg bg-white/50 dark:bg-black/50 backdrop-blur-sm border-2 border-white/20 focus:border-blue-500 transition-all duration-300 rounded-2xl"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 px-8 rounded-2xl shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Buscar
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => setShowFilters(!showFilters)}
                    className="relative px-6 border-2 border-white/20 hover:border-blue-500 transition-colors bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-2xl"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filtros
                    {activeFiltersCount > 0 && (
                      <Badge
                        variant="default"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500 hover:bg-red-600 text-xs flex items-center justify-center"
                      >
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>

              {}
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant={filters.isFree === "true" ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    updateFilters({
                      isFree: filters.isFree === "true" ? "all" : "true",
                    })
                  }
                  className={`${
                    filters.isFree === "true"
                      ? "bg-gradient-to-r from-green-400 to-green-600 text-white"
                      : "bg-white/20 dark:bg-black/20 backdrop-blur-sm border-white/20"
                  } rounded-full`}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Gratis
                </Button>

                <Button
                  type="button"
                  variant={
                    filters.sortBy === "startDate" &&
                    filters.sortOrder === "asc"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    updateFilters({ sortBy: "startDate", sortOrder: "asc" })
                  }
                  className={`${
                    filters.sortBy === "startDate" &&
                    filters.sortOrder === "asc"
                      ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
                      : "bg-white/20 dark:bg-black/20 backdrop-blur-sm border-white/20"
                  } rounded-full`}
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Próximamente
                </Button>

                <Button
                  type="button"
                  variant={
                    filters.sortBy === "createdAt" &&
                    filters.sortOrder === "desc"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    updateFilters({ sortBy: "createdAt", sortOrder: "desc" })
                  }
                  className={`${
                    filters.sortBy === "createdAt" &&
                    filters.sortOrder === "desc"
                      ? "bg-gradient-to-r from-purple-400 to-purple-600 text-white"
                      : "bg-white/20 dark:bg-black/20 backdrop-blur-sm border-white/20"
                  } rounded-full`}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Nuevos
                </Button>

                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-full"
                  >
                    <FilterX className="h-4 w-4 mr-2" />
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>
      </GlassCard>

      {}
      {showFilters && (
        <GlassCard className="border-2 border-blue-500/20 shadow-2xl">
          <div className="bg-gradient-to-r from-blue-500/5 to-purple-500/5 p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-blue-500" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  Filtros avanzados
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
                className="rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {}
              <div className="space-y-2">
                <Label
                  htmlFor="category"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Categoría
                </Label>
                <Select
                  value={filters.categoryId}
                  onValueChange={(value) =>
                    updateFilters({ categoryId: value === "all" ? "" : value })
                  }
                >
                  <SelectTrigger className="border-2 border-white/20 bg-white/50 dark:bg-black/50 backdrop-blur-sm focus:border-blue-500 rounded-2xl">
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las categorías</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {}
              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Ubicación
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    placeholder="Ciudad o lugar"
                    value={filters.location}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    className="pl-10 border-2 border-white/20 bg-white/50 dark:bg-black/50 backdrop-blur-sm focus:border-blue-500 rounded-2xl"
                  />
                </div>
              </div>

              {}
              <div className="space-y-2">
                <Label
                  htmlFor="priceType"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Precio
                </Label>
                <Select
                  value={filters.isFree}
                  onValueChange={(value) => updateFilters({ isFree: value })}
                >
                  <SelectTrigger className="border-2 border-white/20 bg-white/50 dark:bg-black/50 backdrop-blur-sm focus:border-blue-500 rounded-2xl">
                    <SelectValue placeholder="Todos los precios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los precios</SelectItem>
                    <SelectItem value="true">Solo eventos gratuitos</SelectItem>
                    <SelectItem value="false">Solo eventos de pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {}
              <div className="space-y-2">
                <Label
                  htmlFor="sortBy"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Ordenar por
                </Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => updateFilters({ sortBy: value })}
                >
                  <SelectTrigger className="border-2 border-white/20 bg-white/50 dark:bg-black/50 backdrop-blur-sm focus:border-blue-500 rounded-2xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startDate">Fecha del evento</SelectItem>
                    <SelectItem value="title">Nombre A-Z</SelectItem>
                    <SelectItem value="createdAt">Más recientes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <DollarSign className="h-4 w-4 text-green-500" />
                Rango de precios (CLP)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="minPrice"
                    className="text-xs text-gray-500 dark:text-gray-400"
                  >
                    Precio mínimo
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="minPrice"
                      type="number"
                      placeholder="0"
                      value={filters.minPrice}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          minPrice: e.target.value,
                        }))
                      }
                      className="pl-10 border-2 border-white/20 bg-white/50 dark:bg-black/50 backdrop-blur-sm focus:border-blue-500 rounded-2xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="maxPrice"
                    className="text-xs text-gray-500 dark:text-gray-400"
                  >
                    Precio máximo
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="maxPrice"
                      type="number"
                      placeholder="Sin límite"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          maxPrice: e.target.value,
                        }))
                      }
                      className="pl-10 border-2 border-white/20 bg-white/50 dark:bg-black/50 backdrop-blur-sm focus:border-blue-500 rounded-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Calendar className="h-4 w-4 text-purple-500" />
                Rango de fechas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="dateFrom"
                    className="text-xs text-gray-500 dark:text-gray-400"
                  >
                    Desde
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="dateFrom"
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          dateFrom: e.target.value,
                        }))
                      }
                      className="pl-10 border-2 border-white/20 bg-white/50 dark:bg-black/50 backdrop-blur-sm focus:border-blue-500 rounded-2xl"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="dateTo"
                    className="text-xs text-gray-500 dark:text-gray-400"
                  >
                    Hasta
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="dateTo"
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) =>
                        setFilters((prev) => ({
                          ...prev,
                          dateTo: e.target.value,
                        }))
                      }
                      className="pl-10 border-2 border-white/20 bg-white/50 dark:bg-black/50 backdrop-blur-sm focus:border-blue-500 rounded-2xl"
                    />
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-white/10">
              <Button
                onClick={() => updateFilters({})}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 rounded-2xl shadow-lg"
              >
                <Search className="h-4 w-4 mr-2" />
                Aplicar filtros
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="border-2 border-white/20 bg-white/20 dark:bg-black/20 backdrop-blur-sm hover:border-red-500 rounded-2xl"
                >
                  <FilterX className="h-4 w-4 mr-2" />
                  Limpiar todos los filtros
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => setShowFilters(false)}
                className="sm:ml-auto rounded-2xl"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </GlassCard>
      )}

      {}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500" />
                <span>Cargando eventos...</span>
              </div>
            ) : (
              <>
                <Users className="h-5 w-5 text-blue-500" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {pagination.totalCount.toLocaleString()} eventos encontrados
                </span>
              </>
            )}
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Filtros activos:
              </span>
              {filters.search && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full"
                >
                  Búsqueda: &quot;{filters.search}&quot;
                </Badge>
              )}
              {filters.categoryId && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full"
                >
                  {categories.find((c) => c.id === filters.categoryId)?.name}
                </Badge>
              )}
              {filters.location && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full"
                >
                  📍 {filters.location}
                </Badge>
              )}
              {filters.isFree === "true" && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full"
                >
                  Gratis
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Vista:
            </span>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={`${
                viewMode === "grid"
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  : "bg-white/20 dark:bg-black/20 backdrop-blur-sm border-white/20"
              } rounded-full`}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={`${
                viewMode === "list"
                  ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                  : "bg-white/20 dark:bg-black/20 backdrop-blur-sm border-white/20"
              } rounded-full`}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Badge
            variant="outline"
            className="text-sm bg-white/20 dark:bg-black/20 backdrop-blur-sm border-white/20 rounded-full"
          >
            Página {pagination.currentPage} de {pagination.totalPages}
          </Badge>
        </div>
      </div>

      {}
      {loading ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              : "space-y-6"
          }
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[550px] bg-white/10 dark:bg-black/10 backdrop-blur-sm rounded-2xl animate-pulse border border-white/10"
            />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <div className="relative mx-auto mb-8">
            <div className="w-32 h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
              <Calendar className="h-16 w-16 text-white/40" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
          </div>

          <h3 className="text-4xl font-bold mb-6 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            {hasActiveFilters
              ? "No se encontraron eventos"
              : "¡Próximamente eventos increíbles!"}
          </h3>
          <p className="text-white/60 mb-10 max-w-md mx-auto text-lg leading-relaxed">
            {hasActiveFilters
              ? "Intenta ajustar tus filtros para ver más resultados. Puedes ampliar el rango de fechas o cambiar la categoría."
              : "Estamos preparando eventos fantásticos para ti. Mientras tanto, puedes explorar nuestra plataforma."}
          </p>

          {hasActiveFilters && (
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="border-2 border-white/20 bg-white/20 dark:bg-black/20 backdrop-blur-sm hover:border-blue-500 rounded-2xl text-white"
              >
                <FilterX className="h-4 w-4 mr-2" />
                Limpiar todos los filtros
              </Button>
              <p className="text-xs text-white/40">
                o intenta con términos de búsqueda más generales
              </p>
            </div>
          )}
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              : "space-y-6"
          }
        >
          {events.map((event, index) => (
            <div
              key={event.id}
              style={{
                animationDelay: `${index * 100}ms`,
              }}
            >
              <EventCardAceternity
                event={{
                  ...event,
                  ticketTypes: event.ticketTypes ?? [],
                }}
                variant={viewMode === "list" ? "compact" : "default"}
              />
            </div>
          ))}
        </div>
      )}

      {}
      {pagination.totalPages > 1 && (
        <div className="bg-black/20 backdrop-blur-xl rounded-3xl border border-white/10 p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span>
                Mostrando {(pagination.currentPage - 1) * pagination.limit + 1}{" "}
                -{" "}
                {Math.min(
                  pagination.currentPage * pagination.limit,
                  pagination.totalCount
                )}{" "}
                de {pagination.totalCount} eventos
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={!pagination.hasPrevPage || loading}
                className="border-2 border-white/20 bg-white/10 backdrop-blur-sm hover:border-blue-500 rounded-2xl text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({
                  length: Math.min(5, pagination.totalPages),
                }).map((_, i) => {
                  const pageNum = Math.max(
                    1,
                    Math.min(
                      pagination.totalPages - 4,
                      Math.max(1, pagination.currentPage - 2)
                    ) + i
                  );

                  if (pageNum > pagination.totalPages) return null;

                  return (
                    <Button
                      key={pageNum}
                      variant={
                        pageNum === pagination.currentPage
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() => goToPage(pageNum)}
                      disabled={loading}
                      className={
                        pageNum === pagination.currentPage
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 rounded-2xl"
                          : "border-2 border-white/20 bg-white/10 backdrop-blur-sm hover:border-blue-500 rounded-2xl text-white hover:bg-white/20"
                      }
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                {pagination.totalPages > 5 &&
                  pagination.currentPage < pagination.totalPages - 2 && (
                    <>
                      <span className="px-2 text-white/40">...</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(pagination.totalPages)}
                        disabled={loading}
                        className="border-2 border-white/20 bg-white/10 backdrop-blur-sm hover:border-blue-500 rounded-2xl text-white hover:bg-white/20"
                      >
                        {pagination.totalPages}
                      </Button>
                    </>
                  )}
              </div>

              <Button
                variant="outline"
                onClick={() => goToPage(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage || loading}
                className="border-2 border-white/20 bg-white/10 backdrop-blur-sm hover:border-blue-500 rounded-2xl text-white hover:bg-white/20"
              >
                Siguiente
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) skewX(-12deg);
          }
          100% {
            transform: translateX(200%) skewX(-12deg);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}
