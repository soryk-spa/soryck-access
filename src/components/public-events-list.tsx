"use client";

import { useState } from "react";
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
import {
  Calendar,
  MapPin,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { calculateTotalPrice, formatPrice } from "@/lib/commission";

interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location: string;
  price: number;
  currency: string;
  isFree: boolean;
  capacity: number;
  imageUrl?: string;
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

interface PublicEventsListProps {
  initialEvents: Event[];
  initialPagination: Pagination;
  categories: Category[];
  initialFilters: {
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
  };
}

export default function PublicEventsList({
  initialEvents,
  initialPagination,
  categories,
  initialFilters,
}: PublicEventsListProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState(initialFilters);

  const fetchEvents = async (newFilters: typeof filters, page: number = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...newFilters,
        page: page.toString(),
      });

      const response = await fetch(`/api/events/public?${params}`);
      const data = await response.json();

      if (response.ok) {
        setEvents(data.events);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchEvents(newFilters, 1);
  };

  const handlePageChange = (page: number) => {
    fetchEvents(filters, page);
  };

  const clearFilters = () => {
    const clearedFilters = {
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
    };
    setFilters(clearedFilters);
    fetchEvents(clearedFilters, 1);
  };

  const renderEventCard = (event: Event) => {
    const startDate = new Date(event.startDate);
    const isUpcoming = startDate > new Date();
    const availableTickets = event.capacity - event._count.tickets;
    const isSoldOut = availableTickets <= 0;

    const finalPrice = event.isFree ? 0 : calculateTotalPrice(event.price);
    const displayPrice = formatPrice(finalPrice, event.currency);

    return (
      <Card
        key={event.id}
        className="overflow-hidden hover:shadow-lg transition-all duration-300 group"
      >
        <div className="relative">
          <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700">
            {event.imageUrl ? (
              <Image
                src={event.imageUrl}
                alt={event.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Calendar className="h-16 w-16 text-muted-foreground" />
              </div>
            )}

            <div className="absolute top-4 right-4">
              {isSoldOut && isUpcoming && (
                <Badge variant="destructive">Agotado</Badge>
              )}
              {availableTickets <= 10 && availableTickets > 0 && isUpcoming && (
                <Badge
                  variant="outline"
                  className="bg-orange-100 text-orange-700"
                >
                  Últimos tickets
                </Badge>
              )}
            </div>

            <div className="absolute bottom-4 left-4">
              <div className="bg-white/90 dark:bg-gray-900/90 rounded-lg px-3 py-2 backdrop-blur-sm">
                <div className="text-lg font-bold text-primary">
                  {displayPrice}
                </div>
                {!event.isFree && (
                  <div className="text-xs text-muted-foreground">
                    Precio final
                  </div>
                )}
              </div>
            </div>
          </div>

          <CardContent className="p-4 space-y-3">
            <Badge variant="outline" className="w-fit">
              {event.category.name}
            </Badge>

            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>

            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {startDate.toLocaleDateString("es-ES", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="line-clamp-1">{event.location}</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {availableTickets > 0
                  ? `${availableTickets} disponibles`
                  : "Agotado"}
              </span>
              <span className="text-muted-foreground">
                {event._count.tickets} vendidos
              </span>
            </div>

            <Button
              asChild
              className="w-full"
              disabled={isSoldOut && isUpcoming}
            >
              <Link href={`/events/${event.id}`}>
                {isSoldOut
                  ? "Ver detalles (Agotado)"
                  : event.isFree
                  ? "Registrarse gratis"
                  : `Comprar tickets - ${displayPrice}`}
              </Link>
            </Button>
          </CardContent>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Encuentra tu próximo evento</CardTitle>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Ocultar" : "Mostrar"} filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar eventos..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
              <div>
                <Label>Categoría</Label>
                <Select
                  value={filters.categoryId}
                  onValueChange={(value) =>
                    handleFilterChange("categoryId", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las categorías" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Todas las categorías</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Ubicación</Label>
                <Input
                  placeholder="Ciudad, región..."
                  value={filters.location}
                  onChange={(e) =>
                    handleFilterChange("location", e.target.value)
                  }
                />
              </div>

              <div>
                <Label>Precio</Label>
                <Select
                  value={filters.isFree}
                  onValueChange={(value) => handleFilterChange("isFree", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los precios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los precios</SelectItem>
                    <SelectItem value="true">Solo eventos gratuitos</SelectItem>
                    <SelectItem value="false">Solo eventos pagados</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Ordenar por</Label>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => handleFilterChange("sortBy", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="startDate">Fecha</SelectItem>
                    <SelectItem value="price">Precio</SelectItem>
                    <SelectItem value="title">Nombre</SelectItem>
                    <SelectItem value="createdAt">Más recientes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="md:col-span-2 lg:col-span-4">
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full sm:w-auto"
                >
                  Limpiar filtros
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">
            {loading
              ? "Cargando..."
              : `${pagination.totalCount} eventos encontrados`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-96 bg-muted rounded-lg animate-pulse"
              ></div>
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map(renderEventCard)}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No se encontraron eventos
              </h3>
              <p className="text-muted-foreground mb-4">
                Prueba ajustando los filtros o busca con otros términos
              </p>
              <Button onClick={clearFilters}>Limpiar filtros</Button>
            </CardContent>
          </Card>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage || loading}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>

            <span className="px-4 py-2 text-sm">
              Página {pagination.currentPage} de {pagination.totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage || loading}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
