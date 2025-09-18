"use client";

import { useState, useEffect } from "react";
import { Clock, TrendingUp, TrendingDown, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { getCurrentPrice, getNextPriceChange, formatTimeUntilPriceChange } from "@/lib/pricing";
import type { TicketType } from "@/types";
import type { TicketTypeWithPricing } from "@/lib/pricing";

interface DynamicPriceDisplayProps {
  ticketType: TicketType;
  showNextChange?: boolean;
  compact?: boolean;
}

export default function DynamicPriceDisplay({
  ticketType,
  showNextChange = true,
  compact = false
}: DynamicPriceDisplayProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); 

    return () => clearInterval(timer);
  }, []);

  
  if (!ticketType.priceTiers || ticketType.priceTiers.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-gray-900">
          {formatCurrency(ticketType.price)}
        </span>
      </div>
    );
  }

  
  const ticketTypeForPricing: TicketTypeWithPricing = {
    id: ticketType.id,
    name: ticketType.name,
    price: ticketType.price,
    currency: ticketType.currency || 'CLP',
    priceTiers: ticketType.priceTiers.map(tier => ({
      id: tier.id,
      name: tier.name,
      price: tier.price,
      currency: tier.currency || 'CLP',
      startDate: new Date(tier.startDate),
      endDate: tier.endDate ? new Date(tier.endDate) : null,
      isActive: true 
    }))
  };

  const currentPriceInfo = getCurrentPrice(ticketTypeForPricing, currentTime);
  const nextPriceChange = getNextPriceChange(ticketTypeForPricing, currentTime);

  const isEarlyBird = currentPriceInfo.isEarlyBird || false;
  const isLastMinute = currentPriceInfo.price > ticketType.price;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-gray-900">
          {formatCurrency(currentPriceInfo.price)}
        </span>
        {isEarlyBird && (
          <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
            <TrendingDown className="h-3 w-3 mr-1" />
            Early Bird
          </Badge>
        )}
        {isLastMinute && (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 text-xs">
            <Zap className="h-3 w-3 mr-1" />
            Último Momento
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-gray-900">
          {formatCurrency(currentPriceInfo.price)}
        </span>
        
        {currentPriceInfo.price !== ticketType.price && (
          <span className="text-sm text-gray-500 line-through">
            {formatCurrency(ticketType.price)}
          </span>
        )}

        {isEarlyBird && (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            <TrendingDown className="h-4 w-4 mr-1" />
            Early Bird
          </Badge>
        )}
        
        {isLastMinute && (
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            <Zap className="h-4 w-4 mr-1" />
            Último Momento
          </Badge>
        )}
      </div>

      {showNextChange && nextPriceChange?.nextTier && nextPriceChange.timeUntilChange && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          <span>
            {nextPriceChange.nextTier.price > currentPriceInfo.price ? "Precio subirá a" : "Precio bajará a"}{" "}
            <span className="font-semibold">{formatCurrency(nextPriceChange.nextTier.price)}</span>{" "}
            en {formatTimeUntilPriceChange(nextPriceChange.timeUntilChange)}
          </span>
          {nextPriceChange.nextTier.price > currentPriceInfo.price ? (
            <TrendingUp className="h-4 w-4 text-orange-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-green-500" />
          )}
        </div>
      )}
    </div>
  );
}
