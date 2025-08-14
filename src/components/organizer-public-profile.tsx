"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/event-card";
import { Globe, Twitter, Instagram, Calendar } from "lucide-react";

interface Organizer {
  id: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  producerName: string | null;
  bio: string | null;
  websiteUrl: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
}

interface TicketType {
  price: number;
  currency: string;
  capacity: number;
}

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
  // ✅ Agregar ticketTypes a la interfaz
  ticketTypes: TicketType[];
}

interface OrganizerPublicProfileProps {
  organizer: Organizer;
  events: Event[];
}

export default function OrganizerPublicProfile({
  organizer,
  events,
}: OrganizerPublicProfileProps) {
  const organizerName =
    organizer.producerName ||
    `${organizer.firstName || ""} ${organizer.lastName || ""}`.trim() ||
    "Organizador";

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* --- SECCIÓN DE PERFIL --- */}
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-r from-primary/20 to-secondary/20 h-32 md:h-48" />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 -mt-16 sm:-mt-20 items-end">
            <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full border-4 border-background bg-background flex-shrink-0 shadow-xl">
              {organizer.imageUrl ? (
                <Image
                  src={organizer.imageUrl}
                  alt={`Logo de ${organizerName}`}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center">
                  <span className="text-4xl sm:text-5xl font-bold text-primary-foreground">
                    {organizerName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                {organizerName}
              </h1>
              <p className="text-muted-foreground mb-4">
                Organizador de eventos en SorykPass
              </p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {organizer.websiteUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={organizer.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Sitio Web
                    </a>
                  </Button>
                )}
                {organizer.instagramUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={organizer.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Instagram className="h-4 w-4 mr-2" />
                      Instagram
                    </a>
                  </Button>
                )}
                {organizer.twitterUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={organizer.twitterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter className="h-4 w-4 mr-2" />
                      Twitter / X
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
          {organizer.bio && (
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2">Sobre el organizador</h3>
              <p className="text-muted-foreground leading-relaxed">
                {organizer.bio}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- ESTADÍSTICAS RÁPIDAS --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {events.length}
            </div>
            <div className="text-sm text-muted-foreground">
              {events.length === 1 ? "Evento próximo" : "Eventos próximos"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {events.reduce((sum, event) => sum + event._count.tickets, 0)}
            </div>
            <div className="text-sm text-muted-foreground">
              Tickets vendidos
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {events.reduce((sum, event) => sum + event._count.orders, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Órdenes totales</div>
          </CardContent>
        </Card>
      </div>

      {/* --- SECCIÓN DE EVENTOS --- */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Próximos Eventos</h2>
          {events.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {events.length} {events.length === 1 ? "evento" : "eventos"}
            </div>
          )}
        </div>

        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                showQuickActions={false}
                variant="default"
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Calendar className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Sin eventos próximos
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Este organizador no tiene eventos programados por el momento.
                ¡Síguelos en sus redes sociales para no perderte sus próximos
                eventos!
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* --- INFORMACIÓN DE CONTACTO --- */}
      {(organizer.websiteUrl ||
        organizer.instagramUrl ||
        organizer.twitterUrl) && (
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Síguenos</h3>
            <div className="flex flex-wrap gap-4">
              {organizer.websiteUrl && (
                <a
                  href={organizer.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-sm">Sitio web oficial</span>
                </a>
              )}
              {organizer.instagramUrl && (
                <a
                  href={organizer.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Instagram className="h-4 w-4" />
                  <span className="text-sm">Síguenos en Instagram</span>
                </a>
              )}
              {organizer.twitterUrl && (
                <a
                  href={organizer.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Twitter className="h-4 w-4" />
                  <span className="text-sm">Síguenos en Twitter/X</span>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
