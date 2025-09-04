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
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border mb-6">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Eventos Destacados</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Próximos Eventos
            </h2>
          </div>

          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
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
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="w-20 h-20 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-foreground">
              Error al cargar eventos
            </h2>
            <p className="text-muted-foreground mb-8">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Intentar de nuevo
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        {}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border mb-6">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">Eventos Destacados</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Próximos Eventos
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre los eventos más emocionantes que están por venir
          </p>
        </div>

        {}
        <EventsExpandableCards events={events} />
      </div>
    </section>
  );
}
