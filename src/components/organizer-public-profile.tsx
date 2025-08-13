"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EventCard from "@/components/event-card";
import {
  Globe,
  Twitter,
  Instagram,
  Calendar,
} from "lucide-react";

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
    `${organizer.firstName} ${organizer.lastName}`.trim();

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* --- SECCIÓN DE PERFIL --- */}
      <Card className="overflow-hidden">
        <div className="bg-muted h-32 md:h-48" />
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-6 -mt-16 sm:-mt-20 items-end">
            <div className="relative h-32 w-32 sm:h-40 sm:w-40 rounded-full border-4 border-background bg-background flex-shrink-0">
              {organizer.imageUrl ? (
                <Image
                  src={organizer.imageUrl}
                  alt={`Logo de ${organizerName}`}
                  fill
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                  <span className="text-5xl font-bold text-primary-foreground">
                    {organizerName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold">
                {organizerName}
              </h1>
              <div className="flex flex-wrap gap-4 mt-3">
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
            <div className="mt-6 prose prose-sm max-w-none text-muted-foreground">
              <p>{organizer.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- SECCIÓN DE EVENTOS --- */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Próximos Eventos</h2>
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Sin eventos próximos</h3>
              <p className="text-muted-foreground mt-2">
                Este organizador no tiene eventos programados por el momento.
                ¡Vuelve pronto!
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
