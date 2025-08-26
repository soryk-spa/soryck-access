"use client";

import { useEffect, useState } from "react";

export function useScrollBehavior() {
  const [scrollY, setScrollY] = useState(0);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      setIsScrollingDown(currentScrollY > lastScrollY && currentScrollY > 100);
      setScrollY(currentScrollY);
      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledHandleScroll, { passive: true });
    
    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  }, [lastScrollY]);

  return {
    scrollY,
    isScrollingDown,
    isAtTop: scrollY < 10,
  };
}
