"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";

export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
}: {
  items: {
    image: string;
    title: string;
  }[];
  direction?: "left" | "right";
  speed?: "fast" | "normal" | "slow";
  pauseOnHover?: boolean;
  className?: string;
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollerRef = React.useRef<HTMLUListElement>(null);

  const [start, setStart] = useState(false);

  const getDirection = useCallback(() => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "forwards"
        );
      } else {
        containerRef.current.style.setProperty(
          "--animation-direction",
          "reverse"
        );
      }
    }
  }, [direction]);

  const getSpeed = useCallback(() => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "60s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "100s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "400s");
      }
    }
  }, [speed]);

  const addAnimation = useCallback(() => {
    if (containerRef.current && scrollerRef.current) {
      const scrollerContent = Array.from(scrollerRef.current.children);

      scrollerContent.forEach((item) => {
        const duplicatedItem = item.cloneNode(true);
        if (scrollerRef.current) {
          scrollerRef.current.appendChild(duplicatedItem);
        }
      });

      getDirection();
      getSpeed();
      setStart(true);
    }
  }, [getDirection, getSpeed]);

  useEffect(() => {
    addAnimation();
  }, [addAnimation]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 w-full overflow-hidden",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap",
          start && "animate-scroll"
        )}
        style={{
          transform: start ? undefined : 'translateX(-25%)'
        }}
      >
        {items.map((item, idx) => (
          <li
            className="w-[450px] max-w-full relative rounded-2xl flex-shrink-0 px-4 py-4 md:w-[550px] transition-transform duration-300 hover:scale-105 cursor-pointer"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.4), rgba(0,0,0,0.8))",
            }}
            key={idx}
          >
            <div className="relative h-[500px] w-full rounded-lg overflow-hidden group">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition-all duration-300 group-hover:brightness-110 group-hover:scale-105"
                sizes="(max-width: 768px) 450px, 550px"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 to-transparent transition-all duration-300 group-hover:from-black/95">
                <p className="text-white font-bold text-xl">{item.title}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
