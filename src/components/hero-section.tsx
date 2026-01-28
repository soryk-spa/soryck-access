"use client";

import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface Event {
  id: string;
  name: string;
  coverImageUrl: string | null;
}

interface HeroSectionProps {
  events: Event[];
}

export function HeroSection({ events }: HeroSectionProps) {
  const hasEvents = events && events.length > 0;

  // Preparar items para el carousel
  const carouselItems = hasEvents
    ? events
        .filter((event) => event.coverImageUrl)
        .map((event) => ({
          image: event.coverImageUrl!,
          title: event.name,
        }))
    : [];

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      {hasEvents && carouselItems.length > 0 ? (
        // Carousel con eventos reales
        <div className="absolute inset-0">
          <InfiniteMovingCards
            items={carouselItems}
            direction="right"
            speed="slow"
            pauseOnHover={true}
            className="h-full"
          />
        </div>
      ) : (
        // Imagen por defecto si no hay eventos
        <>
          <Image
            src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1920&h=600&fit=crop&crop=center"
            alt="Banner de eventos"
            fill
            className="object-cover"
            priority
          />
        </>
      )}

      {/* Overlay gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/60"></div>

      {/* Contenido central */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white max-w-7xl mx-auto px-4 z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">
            Vive la Experiencia
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 drop-shadow-md">
            {hasEvents
              ? "Los mejores eventos te están esperando"
              : "Descubre eventos increíbles próximamente"}
          </p>
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
            onClick={() => {
              document.getElementById("events-section")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            Explorar Eventos
          </Button>
        </div>
      </div>
    </div>
  );
}
