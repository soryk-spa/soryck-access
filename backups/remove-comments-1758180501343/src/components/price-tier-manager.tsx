"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Trash2,
  Clock,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Info,
  Zap
} from "lucide-react";
import type { PriceTier } from "@/types";
import { getCurrentPrice, getNextPriceChange, formatTimeUntilPriceChange, createDefaultPriceTiers } from "@/lib/pricing";

interface PriceTierManagerProps {
  ticketTypeName: string;
  basePrice: number;
  currency: string;
  eventStartDate: Date;
  priceTiers: PriceTier[];
  onPriceTiersChange: (priceTiers: PriceTier[]) => void;
}

export default function PriceTierManager({
  ticketTypeName,
  basePrice,
  currency,
  eventStartDate,
  priceTiers,
  onPriceTiersChange
}: PriceTierManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTier, setNewTier] = useState({
    name: "",
    price: basePrice,
    startDate: "",
    endDate: "",
  });

  const handleAddTier = () => {
    if (!newTier.name || !newTier.startDate) return;

    const tier: PriceTier = {
      id: `temp-${Date.now()}`, // ID temporal para nuevos tiers
      name: newTier.name,
      price: newTier.price,
      currency,
      startDate: newTier.startDate,
      endDate: newTier.endDate || undefined,
      isActive: true,
      ticketTypeId: "", // Se asignará al guardar
    };

    onPriceTiersChange([...priceTiers, tier]);
    setNewTier({ name: "", price: basePrice, startDate: "", endDate: "" });
    setShowAddForm(false);
  };

  const handleRemoveTier = (tierId: string) => {
    onPriceTiersChange(priceTiers.filter(tier => tier.id !== tierId));
  };

  const handleCreateDefaults = () => {
    const defaultTiers = createDefaultPriceTiers(basePrice, currency, eventStartDate);
    const tiersWithIds: PriceTier[] = defaultTiers.map((tier, index) => ({
      ...tier,
      id: `temp-default-${index}`,
      ticketTypeId: "",
      startDate: tier.startDate.toISOString(),
      endDate: tier.endDate?.toISOString(),
    }));
    onPriceTiersChange(tiersWithIds);
  };

  // Simular ticket type para preview
  const simulatedTicketType = {
    id: "",
    name: ticketTypeName,
    price: basePrice,
    currency,
    priceTiers: priceTiers.map(tier => ({
      ...tier,
      startDate: new Date(tier.startDate),
      endDate: tier.endDate ? new Date(tier.endDate) : null
    }))
  };

  const currentPricing = getCurrentPrice(simulatedTicketType);
  const nextChange = getNextPriceChange(simulatedTicketType);

  // Ordenar tiers por fecha de inicio
  const sortedTiers = [...priceTiers].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Precios Dinámicos para &quot;{ticketTypeName}&quot;
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Vista previa del precio actual */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Precio Actual</span>
            {currentPricing.isEarlyBird && (
              <Badge className="bg-green-100 text-green-800">
                <TrendingDown className="h-3 w-3 mr-1" />
                Early Bird
              </Badge>
            )}
            {currentPricing.price > basePrice && (
              <Badge className="bg-orange-100 text-orange-800">
                <TrendingUp className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            ${currentPricing.price.toLocaleString()} {currency}
          </div>
          {currentPricing.tierName && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {currentPricing.tierName}
            </div>
          )}
        </div>

        {/* Próximo cambio de precio */}
        {nextChange?.nextTier && (
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertDescription>
              <strong>Próximo cambio:</strong> ${nextChange.nextTier.price.toLocaleString()} {currency} 
              ({nextChange.nextTier.name}) en {formatTimeUntilPriceChange(nextChange.timeUntilChange!)}
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        {/* Lista de price tiers existentes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Niveles de Precio Configurados</h4>
            {priceTiers.length === 0 && (
              <Button onClick={handleCreateDefaults} variant="outline" size="sm">
                Crear Niveles por Defecto
              </Button>
            )}
          </div>

          {sortedTiers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No hay niveles de precio configurados</p>
              <p className="text-sm">Se usará el precio base: ${basePrice.toLocaleString()} {currency}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedTiers.map((tier) => {
                const isActive = new Date() >= new Date(tier.startDate) && 
                  (!tier.endDate || new Date() <= new Date(tier.endDate));
                
                return (
                  <div
                    key={tier.id}
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      isActive ? 'border-blue-200 bg-blue-50 dark:bg-blue-950' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{tier.name}</span>
                        {isActive && (
                          <Badge variant="default" className="text-xs">
                            Activo
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        ${tier.price.toLocaleString()} {tier.currency}
                      </div>
                      <div className="text-xs text-gray-500">
                        Desde: {new Date(tier.startDate).toLocaleString()}
                        {tier.endDate && ` - Hasta: ${new Date(tier.endDate).toLocaleString()}`}
                      </div>
                    </div>
                    <Button
                      onClick={() => handleRemoveTier(tier.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Separator />

        {/* Formulario para agregar nuevo tier */}
        {!showAddForm ? (
          <Button onClick={() => setShowAddForm(true)} variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Nivel de Precio
          </Button>
        ) : (
          <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
            <h5 className="font-medium">Nuevo Nivel de Precio</h5>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tier-name">Nombre del Nivel</Label>
                <Input
                  id="tier-name"
                  placeholder="Ej: Early Bird, Regular, VIP"
                  value={newTier.name}
                  onChange={(e) => setNewTier(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="tier-price">Precio ({currency})</Label>
                <Input
                  id="tier-price"
                  type="number"
                  value={newTier.price}
                  onChange={(e) => setNewTier(prev => ({ ...prev, price: Number(e.target.value) }))}
                />
              </div>
              
              <div>
                <Label htmlFor="tier-start">Fecha/Hora de Inicio</Label>
                <Input
                  id="tier-start"
                  type="datetime-local"
                  value={newTier.startDate}
                  onChange={(e) => setNewTier(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              
              <div>
                <Label htmlFor="tier-end">Fecha/Hora de Fin (Opcional)</Label>
                <Input
                  id="tier-end"
                  type="datetime-local"
                  value={newTier.endDate}
                  onChange={(e) => setNewTier(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddTier} disabled={!newTier.name || !newTier.startDate}>
                Agregar
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline">
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Información adicional */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Consejos:</strong><br />
            • Los precios cambiarán automáticamente en las fechas configuradas<br />
            • Si no se especifica fecha de fin, el precio durará hasta el final del evento<br />
            • Puedes crear múltiples niveles para estrategias de pricing complejas
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
