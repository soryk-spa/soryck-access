"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ImageUpload from "@/components/image-upload-simple";
import {
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Info,
  CheckCircle,
  ImageIcon,
} from "lucide-react";
import {
  formatPrice,
  calculatePriceBreakdown,
} from "@/lib/commission";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

interface EventFormProps {
  categories: Category[];
  initialData?: {
    id?: string;
    title: string;
    description?: string;
    location: string;
    startDate: string;
    endDate?: string;
    categoryId: string;
    capacity: number;
    price: number;
    currency: string;
    isFree: boolean;
    imageUrl?: string;
  };
  mode: "create" | "edit";
}

export default function EventForm({
  categories,
  initialData,
  mode,
}: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    location: initialData?.location || "",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    categoryId: initialData?.categoryId || "",
    capacity: initialData?.capacity || 100,
    price: initialData?.price || 0,
    currency: initialData?.currency || "CLP",
    isFree: initialData?.isFree || false,
    imageUrl: initialData?.imageUrl || "",
  });

  const priceBreakdown = calculatePriceBreakdown(
    formData.price,
    formData.currency
  );
  const finalPrice = formData.isFree ? 0 : priceBreakdown.totalPrice;

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFreeToggle = (isFree: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isFree,
      price: isFree ? 0 : prev.price,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url =
        mode === "create" ? "/api/events" : `/api/events/${initialData?.id}`;

      const method = mode === "create" ? "POST" : "PUT";

      const body = {
        ...formData,
        startDate: formData.startDate
          ? new Date(formData.startDate).toISOString()
          : "",
        endDate: formData.endDate
          ? new Date(formData.endDate).toISOString()
          : "",
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          mode === "create"
            ? "Evento creado exitosamente"
            : "Evento actualizado exitosamente"
        );
        router.push(`/events/${data.event.id}`);
      } else {
        toast.error(data.error || "Error al procesar la solicitud");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  function handleImageChange(imageUrl: string): void {
    setFormData((prev) => ({
      ...prev,
      imageUrl,
    }));
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">
          {mode === "create" ? "Crear Nuevo Evento" : "Editar Evento"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {mode === "create"
            ? "Completa la información para crear tu evento"
            : "Modifica la información de tu evento"}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Información Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título del evento *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="ej. Concierto de Rock en Vivo"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Describe tu evento, qué pueden esperar los asistentes..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      handleInputChange("categoryId", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="imageUrl">Imagen del evento (opcional)</Label>
                  <ImageUpload
                    currentImageUrl={formData.imageUrl}
                    onImageChange={handleImageChange}
                  />

                  {/* Información adicional */}
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Los eventos con imágenes obtienen 40% más clicks</p>
                    <p>• Formatos permitidos: PNG, JPG, WebP (máx 4MB)</p>
                    <p>• Se recomienda una proporción 16:9 o 3:2</p>
                  </div>

                  {/* Estado de la imagen */}
                  {formData.imageUrl ? (
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      Imagen cargada y lista para usar
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ImageIcon className="h-4 w-4" />
                      Sin imagen - se usará una imagen por defecto
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Fecha y Ubicación
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Fecha y hora de inicio *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) =>
                        handleInputChange("startDate", e.target.value)
                      }
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="endDate">
                      Fecha y hora de fin (opcional)
                    </Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) =>
                        handleInputChange("endDate", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Ubicación *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder="ej. Teatro Nacional, Santiago, Chile"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Capacidad y Tickets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="capacity">Capacidad máxima *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    max="100000"
                    value={formData.capacity}
                    onChange={(e) =>
                      handleInputChange("capacity", parseInt(e.target.value))
                    }
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Número máximo de asistentes permitidos
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Configuración de Precios
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Tipo de evento</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={formData.isFree ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFreeToggle(true)}
                    >
                      Gratuito
                    </Button>
                    <Button
                      type="button"
                      variant={!formData.isFree ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleFreeToggle(false)}
                    >
                      Pagado
                    </Button>
                  </div>
                </div>

                {!formData.isFree && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="price">Precio base por ticket *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="100"
                        value={formData.price}
                        onChange={(e) =>
                          handleInputChange(
                            "price",
                            parseInt(e.target.value) || 0
                          )
                        }
                        placeholder="10000"
                        required
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Este es el precio que tú recibes por cada ticket
                      </p>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          Vista previa de precios
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setShowPriceBreakdown(!showPriceBreakdown)
                          }
                        >
                          <Info className="h-4 w-4 mr-2" />
                          {showPriceBreakdown ? "Ocultar" : "Ver"} desglose
                        </Button>
                      </div>

                      {formData.price > 0 && (
                        <div className="bg-muted p-4 rounded-lg space-y-2">
                          {showPriceBreakdown ? (
                            <>
                              <div className="flex justify-between text-sm">
                                <span>Precio base:</span>
                                <span>
                                  {formatPrice(
                                    formData.price,
                                    formData.currency
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Comisión SorykPass (6%):</span>
                                <span>
                                  {formatPrice(
                                    priceBreakdown.commission,
                                    formData.currency
                                  )}
                                </span>
                              </div>
                              <Separator />
                              <div className="flex justify-between font-medium">
                                <span>Precio final para usuarios:</span>
                                <span className="text-primary">
                                  {formatPrice(finalPrice, formData.currency)}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">
                                {formatPrice(finalPrice, formData.currency)}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Precio que verán los usuarios
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    {formData.isFree
                      ? "Los eventos gratuitos no tienen ningún costo adicional."
                      : "Se añade automáticamente una comisión del 6% al precio base. Los usuarios ven el precio final desde el inicio."}
                  </AlertDescription>
                </Alert>

                {!formData.isFree && formData.price > 0 && (
                  <div className="pt-4 border-t space-y-2">
                    <h4 className="font-medium text-sm">
                      Estimaciones de ingresos
                    </h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>Por ticket (para ti):</span>
                        <span>
                          {formatPrice(formData.price, formData.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Al 50% de capacidad:</span>
                        <span>
                          {formatPrice(
                            formData.price * Math.floor(formData.capacity / 2),
                            formData.currency
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Evento completo:</span>
                        <span className="font-medium">
                          {formatPrice(
                            formData.price * formData.capacity,
                            formData.currency
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {mode === "create" ? "Creando..." : "Guardando..."}
                  </>
                ) : mode === "create" ? (
                  "Crear Evento"
                ) : (
                  "Guardar Cambios"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancelar
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">💡 Consejos</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground space-y-2">
                <p>• Un título claro atrae más asistentes</p>
                <p>• Las imágenes aumentan las conversiones un 40%</p>
                <p>• Describe claramente qué incluye el evento</p>
                <p>• Los precios transparentes generan más confianza</p>
                {!formData.isFree && (
                  <p>
                    • La comisión se aplica automáticamente al procesar pagos
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
