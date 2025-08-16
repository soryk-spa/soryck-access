"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import EventCard from "@/components/event-card";
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
  ticketTypes: TicketType[];
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
    <div className="space-y-8">
      {/* Enhanced Search Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-background to-muted/20">
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Main Search */}
            <form onSubmit={handleSearch} className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="search" className="sr-only">
                    Buscar eventos
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
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
                      className="pl-12 h-14 text-lg bg-background border-2 focus:border-[#0053CC] transition-colors"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="bg-gradient-to-r from-[#0053CC] to-[#01CBFE] hover:from-[#0053CC]/90 hover:to-[#01CBFE]/90 px-8"
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
                    className="relative px-6 border-2 hover:border-[#0053CC] transition-colors"
                  >
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filtros
                    {activeFiltersCount > 0 && (
                      <Badge
                        variant="default"
                        className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-[#FE4F00] hover:bg-[#FE4F00]/90 text-xs flex items-center justify-center"
                      >
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </Button>
                </div>
              </div>

              {/* Quick Filters */}
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
                  className={filters.isFree === "true" ? "bg-[#0053CC]" : ""}
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
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <FilterX className="h-4 w-4 mr-2" />
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </form>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <Card className="border-2 border-[#0053CC]/20 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-[#0053CC]/5 to-[#01CBFE]/5">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-[#0053CC]" />
                Filtros avanzados
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium">
                  Categoría
                </Label>
                <Select
                  value={filters.categoryId}
                  onValueChange={(value) =>
                    updateFilters({ categoryId: value === "all" ? "" : value })
                  }
                >
                  <SelectTrigger className="border-2 focus:border-[#0053CC]">
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

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  Ubicación
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                    className="pl-10 border-2 focus:border-[#0053CC]"
                  />
                </div>
              </div>

              {/* Price Type */}
              <div className="space-y-2">
                <Label htmlFor="priceType" className="text-sm font-medium">
                  Precio
                </Label>
                <Select
                  value={filters.isFree}
                  onValueChange={(value) => updateFilters({ isFree: value })}
                >
                  <SelectTrigger className="border-2 focus:border-[#0053CC]">
                    <SelectValue placeholder="Todos los precios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los precios</SelectItem>
                    <SelectItem value="true">Solo eventos gratuitos</SelectItem>
                    <SelectItem value="false">Solo eventos de pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label htmlFor="sortBy" className="text-sm font-medium">
                  Ordenar por
                </Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => updateFilters({ sortBy: value })}
                >
                  <SelectTrigger className="border-2 focus:border-[#0053CC]">
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

            {/* Price Range */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Rango de precios (CLP)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="minPrice"
                    className="text-xs text-muted-foreground"
                  >
                    Precio mínimo
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                      className="pl-10 border-2 focus:border-[#0053CC]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="maxPrice"
                    className="text-xs text-muted-foreground"
                  >
                    Precio máximo
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                      className="pl-10 border-2 focus:border-[#0053CC]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Rango de fechas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="dateFrom"
                    className="text-xs text-muted-foreground"
                  >
                    Desde
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                      className="pl-10 border-2 focus:border-[#0053CC]"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="dateTo"
                    className="text-xs text-muted-foreground"
                  >
                    Hasta
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
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
                      className="pl-10 border-2 focus:border-[#0053CC]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button
                onClick={() => updateFilters({})}
                className="bg-gradient-to-r from-[#0053CC] to-[#01CBFE] hover:from-[#0053CC]/90 hover:to-[#01CBFE]/90"
              >
                <Search className="h-4 w-4 mr-2" />
                Aplicar filtros
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  <FilterX className="h-4 w-4 mr-2" />
                  Limpiar todos los filtros
                </Button>
              )}
              <Button
                variant="ghost"
                onClick={() => setShowFilters(false)}
                className="sm:ml-auto"
              >
                Cerrar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#0053CC]" />
                <span>Cargando eventos...</span>
              </div>
            ) : (
              <>
                <Users className="h-5 w-5 text-[#0053CC]" />
                <span className="text-lg font-semibold">
                  {pagination.totalCount.toLocaleString()} eventos encontrados
                </span>
              </>
            )}
          </div>

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-muted-foreground">
                Filtros activos:
              </span>
              {filters.search && (
                <Badge variant="secondary" className="text-xs">
                  Búsqueda: &quot;{filters.search}&quot;
                </Badge>
              )}
              {filters.categoryId && (
                <Badge variant="secondary" className="text-xs">
                  {categories.find((c) => c.id === filters.categoryId)?.name}
                </Badge>
              )}
              {filters.location && (
                <Badge variant="secondary" className="text-xs">
                  📍 {filters.location}
                </Badge>
              )}
              {filters.isFree === "true" && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-green-100 text-green-800"
                >
                  Gratis
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Vista:</span>
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-[#0053CC]" : ""}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-[#0053CC]" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          <Badge variant="outline" className="text-sm">
            Página {pagination.currentPage} de {pagination.totalPages}
          </Badge>
        </div>
      </div>

      {/* Events Grid/List */}
      {loading ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-96 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card className="text-center py-16 border-2 border-dashed border-muted-foreground/20">
          <CardContent>
            <div className="space-y-6">
              <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center">
                <Search className="w-12 h-12 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-semibold">
                  No se encontraron eventos
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {hasActiveFilters
                    ? "Intenta ajustar tus filtros para ver más resultados. Puedes ampliar el rango de fechas o cambiar la categoría."
                    : "Parece que no hay eventos disponibles en este momento. ¡Vuelve pronto para descubrir nuevas experiencias!"}
                </p>
              </div>

              {hasActiveFilters && (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="border-2 hover:border-[#0053CC]"
                  >
                    <FilterX className="h-4 w-4 mr-2" />
                    Limpiar todos los filtros
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    o intenta con términos de búsqueda más generales
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              : "space-y-4"
          }
        >
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              variant={viewMode === "list" ? "compact" : "default"}
              showQuickActions={true}
            />
          ))}
        </div>
      )}

      {/* Enhanced Pagination */}
      {pagination.totalPages > 1 && (
        <Card className="bg-muted/20 border-0">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Mostrando{" "}
                  {(pagination.currentPage - 1) * pagination.limit + 1} -{" "}
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
                  className="border-2 hover:border-[#0053CC]"
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
                            ? "bg-[#0053CC] hover:bg-[#0053CC]/90"
                            : "border-2 hover:border-[#0053CC]"
                        }
                      >
                        {pageNum}
                      </Button>
                    );
                  })}

                  {pagination.totalPages > 5 &&
                    pagination.currentPage < pagination.totalPages - 2 && (
                      <>
                        <span className="px-2 text-muted-foreground">...</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => goToPage(pagination.totalPages)}
                          disabled={loading}
                          className="border-2 hover:border-[#0053CC]"
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
                  className="border-2 hover:border-[#0053CC]"
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
