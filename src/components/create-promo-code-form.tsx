"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Separator } from "@/components/ui/separator";
import {
  Percent,
  DollarSign,
  Gift,
  Clock,
  Target,
  Code,
  Shuffle,
  Info,
  Sparkles,
  TrendingUp,
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

interface CreatePromoCodeFormProps {
  eventId?: string;
  events?: Array<{ id: string; title: string }>;
}

export default function CreatePromoCodeForm({
  eventId,
  events = [],
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
      eventId: eventId || "all",
      validFrom: new Date().toISOString().slice(0, 16),
    },
  });

  const watchType = watch("type");
  const watchCodeOption = watch("codeOption");
  const watchValue = watch("value");
  const watchUsageLimit = watch("usageLimit");

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
        eventId: data.eventId === "all" ? undefined : data.eventId,
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

      toast.success("¡Código promocional creado exitosamente!", {
        description: `Código: ${result.promoCode.code}`,
      });

      // Redirigir después de crear exitosamente
      window.location.href = "/dashboard/promo-codes";
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

  const getEstimatedImpact = () => {
    if (!watchValue || !watchUsageLimit) return null;

    let estimatedSavings = 0;
    if (watchType === "PERCENTAGE") {
      estimatedSavings = ((50000 * watchValue) / 100) * watchUsageLimit; // Asumiendo ticket promedio de $50,000
    } else if (watchType === "FIXED_AMOUNT") {
      estimatedSavings = watchValue * watchUsageLimit;
    }

    return estimatedSavings;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Información básica */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nombre del código *</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Ej: Descuento de lanzamiento"
                    className="mt-1"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="eventSelect">Evento específico</Label>
                  <Select
                    value={watch("eventId") || "all"}
                    onValueChange={(value) =>
                      setValue("eventId", value === "all" ? undefined : value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Todos los eventos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los eventos</SelectItem>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Descripción opcional para uso interno"
                  className="mt-1"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuración de descuento */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Configuración de Descuento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Tipo de descuento */}
              <div>
                <Label>Tipo de descuento *</Label>
                <RadioGroup
                  value={watchType}
                  onValueChange={(
                    value: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE"
                  ) => setValue("type", value)}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3"
                >
                  <div className="relative">
                    <RadioGroupItem
                      value="PERCENTAGE"
                      id="percentage"
                      className="sr-only"
                    />
                    <Label
                      htmlFor="percentage"
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                        watchType === "PERCENTAGE"
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
                          : "border-border"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          watchType === "PERCENTAGE"
                            ? "bg-blue-500 text-white"
                            : "bg-muted"
                        }`}
                      >
                        <Percent className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">Porcentaje</div>
                        <div className="text-xs text-muted-foreground">
                          Descuento por %
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="relative">
                    <RadioGroupItem
                      value="FIXED_AMOUNT"
                      id="fixed"
                      className="sr-only"
                    />
                    <Label
                      htmlFor="fixed"
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                        watchType === "FIXED_AMOUNT"
                          ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                          : "border-border"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          watchType === "FIXED_AMOUNT"
                            ? "bg-green-500 text-white"
                            : "bg-muted"
                        }`}
                      >
                        <DollarSign className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">Monto fijo</div>
                        <div className="text-xs text-muted-foreground">
                          Descuento en $
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="relative">
                    <RadioGroupItem
                      value="FREE"
                      id="free"
                      className="sr-only"
                    />
                    <Label
                      htmlFor="free"
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                        watchType === "FREE"
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-950/20"
                          : "border-border"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          watchType === "FREE"
                            ? "bg-purple-500 text-white"
                            : "bg-muted"
                        }`}
                      >
                        <Gift className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">Gratis</div>
                        <div className="text-xs text-muted-foreground">
                          100% de descuento
                        </div>
                      </div>
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
                      className="mt-1"
                    />
                    {errors.value && (
                      <p className="text-sm text-red-600 mt-1">
                        {errors.value.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="minOrderAmount">Compra mínima (CLP)</Label>
                    <Input
                      id="minOrderAmount"
                      type="number"
                      {...register("minOrderAmount", { valueAsNumber: true })}
                      placeholder="Sin mínimo"
                      min="0"
                      className="mt-1"
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
                        {...register("maxDiscountAmount", {
                          valueAsNumber: true,
                        })}
                        placeholder="Sin límite"
                        min="0"
                        className="mt-1"
                      />
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Límites y fechas */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                Límites y Validez
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Límites de uso */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="usageLimit">Límite total de usos</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    {...register("usageLimit", { valueAsNumber: true })}
                    placeholder="Ilimitado"
                    min="1"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="usageLimitPerUser">Límite por usuario</Label>
                  <Input
                    id="usageLimitPerUser"
                    type="number"
                    {...register("usageLimitPerUser", { valueAsNumber: true })}
                    placeholder="Sin límite"
                    min="1"
                    className="mt-1"
                  />
                </div>
              </div>

              <Separator />

              {/* Fechas de validez */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="validFrom">Válido desde *</Label>
                  <Input
                    id="validFrom"
                    type="datetime-local"
                    {...register("validFrom")}
                    className="mt-1"
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
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Código promocional */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-indigo-600" />
                Código Promocional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup
                value={watchCodeOption}
                onValueChange={(value: "generate" | "custom") =>
                  setValue("codeOption", value)
                }
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="relative">
                  <RadioGroupItem
                    value="generate"
                    id="generate"
                    className="sr-only"
                  />
                  <Label
                    htmlFor="generate"
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                      watchCodeOption === "generate"
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20"
                        : "border-border"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        watchCodeOption === "generate"
                          ? "bg-indigo-500 text-white"
                          : "bg-muted"
                      }`}
                    >
                      <Shuffle className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">Generar automáticamente</div>
                      <div className="text-xs text-muted-foreground">
                        Código único aleatorio
                      </div>
                    </div>
                  </Label>
                </div>

                <div className="relative">
                  <RadioGroupItem
                    value="custom"
                    id="custom"
                    className="sr-only"
                  />
                  <Label
                    htmlFor="custom"
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                      watchCodeOption === "custom"
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20"
                        : "border-border"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        watchCodeOption === "custom"
                          ? "bg-indigo-500 text-white"
                          : "bg-muted"
                      }`}
                    >
                      <Code className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-medium">Código personalizado</div>
                      <div className="text-xs text-muted-foreground">
                        Elige tu propio código
                      </div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              {watchCodeOption === "custom" && (
                <div className="flex gap-2">
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
            </CardContent>
          </Card>
        </div>

        {/* Barra lateral - Resumen */}
        <div className="space-y-6">
          {/* Resumen del código */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-muted/50 to-muted/30 sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getTypeIcon(watchType)}
                Vista Previa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tipo:</span>
                  <Badge variant="outline">
                    {watchType === "PERCENTAGE" && "Porcentaje"}
                    {watchType === "FIXED_AMOUNT" && "Monto fijo"}
                    {watchType === "FREE" && "Gratis"}
                  </Badge>
                </div>

                {watchType !== "FREE" && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      Valor:
                    </span>
                    <span className="font-medium">
                      {watchType === "PERCENTAGE"
                        ? `${watchValue || 0}%`
                        : `$${(watchValue || 0).toLocaleString("es-CL")}`}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Usos totales:
                  </span>
                  <span className="font-medium">
                    {watchUsageLimit || "Ilimitado"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Por usuario:
                  </span>
                  <span className="font-medium">
                    {watch("usageLimitPerUser") || "Ilimitado"}
                  </span>
                </div>
              </div>

              {getEstimatedImpact() && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      Impacto Estimado
                    </h4>
                    <div className="text-sm text-muted-foreground">
                      Ahorro total estimado:{" "}
                      <span className="font-medium text-foreground">
                        ${getEstimatedImpact()?.toLocaleString("es-CL")}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Consejos */}
          <Card className="border-0 shadow-lg border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="text-base">💡 Consejos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <strong>Descuentos por porcentaje:</strong> Ideales para
                promociones generales. Considera establecer un límite máximo.
              </div>
              <div>
                <strong>Descuentos fijos:</strong> Perfectos para eventos
                específicos o lanzamientos.
              </div>
              <div>
                <strong>Límites de uso:</strong> Te ayudan a controlar el
                impacto en tus ingresos.
              </div>
            </CardContent>
          </Card>

          {/* Botón de crear */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base"
            size="lg"
          >
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
        </div>
      </div>
    </form>
  );
}
