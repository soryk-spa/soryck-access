"use client";

import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import {
  getCurrentPrice,
  getNextPriceChange,
  formatTimeUntilPriceChange,
  type TicketTypeWithPricing,
} from "@/lib/pricing";
import type { TicketType } from "@/types";

interface TicketTypePriceDisplayProps {
  ticketType: TicketType;
  className?: string;
  showEarlyBirdBadge?: boolean;
  showNextPriceChange?: boolean;
}

export function TicketTypePriceDisplay({
  ticketType,
  className = "",
  showEarlyBirdBadge = true,
  showNextPriceChange = false,
}: TicketTypePriceDisplayProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeUntilChange, setTimeUntilChange] = useState<string>("");

  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  
  const ticketTypeWithPricing: TicketTypeWithPricing = useMemo(() => ({
    id: ticketType.id,
    name: ticketType.name,
    price: ticketType.price,
    currency: ticketType.currency,
    priceTiers: ticketType.priceTiers?.map(tier => ({
      ...tier,
      startDate: new Date(tier.startDate),
      endDate: tier.endDate ? new Date(tier.endDate) : null,
    })),
  }), [ticketType]);

  
  useEffect(() => {
    if (showNextPriceChange && ticketTypeWithPricing.priceTiers && ticketTypeWithPricing.priceTiers.length > 0) {
      const nextChangeInfo = getNextPriceChange(ticketTypeWithPricing, currentTime);
      if (nextChangeInfo?.nextTier) {
        const timeUntil = nextChangeInfo.nextTier.startDate.getTime() - currentTime.getTime();
        setTimeUntilChange(formatTimeUntilPriceChange(timeUntil));
      } else {
        setTimeUntilChange("");
      }
    }
  }, [currentTime, ticketTypeWithPricing, showNextPriceChange]);

  
  if (!ticketType.priceTiers || ticketType.priceTiers.length === 0) {
    return (
      <div className={className}>
        <p className="font-semibold">
          {ticketType.price === 0 ? (
            <span className="text-green-600">Gratis</span>
          ) : (
            formatCurrency(ticketType.price)
          )}
        </p>
      </div>
    );
  }

  const currentPriceInfo = getCurrentPrice(ticketTypeWithPricing, currentTime);
  const nextPriceChangeInfo = getNextPriceChange(ticketTypeWithPricing, currentTime);
  
  
  const isEarlyBird = currentPriceInfo.price < ticketType.price;
  
  return (
    <div className={className}>
      <div className="space-y-2">
        {}
        <p className="font-semibold">
          {currentPriceInfo.price === 0 ? (
            <span className="text-green-600">Gratis</span>
          ) : (
            formatCurrency(currentPriceInfo.price)
          )}
        </p>

        {}
        {showEarlyBirdBadge && isEarlyBird && (
          <Badge 
            variant="secondary" 
            className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
          >
            ¡Precio Early Bird!
          </Badge>
        )}

        {}
        {isEarlyBird && (
          <p className="text-sm text-gray-500 line-through">
            Precio regular: {formatCurrency(ticketType.price)}
          </p>
        )}

        {}
        {showNextPriceChange && nextPriceChangeInfo?.nextTier && timeUntilChange && (
          <div className="flex items-center gap-1 text-xs text-orange-600 dark:text-orange-400">
            <Clock className="h-3 w-3" />
            <span>
              Precio cambia en {timeUntilChange} a {formatCurrency(nextPriceChangeInfo.nextTier.price)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
