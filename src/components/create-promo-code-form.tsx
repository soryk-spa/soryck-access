"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Percent,
  DollarSign,
  Gift,
  Clock,
  Target,
  Code,
  Shuffle,
} from "lucide-react";
import { toast } from "sonner";

const createPromoCodeSchema = z
  .object({
    name: z.string().min(1, "Nombre requerido").max(100),
    description: z.string().optional(),
    type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE"]),
    value: z.number().min(0, "Valor debe ser positivo"),
    minOrderAmount: z.number().min(0).optional(),
    maxDiscountAmount: z.number().min(0).optional(),
    usageLimit: z.number().min(1).optional(),
    usageLimitPerUser: z.number().min(1).optional(),
    validFrom: z.string().min(1, "Fecha de inicio requerida"),
    validUntil: z.string().optional(),
    eventId: z.string().optional(),
    codeOption: z.enum(["generate", "custom"]),
    customCode: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.codeOption === "custom" && !data.customCode) {
        return false;
      }
      if (data.type === "PERCENTAGE" && data.value > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Datos inválidos",
    }
  );

type FormData = z.infer<typeof createPromoCodeSchema>;

type PromoCode = {
  id: string;
  name: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE";
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  validFrom: string;
  validUntil?: string;
  eventId?: string;
  code: string;
};

interface CreatePromoCodeFormProps {
  eventId?: string;
  events?: Array<{ id: string; title: string }>;
  onSuccess?: (promoCode: PromoCode) => void;
}

export default function CreatePromoCodeForm({
  eventId,
  events = [],
  onSuccess,
}: CreatePromoCodeFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(createPromoCodeSchema),
    defaultValues: {
      type: "PERCENTAGE",
      codeOption: "generate",
      eventId: eventId || "",
      validFrom: new Date().toISOString().slice(0, 16),
    },
  });

  const watchType = watch("type");
  const watchCodeOption = watch("codeOption");

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let result = "SP";
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setValue("customCode", result);
    setValue("codeOption", "custom");
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    try {
      const payload = {
        ...data,
        generateCode: data.codeOption === "generate",
        customCode: data.codeOption === "custom" ? data.customCode : undefined,
      };

      const response = await fetch("/api/promo-codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al crear código promocional");
      }

      toast.success("¡Código promocional creado exitosamente!");
      onSuccess?.(result.promoCode);
    } catch (error) {
      console.error("Error creating promo code:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al crear código promocional"
      );
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PERCENTAGE":
        return <Percent className="h-4 w-4" />;
      case "FIXED_AMOUNT":
        return <DollarSign className="h-4 w-4" />;
      case "FREE":
        return <Gift className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Crear Código Promocional
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Información básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Nombre del código *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Ej: Descuento de lanzamiento"
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Input
                id="description"
                {...register("description")}
                placeholder="Descripción opcional"
              />
            </div>
          </div>

          {/* Tipo de descuento */}
          <div>
            <Label>Tipo de descuento *</Label>
            <RadioGroup
              value={watchType}
              onValueChange={(value: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE") =>
                setValue("type", value)
              }
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2"
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="PERCENTAGE" id="percentage" />
                <Label
                  htmlFor="percentage"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Percent className="h-4 w-4" />
                  Porcentaje
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="FIXED_AMOUNT" id="fixed" />
                <Label
                  htmlFor="fixed"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <DollarSign className="h-4 w-4" />
                  Monto fijo
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="FREE" id="free" />
                <Label
                  htmlFor="free"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Gift className="h-4 w-4" />
                  Gratis (100%)
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Valor del descuento */}
          {watchType !== "FREE" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="value">
                  {watchType === "PERCENTAGE"
                    ? "Porcentaje (%)"
                    : "Monto (CLP)"}{" "}
                  *
                </Label>
                <Input
                  id="value"
                  type="number"
                  {...register("value", { valueAsNumber: true })}
                  placeholder={watchType === "PERCENTAGE" ? "10" : "5000"}
                  min="0"
                  max={watchType === "PERCENTAGE" ? "100" : undefined}
                />
                {errors.value && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.value.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="minOrderAmount">Monto mínimo de orden</Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  {...register("minOrderAmount", { valueAsNumber: true })}
                  placeholder="0"
                  min="0"
                />
              </div>

              {watchType === "PERCENTAGE" && (
                <div>
                  <Label htmlFor="maxDiscountAmount">
                    Descuento máximo (CLP)
                  </Label>
                  <Input
                    id="maxDiscountAmount"
                    type="number"
                    {...register("maxDiscountAmount", { valueAsNumber: true })}
                    placeholder="10000"
                    min="0"
                  />
                </div>
              )}
            </div>
          )}

          {/* Límites de uso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="usageLimit">Límite total de usos</Label>
              <Input
                id="usageLimit"
                type="number"
                {...register("usageLimit", { valueAsNumber: true })}
                placeholder="100"
                min="1"
              />
            </div>

            <div>
              <Label htmlFor="usageLimitPerUser">Límite por usuario</Label>
              <Input
                id="usageLimitPerUser"
                type="number"
                {...register("usageLimitPerUser", { valueAsNumber: true })}
                placeholder="1"
                min="1"
              />
            </div>
          </div>

          {/* Fechas de validez */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="validFrom">Válido desde *</Label>
              <Input
                id="validFrom"
                type="datetime-local"
                {...register("validFrom")}
              />
              {errors.validFrom && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.validFrom.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="validUntil">Válido hasta</Label>
              <Input
                id="validUntil"
                type="datetime-local"
                {...register("validUntil")}
              />
            </div>
          </div>

          {/* Evento específico */}
          {events.length > 0 && (
            <div>
              <Label>Aplicar solo a un evento específico</Label>
              <Select
                value={watch("eventId") || ""}
                onValueChange={(value) =>
                  setValue("eventId", value || undefined)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos los eventos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los eventos</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Código promocional */}
          <div>
            <Label>Código promocional</Label>
            <RadioGroup
              value={watchCodeOption}
              onValueChange={(value: "generate" | "custom") =>
                setValue("codeOption", value)
              }
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2"
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="generate" id="generate" />
                <Label
                  htmlFor="generate"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Shuffle className="h-4 w-4" />
                  Generar automáticamente
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="custom" id="custom" />
                <Label
                  htmlFor="custom"
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Code className="h-4 w-4" />
                  Código personalizado
                </Label>
              </div>
            </RadioGroup>

            {watchCodeOption === "custom" && (
              <div className="mt-3 flex gap-2">
                <Input
                  {...register("customCode")}
                  placeholder="INGRESA-TU-CODIGO"
                  className="font-mono uppercase"
                  onChange={(e) => {
                    e.target.value = e.target.value.toUpperCase();
                    setValue("customCode", e.target.value);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateRandomCode}
                >
                  <Shuffle className="h-4 w-4" />
                </Button>
              </div>
            )}
            {errors.customCode && (
              <p className="text-sm text-red-600 mt-1">
                Código personalizado requerido
              </p>
            )}
          </div>

          {/* Resumen */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                {getTypeIcon(watchType)}
                Resumen del código promocional
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Tipo:</span>
                  <Badge variant="outline">
                    {watchType === "PERCENTAGE" && "Porcentaje"}
                    {watchType === "FIXED_AMOUNT" && "Monto fijo"}
                    {watchType === "FREE" && "Gratis"}
                  </Badge>
                </div>
                {watchType !== "FREE" && (
                  <div className="flex justify-between">
                    <span>Valor:</span>
                    <span>
                      {watchType === "PERCENTAGE"
                        ? `${watch("value") || 0}%`
                        : `${(watch("value") || 0).toLocaleString("es-CL")}`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Usos totales:</span>
                  <span>{watch("usageLimit") || "Ilimitado"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Por usuario:</span>
                  <span>{watch("usageLimitPerUser") || "Ilimitado"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Creando código...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Crear código promocional
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
