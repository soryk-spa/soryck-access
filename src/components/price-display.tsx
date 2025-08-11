import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Info } from 'lucide-react';
import { 
  calculatePriceBreakdown, 
  formatPriceBreakdown, 
} from '@/lib/commission';

interface PriceDisplayProps {
  basePrice: number;
  quantity: number;
  currency?: string;
  showBreakdown?: boolean;
  className?: string;
}

export default function PriceDisplay({ 
  basePrice, 
  quantity = 1, 
  currency = 'CLP',
  showBreakdown = false,
  className = '' 
}: PriceDisplayProps) {
  const singleItemBreakdown = calculatePriceBreakdown(basePrice, currency);
  const totalBreakdown = calculatePriceBreakdown(basePrice * quantity, currency);
  const formatted = formatPriceBreakdown(totalBreakdown);

  if (basePrice === 0) {
    return (
      <div className={`text-center ${className}`}>
        <div className="text-2xl font-bold text-green-600">
          Gratis
        </div>
        {quantity > 1 && (
          <div className="text-sm text-muted-foreground">
            {quantity} tickets
          </div>
        )}
      </div>
    );
  }

  if (!showBreakdown) {
    return (
      <div className={`text-center ${className}`}>
        <div className="text-2xl font-bold text-foreground">
          {formatted.totalPrice}
        </div>
        {quantity > 1 && (
          <div className="text-sm text-muted-foreground">
            {quantity} tickets
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium">Desglose del precio</span>
          </div>

          {quantity > 1 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Precio por ticket:</span>
                <span>{formatPriceBreakdown(singleItemBreakdown).basePrice}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Cantidad:</span>
                <span>{quantity}</span>
              </div>
              <Separator />
            </div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">
                {quantity > 1 ? 'Subtotal del evento:' : 'Precio del evento:'}
              </span>
              <span className="font-medium">
                {formatPriceBreakdown(calculatePriceBreakdown(basePrice * quantity, currency)).basePrice}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-2">
                <span>Comisión SorykPass:</span>
                <Badge variant="outline" className="text-xs">
                  {formatted.commissionPercentage}
                </Badge>
              </div>
              <span>{formatted.commission}</span>
            </div>

            <Separator />

            <div className="flex justify-between text-lg font-bold">
              <span>Total a pagar:</span>
              <span className="text-primary">{formatted.totalPrice}</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground mt-3 p-2 bg-muted rounded">
            <p>
              💡 La comisión del {formatted.commissionPercentage} nos ayuda a mantener 
              la plataforma funcionando y mejorar continuamente tu experiencia.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}