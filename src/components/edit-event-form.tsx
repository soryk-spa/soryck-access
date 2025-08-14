"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import ImageUpload from "@/components/image-upload-simple";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, Trash2, Ticket, PlusCircle } from "lucide-react";
import { UserRole } from "@prisma/client";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

interface User {
  id: string;
  role: UserRole;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

interface TicketType {
  id: string;
  name: string;
  price: number;
  capacity: number;
  ticketsGenerated: number;
  _count: {
    tickets: number;
  };
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  location: string;
  startDate: string; // Ya formateado como datetime-local
  endDate: string | null; // Ya formateado como datetime-local
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  category: { id: string; name: string };
  _count: { tickets: number };
  ticketTypes: TicketType[];
}

interface EditEventFormProps {
  event: Event;
  categories: Category[];
  user: User;
}

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

export default function EditEventForm({
  event,
  categories,
}: EditEventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description || "",
    location: event.location,
    startDate: event.startDate, // Ya viene formateado desde la página
    endDate: event.endDate || "", // Ya viene formateado desde la página
    categoryId: event.category.id,
    imageUrl: event.imageUrl || "",
  });

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>(
    event.ticketTypes
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTicketTypeChange = (
    index: number,
    field: keyof Omit<TicketType, "id" | "_count" | "createdAt" | "updatedAt">,
    value: string | number
  ) => {
    const newTicketTypes = [...ticketTypes];

    if (field === "name") {
      // Para el nombre, mantener como string
      newTicketTypes[index][field] = value as string;
    } else if (
      field === "price" ||
      field === "capacity" ||
      field === "ticketsGenerated"
    ) {
      // Para campos numéricos
      newTicketTypes[index][field] =
        typeof value === "string" ? Number(value) : value;
    }

    setTicketTypes(newTicketTypes);
  };

  const addTicketType = () => {
    const tempId = `new-${Date.now()}`;
    setTicketTypes([
      ...ticketTypes,
      {
        id: tempId,
        name: "",
        price: 0,
        capacity: 50,
        ticketsGenerated: 1,
        _count: { tickets: 0 },
      },
    ]);
  };

  const removeTicketType = (index: number) => {
    if (ticketTypes.length <= 1) {
      toast.error("Debes tener al menos un tipo de entrada.");
      return;
    }
    const ticketToRemove = ticketTypes[index];
    if (ticketToRemove._count.tickets > 0) {
      toast.error(
        "No puedes eliminar un tipo de entrada que ya tiene tickets vendidos."
      );
      return;
    }
    setTicketTypes(ticketTypes.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // ✅ VALIDACIÓN: Verificar que todos los tipos de entrada sean válidos
    const invalidTicketTypes = ticketTypes.filter(
      (ticket) =>
        !ticket.name || ticket.capacity <= 0 || ticket.ticketsGenerated <= 0
    );

    if (invalidTicketTypes.length > 0) {
      toast.error("Completa todos los campos para cada tipo de entrada.");
      setLoading(false);
      return;
    }

    // ✅ PREPARAR DATOS: Estructura correcta para el API
    const requestBody = {
      ...formData,
      startDate: parseFromDateTimeLocal(formData.startDate),
      endDate: formData.endDate
        ? parseFromDateTimeLocal(formData.endDate)
        : null,
      // ✅ TIPOS DE ENTRADA: Incluir solo campos necesarios
      ticketTypes: ticketTypes.map((ticket) => ({
        id: ticket.id.startsWith("new-") ? undefined : ticket.id, // No enviar IDs temporales
        name: ticket.name,
        description: null, // Agregar si necesitas descripción
        price: Number(ticket.price),
        capacity: Number(ticket.capacity),
        ticketsGenerated: Number(ticket.ticketsGenerated),
      })),
    };

    console.log("📤 Enviando datos:", JSON.stringify(requestBody, null, 2));

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Evento actualizado con éxito!");
        router.push(`/events/${event.id}`);
        router.refresh();
      } else {
        console.error("❌ Error del servidor:", data);
        throw new Error(data.error || "No se pudo actualizar el evento.");
      }
    } catch (error) {
      console.error("❌ Error en la solicitud:", error);
      toast.error(
        error instanceof Error ? error.message : "Ocurrió un error inesperado."
      );
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
    <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Editar Evento</h1>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={event.isPublished ? "default" : "secondary"}>
            {event.isPublished ? "Publicado" : "Borrador"}
          </Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título del evento *</Label>
                <Input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
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
                    <SelectValue />
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
              <ImageUpload
                currentImageUrl={formData.imageUrl}
                onImageChange={handleImageChange}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fecha y Ubicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Inicio *</Label>
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
                  <Label htmlFor="endDate">Fin (opcional)</Label>
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
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>
                  <Ticket className="inline mr-2 h-5 w-5" />
                  Tipos de Entrada
                </span>
                <Badge variant="secondary">
                  Capacidad Total: {totalCapacity}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ticketTypes.map((ticket, index) => (
                <div
                  key={ticket.id}
                  className="space-y-4 border p-4 rounded-lg relative"
                >
                  {ticketTypes.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => removeTicketType(index)}
                      disabled={ticket._count.tickets > 0}
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
                          handleTicketTypeChange(index, "name", e.target.value)
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
                          handleTicketTypeChange(index, "price", e.target.value)
                        }
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`ticketCapacity-${index}`}>
                        Cantidad Disponible *
                      </Label>
                      <Input
                        id={`ticketCapacity-${index}`}
                        type="number"
                        value={ticket.capacity}
                        min={ticket._count.tickets}
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
                      {ticket._count.tickets > 0 && (
                        <p className="text-xs text-yellow-600 mt-1">
                          ⚠️ {ticket._count.tickets} vendidos. Mínimo{" "}
                          {ticket._count.tickets}.
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor={`ticketsGenerated-${index}`}>
                        Entradas por Venta *
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
                        disabled={ticket._count.tickets > 0}
                      />
                      {ticket._count.tickets > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          No se puede cambiar.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={addTicketType}
              >
                <PlusCircle className="w-4 h-4 mr-2" /> Añadir tipo de entrada
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:sticky top-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Guardar Cambios
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
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
