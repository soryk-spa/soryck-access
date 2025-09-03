"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { EventsExpandableCards } from "@/components/events-expandable-cards";
import {
  Calendar,
  Loader2,
  Sparkles,
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
  ticketTypes: {
    id: string;
    name: string;
    price: number;
    currency: string;
  }[];
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
    <section className="relative py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
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

        {/* Usar el nuevo componente expandable */}
        <EventsExpandableCards events={events} />
      </div>
    </section>
  );
}
