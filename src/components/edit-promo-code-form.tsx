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
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Percent,
  DollarSign,
  Gift,
  Clock,
  Target,
  Code,
  Info,
  Sparkles,
  AlertTriangle,
  Lock,
  Save,
  Activity,
} from "lucide-react";
import { toast } from "sonner";

const editPromoCodeSchema = z.object({
  name: z.string().min(1, "Nombre requerido").max(100),
  description: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  usageLimit: z.number().min(1).optional(),
  usageLimitPerUser: z.number().min(1).optional(),
  validUntil: z.string().optional(),
  eventId: z.string().optional(),
});

type EditFormData = z.infer<typeof editPromoCodeSchema>;

interface PromoCode {
  id: string;
  code: string;
  name: string;
  description: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE";
  value: number;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "USED_UP";
  usageLimit?: number;
  usageLimitPerUser?: number;
  usedCount: number;
  validFrom: string;
  validUntil: string;
  eventId: string;
  event?: { id: string; title: string };
  _count: { usages: number };
  createdAt: string;
}

interface EditPromoCodeFormProps {
  promoCode: PromoCode;
  events: Array<{ id: string; title: string }>;
  canEdit: boolean;
}

export default function EditPromoCodeForm({
  promoCode,
  events,
  canEdit,
}: EditPromoCodeFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editPromoCodeSchema),
    defaultValues: {
      name: promoCode.name,
      description: promoCode.description || "",
      status:
        promoCode.status === "EXPIRED" || promoCode.status === "USED_UP"
          ? "INACTIVE"
          : promoCode.status,
      usageLimit: promoCode.usageLimit,
      usageLimitPerUser: promoCode.usageLimitPerUser,
      validUntil: promoCode.validUntil || "",
      eventId: promoCode.eventId || "all",
    },
  });

  const watchStatus = watch("status");
  const watchUsageLimit = watch("usageLimit");

  const onSubmit = async (data: EditFormData) => {
    setLoading(true);

    try {
      const payload = {
        ...data,
        eventId: data.eventId === "all" ? undefined : data.eventId,
        validUntil: data.validUntil || undefined,
      };

      const response = await fetch(`/api/promo-codes/${promoCode.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        // Ensure cookies are sent so server-side auth (Clerk) can read the session
        credentials: 'same-origin',
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || "Error al actualizar código promocional"
        );
      }

      toast.success("¡Código promocional actualizado exitosamente!");

      
      window.location.href = "/dashboard/promo-codes";
    } catch (error) {
      console.error("Error updating promo code:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al actualizar código promocional"
      );
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PERCENTAGE":
        return <Percent className="h-4 w-4 text-blue-600" />;
      case "FIXED_AMOUNT":
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case "FREE":
        return <Gift className="h-4 w-4 text-purple-600" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const formatDiscount = (type: string, value: number) => {
    switch (type) {
      case "PERCENTAGE":
        return `${value}%`;
      case "FIXED_AMOUNT":
        return `$${value.toLocaleString("es-CL")}`;
      case "FREE":
        return "Gratis";
      default:
        return value.toString();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ACTIVE: {
        variant: "default" as const,
        label: "Activo",
        color: "bg-green-100 text-green-800",
      },
      INACTIVE: {
        variant: "secondary" as const,
        label: "Inactivo",
        color: "bg-gray-100 text-gray-800",
      },
      EXPIRED: {
        variant: "destructive" as const,
        label: "Expirado",
        color: "bg-red-100 text-red-800",
      },
      USED_UP: {
        variant: "outline" as const,
        label: "Agotado",
        color: "bg-orange-100 text-orange-800",
      },
    } as const;

    const config = variants[status as keyof typeof variants];
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getUsageProgress = (used: number, limit?: number) => {
    if (!limit) return null;

    const percentage = (used / limit) * 100;
    const color =
      percentage >= 90
        ? "bg-red-500"
        : percentage >= 70
          ? "bg-yellow-500"
          : "bg-green-500";

    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color} transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {}
        <div className="lg:col-span-2 space-y-6">
          {}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5 text-indigo-600" />
                Información del Código
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Código
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-muted px-3 py-2 rounded font-mono text-lg font-semibold">
                      {promoCode.code}
                    </code>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    El código no se puede modificar
                  </p>
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">
                    Tipo de descuento
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeIcon(promoCode.type)}
                    <span className="font-semibold">
                      {formatDiscount(promoCode.type, promoCode.value)}
                    </span>
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    El tipo y valor no se pueden modificar
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {}
          {!canEdit && (
            <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800 dark:text-amber-200">
                <strong>Edición limitada:</strong> Este código ya ha sido usado{" "}
                {promoCode._count.usages} vez(es). Solo puedes modificar el
                nombre, descripción, estado y algunos límites.
              </AlertDescription>
            </Alert>
          )}

          {}
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
                      setValue("eventId", value === "all" ? "all" : value)
                    }
                    disabled={!canEdit}
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
                  {!canEdit && (
                    <p className="text-xs text-muted-foreground mt-1">
                      No se puede cambiar después del primer uso
                    </p>
                  )}
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

          {}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Estado y Límites
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {}
              <div>
                <Label>Estado del código</Label>
                <RadioGroup
                  value={watchStatus}
                  onValueChange={(value: "ACTIVE" | "INACTIVE") =>
                    setValue("status", value)
                  }
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3"
                  disabled={
                    promoCode.status === "EXPIRED" ||
                    promoCode.status === "USED_UP"
                  }
                >
                  <div className="relative">
                    <RadioGroupItem
                      value="ACTIVE"
                      id="active"
                      className="sr-only"
                    />
                    <Label
                      htmlFor="active"
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                        watchStatus === "ACTIVE"
                          ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                          : "border-border"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          watchStatus === "ACTIVE"
                            ? "bg-green-500 text-white"
                            : "bg-muted"
                        }`}
                      >
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">Activo</div>
                        <div className="text-xs text-muted-foreground">
                          Los usuarios pueden usar este código
                        </div>
                      </div>
                    </Label>
                  </div>

                  <div className="relative">
                    <RadioGroupItem
                      value="INACTIVE"
                      id="inactive"
                      className="sr-only"
                    />
                    <Label
                      htmlFor="inactive"
                      className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-muted/50 ${
                        watchStatus === "INACTIVE"
                          ? "border-gray-500 bg-gray-50 dark:bg-gray-950/20"
                          : "border-border"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${
                          watchStatus === "INACTIVE"
                            ? "bg-gray-500 text-white"
                            : "bg-muted"
                        }`}
                      >
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium">Inactivo</div>
                        <div className="text-xs text-muted-foreground">
                          Temporalmente deshabilitado
                        </div>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>

                {(promoCode.status === "EXPIRED" ||
                  promoCode.status === "USED_UP") && (
                  <p className="text-sm text-muted-foreground mt-2">
                    No se puede cambiar el estado de códigos expirados o
                    agotados
                  </p>
                )}
              </div>

              <Separator />

              {}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="usageLimit">Límite total de usos</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    {...register("usageLimit", { valueAsNumber: true })}
                    placeholder="Ilimitado"
                    min={Math.max(1, promoCode.usedCount)}
                    className="mt-1"
                    disabled={!canEdit}
                  />
                  {!canEdit && (
                    <p className="text-xs text-muted-foreground mt-1">
                      No se puede reducir por debajo de {promoCode.usedCount}{" "}
                      (ya usado)
                    </p>
                  )}
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

              {}
              <div>
                <Label htmlFor="validUntil">Válido hasta</Label>
                <Input
                  id="validUntil"
                  type="datetime-local"
                  {...register("validUntil")}
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Deja vacío para que no expire automáticamente
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {}
        <div className="space-y-6">
          {}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-muted/50 to-muted/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Estado Actual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Estado:</span>
                  {getStatusBadge(promoCode.status)}
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Usado:</span>
                  <span className="font-medium">
                    {promoCode.usedCount} veces
                  </span>
                </div>

                {promoCode.usageLimit && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Progreso:
                      </span>
                      <span className="font-medium">
                        {promoCode.usedCount}/{promoCode.usageLimit}
                      </span>
                    </div>
                    {getUsageProgress(
                      promoCode.usedCount,
                      promoCode.usageLimit
                    )}
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Creado:</span>
                  <span className="text-sm">
                    {new Date(promoCode.createdAt).toLocaleDateString("es-CL")}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {}
          {watchUsageLimit && (
            <Card className="border-0 shadow-lg border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="text-base">
                  📊 Impacto de Cambios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {watchUsageLimit !== promoCode.usageLimit && (
                  <div>
                    <strong>Nuevo límite:</strong> {watchUsageLimit} usos
                    {watchUsageLimit > (promoCode.usageLimit || 0) && (
                      <div className="text-green-600 text-xs">
                        +{watchUsageLimit - (promoCode.usageLimit || 0)} usos
                        adicionales
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 text-base"
            size="lg"
          >
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Guardando cambios...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Guardar cambios
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
