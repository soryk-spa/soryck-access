"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ChevronRight,
  Loader2,
  TrendingUp,
  Star,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  location: string;
  startDate: string;
  endDate: string | null;
  price: number;
  capacity: number;
  isFree: boolean;
  imageUrl: string | null;
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

export default function FeaturedEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeaturedEvents() {
      try {
        const response = await fetch(
          "/api/events/public?limit=6&sortBy=startDate&sortOrder=asc"
        );

        if (!response.ok) {
          throw new Error("Error al cargar eventos");
        }

        const data = await response.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error("Error fetching featured events:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    }

    fetchFeaturedEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString("es-ES", { month: "short" }),
      weekday: date.toLocaleDateString("es-ES", { weekday: "short" }),
      time: date.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    };
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getAvailability = (event: Event) => {
    const available = event.capacity - event._count.tickets;
    const percentage = Math.round(
      (event._count.tickets / event.capacity) * 100
    );

    if (available === 0) {
      return {
        status: "sold-out",
        text: "Agotado",
        color: "bg-red-500/10 text-red-400 border border-red-500/20",
      };
    } else if (percentage >= 90) {
      return {
        status: "almost-sold",
        text: "Últimas entradas",
        color: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
      };
    } else if (percentage >= 70) {
      return {
        status: "filling-up",
        text: "Llenándose",
        color: "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20",
      };
    } else {
      return {
        status: "available",
        text: "Disponible",
        color: "bg-green-500/10 text-green-400 border border-green-500/20",
      };
    }
  };

  if (loading) {
    return (
      <section className="relative py-20 overflow-hidden">
        {/* Fondo animado con grid */}
        <div className="absolute inset-0 bg-black">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-[40rem] w-[40rem] bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-[100px] animate-pulse" />
          </div>
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
              <Sparkles className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-white/80">Eventos Destacados</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
              Próximos Eventos
            </h2>
          </div>

          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-spin mx-auto mb-6 opacity-20" />
                <Loader2 className="h-8 w-8 animate-spin absolute top-4 left-4 text-white" />
              </div>
              <p className="text-white/60 text-lg">
                Cargando eventos destacados...
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        </div>

        <div className="relative z-10 container mx-auto px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">
              Error al cargar eventos
            </h2>
            <p className="text-white/60 mb-8">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm"
            >
              Intentar de nuevo
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Fondo con efectos visuales */}
      <div className="absolute inset-0 bg-black">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-[40rem] w-[40rem] bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-[100px]" />
        </div>
        <div className="absolute top-1/4 left-1/4 h-[20rem] w-[20rem] bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[30rem] w-[30rem] bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Header mejorado */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-white/80">Eventos Destacados</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-white/90 to-white/60 bg-clip-text text-transparent">
            Próximos Eventos
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            Descubre los eventos más emocionantes que están por venir
          </p>
        </div>

        {events.length > 0 ? (
          <>
            {/* Grid de eventos mejorado - más grande y minimalista */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-12">
              {events.map((event, index) => {
                const startDate = formatDate(event.startDate);
                const availability = getAvailability(event);

                return (
                  <div
                    key={event.id}
                    className="group relative"
                    style={{
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    {/* Card con imagen de fondo completa - más larga para destacar las imágenes */}
                    <Card className="relative overflow-hidden h-[650px] bg-white/5 border border-white/10 backdrop-blur-xl hover:bg-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/25">
                      {/* Imagen de fondo completa */}
                      {event.imageUrl ? (
                        <Image
                          src={event.imageUrl}
                          alt={event.title}
                          fill
                          sizes="(max-width: 1024px) 100vw, (max-width: 1280px) 50vw, 33vw"
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center">
                          <Calendar className="h-32 w-32 text-white/20" />
                        </div>
                      )}

                      {/* Overlay gradient más sutil */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                      {/* Efecto de brillo en hover */}
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-shimmer" />
                      </div>

                      {/* Elementos flotantes superiores - más minimalistas */}
                      <div className="absolute top-6 left-6 z-20">
                        <div className="bg-black/50 backdrop-blur-xl rounded-3xl px-4 py-3 border border-white/10">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-white">
                              {startDate.day}
                            </div>
                            <div className="text-xs text-white/70 uppercase tracking-wider">
                              {startDate.month}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="absolute top-6 right-6 z-20">
                        <Badge className="bg-black/50 backdrop-blur-xl border border-white/10 text-white px-4 py-2 text-xs font-medium">
                          {event.category.name}
                        </Badge>
                      </div>

                      {/* Precio flotante */}
                      <div className="absolute top-24 right-6 z-20">
                        <div className="bg-black/50 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/10">
                          {event.isFree ? (
                            <span className="text-lg font-bold text-green-400">
                              Gratis
                            </span>
                          ) : (
                            <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                              {formatPrice(event.price)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Contenido minimalista en la parte inferior */}
                      <CardContent className="absolute bottom-0 left-0 right-0 p-6 z-20">
                        {/* Título principal */}
                        <div className="bg-black/60 backdrop-blur-xl rounded-3xl p-6 mb-4 border border-white/10">
                          <h3 className="text-2xl font-bold text-white mb-3 line-clamp-2 leading-tight">
                            {event.title}
                          </h3>

                          {/* Solo los detalles más importantes */}
                          <div className="flex items-center justify-between text-sm text-white/80">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-400" />
                              <span>{startDate.time}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-blue-400" />
                              <span>
                                {event._count.tickets}/{event.capacity}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-white/80 mt-2">
                            <MapPin className="h-4 w-4 text-blue-400" />
                            <span className="line-clamp-1">
                              {event.location}
                            </span>
                          </div>
                        </div>

                        {/* Botón minimalista */}
                        <Button
                          asChild
                          className="w-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-xl text-white font-semibold py-4 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-white/10 disabled:opacity-50"
                          disabled={availability.status === "sold-out"}
                        >
                          <Link
                            href={`/events/${event.id}`}
                            className="flex items-center justify-center gap-3"
                          >
                            {availability.status === "sold-out"
                              ? "Agotado"
                              : "Ver Evento"}
                            {availability.status !== "sold-out" && (
                              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            )}
                          </Link>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>

            {/* Botón "Ver todos" mejorado */}
            <div className="text-center">
              <Button
                asChild
                size="lg"
                className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-white/10"
              >
                <Link href="/events" className="flex items-center gap-3">
                  Ver Todos los Eventos
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </>
        ) : (
          /* Estado vacío mejorado */
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
              ¡Próximamente eventos increíbles!
            </h3>
            <p className="text-white/60 mb-10 max-w-md mx-auto text-lg leading-relaxed">
              Estamos preparando eventos fantásticos para ti. Mientras tanto,
              puedes explorar nuestra plataforma.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/25"
              >
                <Link href="/events/create" className="flex items-center gap-3">
                  <Star className="w-5 h-5" />
                  Crear tu Evento
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                className="bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold transition-all duration-300 hover:scale-105"
              >
                <Link href="/events" className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5" />
                  Explorar Eventos
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>

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

        .bg-grid-white\\/\\[0\\.02\\] {
          background-image: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.02) 1px,
            transparent 1px
          );
        }
      `}</style>
    </section>
  );
}
