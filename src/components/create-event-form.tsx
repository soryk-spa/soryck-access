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
  Users,
  Info,
  ImageIcon,
  Ticket,
  Trash2,
  PlusCircle,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";

interface Category {
  id: string;
  name: string;
}

interface TicketType {
  name: string;
  price: number;
  capacity: number;
  ticketsGenerated: number;
}

interface InitialData {
  id?: string;
  title?: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  imageUrl?: string;
  ticketTypes?: TicketType[];
}

interface EventFormProps {
  categories: Category[];
  initialData?: InitialData;
  mode: "create" | "edit";
}

// Función simple para formatear fecha ISO a datetime-local
const formatForDateTimeLocal = (isoString: string): string => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

// Función definitiva para convertir datetime-local a ISO manteniendo hora local
const parseFromDateTimeLocal = (datetimeLocal: string): string => {
  if (!datetimeLocal) return "";

  // Dividir fecha y hora
  const [datePart, timePart] = datetimeLocal.split("T");
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);

  // Crear fecha usando componentes locales (sin conversión UTC)
  const localDate = new Date(year, month - 1, day, hour, minute);

  // Convertir a ISO manteniendo la hora local como UTC
  return localDate.toISOString();
};

export default function CreateEventForm({
  categories,
  initialData,
  mode,
}: EventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || "",
    description: initialData?.description || "",
    location: initialData?.location || "",
    startDate: initialData?.startDate
      ? formatForDateTimeLocal(initialData.startDate)
      : "",
    endDate: initialData?.endDate
      ? formatForDateTimeLocal(initialData.endDate)
      : "",
    categoryId: initialData?.categoryId || "",
    imageUrl: initialData?.imageUrl || "",
  });

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>(
    initialData?.ticketTypes || [
      {
        name: "Entrada General",
        price: 10000,
        capacity: 100,
        ticketsGenerated: 1,
      },
    ]
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTicketTypeChange = (
    index: number,
    field: keyof TicketType,
    value: string | number
  ) => {
    const newTicketTypes = [...ticketTypes];

    if (field === "name") {
      // Para el nombre, mantener como string
      newTicketTypes[index] = {
        ...newTicketTypes[index],
        [field]: value as string,
      };
    } else {
      // Para campos numéricos (price, capacity, ticketsGenerated)
      const numericValue =
        typeof value === "string" ? parseInt(value, 10) || 0 : value;
      newTicketTypes[index] = {
        ...newTicketTypes[index],
        [field]: numericValue,
      };
    }

    setTicketTypes(newTicketTypes);
  };

  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      { name: "", price: 0, capacity: 50, ticketsGenerated: 1 },
    ]);
  };

  const removeTicketType = (index: number) => {
    if (ticketTypes.length <= 1) {
      toast.error("Debes tener al menos un tipo de entrada.");
      return;
    }
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (
      ticketTypes.some(
        (t) => !t.name || t.capacity <= 0 || t.ticketsGenerated <= 0
      )
    ) {
      toast.error("Completa todos los campos para cada tipo de entrada.");
      setLoading(false);
      return;
    }

    try {
      const url =
        mode === "create" ? "/api/events" : `/api/events/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      // ✅ CORRECCIÓN: Usar parseFromDateTimeLocal para mantener la hora local
      const body = {
        ...formData,
        startDate: parseFromDateTimeLocal(formData.startDate),
        endDate: formData.endDate
          ? parseFromDateTimeLocal(formData.endDate)
          : null,
        ticketTypes,
      };

      console.log("📤 Enviando datos:", JSON.stringify(body, null, 2));

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success(
          mode === "create"
            ? "Evento creado exitosamente"
            : "Evento actualizado"
        );
        router.push(`/events/${data.event.id}`);
      } else {
        toast.error(data.error || "Error al procesar la solicitud");
      }
    } catch (error) {
      console.error("❌ Error:", error);
      toast.error("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  function handleImageChange(imageUrl: string): void {
    setFormData((prev) => ({ ...prev, imageUrl }));
  }

  const totalCapacity = ticketTypes.reduce(
    (sum, type) => sum + type.capacity * type.ticketsGenerated,
    0
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          {mode === "create" ? "Crear un Nuevo Evento" : "Editar Evento"}
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
          Da vida a tu próxima gran idea. Rellena los detalles a continuación.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5" />
                  Información Principal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título del evento *</Label>
                  <Input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Ej: Concierto Acústico de Verano"
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
                    placeholder="Describe tu evento: el ambiente, los artistas, qué esperar..."
                    rows={5}
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoría *</Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      handleInputChange("categoryId", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Imagen del Evento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  currentImageUrl={formData.imageUrl}
                  onImageChange={handleImageChange}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
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
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      handleInputChange("location", e.target.value)
                    }
                    placeholder="Ej: Teatro Cervantes, Valdivia"
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="h-5 w-5" />
                    Tipos de Entrada
                  </div>
                  <Badge variant="outline">
                    Capacidad Total: {totalCapacity} personas
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticketTypes.map((ticket, index) => (
                  <div
                    key={index}
                    className="space-y-4 border bg-background p-4 rounded-lg relative"
                  >
                    {ticketTypes.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={() => removeTicketType(index)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`ticketName-${index}`}>
                          Nombre del Ticket *
                        </Label>
                        <Input
                          id={`ticketName-${index}`}
                          type="text"
                          value={ticket.name}
                          onChange={(e) =>
                            handleTicketTypeChange(
                              index,
                              "name",
                              e.target.value
                            )
                          }
                          placeholder="Ej: Entrada General, VIP, Early Bird"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`ticketPrice-${index}`}>
                          Precio (CLP) *
                        </Label>
                        <Input
                          id={`ticketPrice-${index}`}
                          type="number"
                          min="0"
                          value={ticket.price}
                          onChange={(e) =>
                            handleTicketTypeChange(
                              index,
                              "price",
                              e.target.value
                            )
                          }
                          placeholder="0"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor={`ticketCapacity-${index}`}>
                          Cantidad de Lotes *
                        </Label>
                        <Input
                          id={`ticketCapacity-${index}`}
                          type="number"
                          min="1"
                          value={ticket.capacity}
                          onChange={(e) =>
                            handleTicketTypeChange(
                              index,
                              "capacity",
                              e.target.value
                            )
                          }
                          placeholder="100"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor={`ticketsGenerated-${index}`}>
                          Entradas por Lote *
                        </Label>
                        <Input
                          id={`ticketsGenerated-${index}`}
                          type="number"
                          min="1"
                          value={ticket.ticketsGenerated}
                          onChange={(e) =>
                            handleTicketTypeChange(
                              index,
                              "ticketsGenerated",
                              e.target.value
                            )
                          }
                          placeholder="1"
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Para paquetes (ej. 2 para un 2x1).
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={addTicketType}
                >
                  <PlusCircle className="w-4 h-4 mr-2" /> Añadir otro tipo de
                  entrada
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6 lg:sticky top-6">
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle>Resumen del Evento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <h3 className="font-bold text-xl">
                  {formData.title || "Título de tu evento"}
                </h3>
                <div className="text-sm text-muted-foreground space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-1 flex-shrink-0" />
                    <span>{formData.location || "Ubicación del evento"}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 mt-1 flex-shrink-0" />
                    <span>
                      {formData.startDate
                        ? new Date(formData.startDate).toLocaleString("es-ES", {
                            dateStyle: "long",
                            timeStyle: "short",
                          })
                        : "Fecha y hora"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Users className="h-4 w-4 mt-1 flex-shrink-0" />
                    <span>Capacidad para {totalCapacity} personas</span>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2">
                  <h4 className="font-semibold">Precios:</h4>
                  {ticketTypes.map((t, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>
                        {t.name || "Ticket sin nombre"}{" "}
                        {t.ticketsGenerated > 1
                          ? `(Paquete ${t.ticketsGenerated}x)`
                          : ""}
                      </span>
                      <span className="font-bold">
                        {t.price === 0
                          ? "Gratis"
                          : `$${t.price.toLocaleString("es-CL")}`}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full h-11 text-base"
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Save className="h-5 w-5 mr-2" />
                )}
                {mode === "create" ? "Crear Evento" : "Guardar Cambios"}
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

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                Una vez creado, podrás publicar tu evento, ver estadísticas y
                más desde su panel de gestión.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </form>
    </div>
  );
}
