"use client";

import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";
import Image from "next/image";

interface HeroSectionProps {
  events: Array<{
    id: string;
    title: string;
    imageUrl: string | null;
  }>;
}

export function HeroSection({ events }: HeroSectionProps) {
  const hasEvents = events && events.length > 0;

  // Preparar items para el carousel
  const carouselItems = hasEvents
    ? events
        .filter((event) => event.imageUrl)
        .map((event) => ({
          image: event.imageUrl!,
          title: event.title,
        }))
    : [];

  // Si hay solo 1 evento, duplicarlo para que el carousel funcione
  const duplicatedItems = carouselItems.length === 1 
    ? [...carouselItems, ...carouselItems, ...carouselItems] 
    : carouselItems;

  return (
    <div className="relative w-full h-[600px] overflow-hidden">
      {hasEvents && carouselItems.length > 0 ? (
        // Carousel con eventos reales
        <div className="absolute inset-0">
          <InfiniteMovingCards
            items={duplicatedItems}
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

      {/* Overlay gradient - más sutil para mejor visualización del carousel */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50"></div>
    </div>
  );
}
