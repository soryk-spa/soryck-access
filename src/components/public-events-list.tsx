"use client";

import { useState } from "react";
import { useRouter} from "next/navigation";
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
  page?: string; // ✅ Agregar page como opcional
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

      // Actualizar URL sin recargar página
      router.push(`/events?${params.toString()}`, { scroll: false });

      // Fetch nuevos eventos
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
      page: "1", // ✅ Incluir page en los filtros limpiados
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
    ); // ✅ Excluir page de los filtros activos
  });

  return (
    <div className="space-y-6">
      {/* Header con búsqueda */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="sr-only">
                  Buscar eventos
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="Buscar eventos por nombre o descripción..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        search: e.target.value,
                      }))
                    }
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Buscando..." : "Buscar"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filtros
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-1">
                      •
                    </Badge>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Panel de filtros expandible */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros avanzados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Categoría */}
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={filters.categoryId}
                  onValueChange={(value) =>
                    updateFilters({ categoryId: value === "all" ? "" : value })
                  }
                >
                  <SelectTrigger>
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

              {/* Ubicación */}
              <div>
                <Label htmlFor="location">Ubicación</Label>
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
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Tipo de precio */}
              <div>
                <Label htmlFor="priceType">Precio</Label>
                <Select
                  value={filters.isFree}
                  onValueChange={(value) => updateFilters({ isFree: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los precios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los precios</SelectItem>
                    <SelectItem value="true">Solo eventos gratuitos</SelectItem>
                    <SelectItem value="false">Solo eventos de pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Ordenar por */}
              <div>
                <Label htmlFor="sortBy">Ordenar por</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => updateFilters({ sortBy: value })}
                >
                  <SelectTrigger>
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

            {/* Rango de precios */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minPrice">Precio mínimo (CLP)</Label>
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
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="maxPrice">Precio máximo (CLP)</Label>
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
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Rango de fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateFrom">Desde</Label>
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
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="dateTo">Hasta</Label>
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
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={() => updateFilters({})}>Aplicar filtros</Button>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Barra de resultados y vista */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="text-muted-foreground">
          {loading ? (
            "Cargando eventos..."
          ) : (
            <>
              Mostrando {events.length} de {pagination.totalCount} eventos
              {hasActiveFilters && " (filtrados)"}
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Vista:</span>
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Lista de eventos */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-96 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <div className="space-y-4">
              <div className="text-6xl">🎭</div>
              <h3 className="text-xl font-semibold">
                No se encontraron eventos
              </h3>
              <p className="text-muted-foreground">
                {hasActiveFilters
                  ? "Intenta ajustar tus filtros para ver más resultados"
                  : "Parece que no hay eventos disponibles en este momento"}
              </p>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters}>
                  Limpiar filtros
                </Button>
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

      {/* Paginación */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => goToPage(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage || loading}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.totalPages) }).map(
              (_, i) => {
                const pageNum = Math.max(1, pagination.currentPage - 2 + i);
                if (pageNum > pagination.totalPages) return null;

                return (
                  <Button
                    key={pageNum}
                    variant={
                      pageNum === pagination.currentPage ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => goToPage(pageNum)}
                    disabled={loading}
                  >
                    {pageNum}
                  </Button>
                );
              }
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => goToPage(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage || loading}
          >
            Siguiente
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
