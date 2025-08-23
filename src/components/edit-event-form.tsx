"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ImageUpload from "@/components/image-upload-simple";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  Save, 
  Trash2, 
  Ticket, 
  PlusCircle,
  Calendar,
  MapPin,
  Users,
  Info,
  Edit3,
  Clock,
  Target,
  Sparkles,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft
} from "lucide-react";
import { UserRole } from "@prisma/client";
import { toast } from "sonner";
// ✅ IMPORTAR LAS NUEVAS UTILIDADES DE FECHA
import {
  parseChileDatetime,
  formatToChileDatetimeLocal,
  toChileISOString,
  isFutureDate,
  isValidDateRange,
} from "@/lib/date-utils";

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
  startDate: string;
  endDate: string | null;
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
    // ✅ USAR LA FUNCIÓN CORRECTA PARA FORMATEAR FECHAS
    startDate: formatToChileDatetimeLocal(event.startDate),
    endDate: event.endDate ? formatToChileDatetimeLocal(event.endDate) : "",
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
      newTicketTypes[index][field] = value as string;
    } else if (
      field === "price" ||
      field === "capacity" ||
      field === "ticketsGenerated"
    ) {
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

    const invalidTicketTypes = ticketTypes.filter(
      (ticket) =>
        !ticket.name || ticket.capacity <= 0 || ticket.ticketsGenerated <= 0
    );

    if (invalidTicketTypes.length > 0) {
      toast.error("Completa todos los campos para cada tipo de entrada.");
      setLoading(false);
      return;
    }

    try {
      // ✅ VALIDACIONES DE FECHA MEJORADAS
      if (!formData.startDate) {
        toast.error("La fecha de inicio es requerida.");
        setLoading(false);
        return;
      }

      const startDate = parseChileDatetime(formData.startDate);

      if (!isFutureDate(startDate)) {
        toast.error("La fecha de inicio debe ser en el futuro.");
        setLoading(false);
        return;
      }

      let endDate: Date | null = null;
      if (formData.endDate) {
        endDate = parseChileDatetime(formData.endDate);

        if (!isValidDateRange(startDate, endDate)) {
          toast.error(
            "La fecha de fin debe ser posterior a la fecha de inicio."
          );
          setLoading(false);
          return;
        }
      }

      // ✅ PREPARAR DATOS CON FECHAS CORRECTAS
      const requestBody = {
        ...formData,
        startDate: toChileISOString(startDate),
        endDate: endDate ? toChileISOString(endDate) : null,
        ticketTypes: ticketTypes.map((ticket) => ({
          id: ticket.id.startsWith("new-") ? undefined : ticket.id,
          name: ticket.name,
          description: null,
          price: Number(ticket.price),
          capacity: Number(ticket.capacity),
          ticketsGenerated: Number(ticket.ticketsGenerated),
        })),
      };

      console.log(
        "📤 Enviando datos con fechas correctas:",
        JSON.stringify(requestBody, null, 2)
      );

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
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Ocurrió un error inesperado.");
      }
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

  // Componente para tarjetas de estadísticas
  const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
    accentColor = "blue",
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    description: string;
    accentColor?: "blue" | "green" | "purple" | "orange";
  }) => {
    const colorVariants = {
      blue: {
        bg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
        icon: "bg-blue-500 text-white",
        accent: "text-blue-600 dark:text-blue-400",
      },
      green: {
        bg: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
        icon: "bg-green-500 text-white",
        accent: "text-green-600 dark:text-green-400",
      },
      purple: {
        bg: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
        icon: "bg-purple-500 text-white",
        accent: "text-purple-600 dark:text-purple-400",
      },
      orange: {
        bg: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900",
        icon: "bg-orange-500 text-white",
        accent: "text-orange-600 dark:text-orange-400",
      },
    };

    const colors = colorVariants[accentColor];

    return (
      <Card className={`border-0 ${colors.bg}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <p className={`text-2xl font-bold ${colors.accent}`}>
                {value}
              </p>
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            </div>
            <div className={`p-3 rounded-lg ${colors.icon}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Header con navegación */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => router.back()}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Volver
                </Button>
                <Separator orientation="vertical" className="h-4" />
                <Edit3 className="h-5 w-5 text-muted-foreground" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Editar Evento
              </h1>
              <p className="text-muted-foreground">
                Modifica los detalles de tu evento y tipos de entrada
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge 
                variant={event.isPublished ? "default" : "secondary"}
                className="px-3 py-1"
              >
                {event.isPublished ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Publicado
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Borrador
                  </>
                )}
              </Badge>
            </div>
          </div>

          {/* Estadísticas del evento */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Tickets Vendidos"
              value={event._count.tickets}
              icon={Ticket}
              description="Total de entradas"
              accentColor="blue"
            />
            <StatCard
              title="Capacidad Total"
              value={totalCapacity}
              icon={Users}
              description="Máximo de asistentes"
              accentColor="green"
            />
            <StatCard
              title="Tipos de Entrada"
              value={ticketTypes.length}
              icon={Target}
              description="Diferentes categorías"
              accentColor="purple"
            />
            <StatCard
              title="Ocupación"
              value={`${Math.round((event._count.tickets / totalCapacity) * 100)}%`}
              icon={Activity}
              description="Porcentaje vendido"
              accentColor="orange"
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              {/* Información Básica */}
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-xl">Información Básica</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Título del evento *
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      required
                      className="h-11"
                      placeholder="Ej: Concierto de Jazz en Vivo"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium">
                      Descripción
                    </Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange("description", e.target.value)
                      }
                      rows={4}
                      className="resize-none"
                      placeholder="Describe tu evento, qué pueden esperar los asistentes..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-sm font-medium">
                      Categoría *
                    </Label>
                    <Select
                      value={formData.categoryId}
                      onValueChange={(value) =>
                        handleInputChange("categoryId", value)
                      }
                    >
                      <SelectTrigger className="h-11">
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
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Imagen del evento
                    </Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                      <ImageUpload
                        currentImageUrl={formData.imageUrl}
                        onImageChange={handleImageChange}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fecha y Ubicación */}
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                      <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-xl">Fecha y Ubicación</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate" className="text-sm font-medium">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Fecha de inicio *
                      </Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) =>
                          handleInputChange("startDate", e.target.value)
                        }
                        required
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Hora de Chile (se ajusta automáticamente por horario de verano)
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate" className="text-sm font-medium">
                        <Clock className="h-4 w-4 inline mr-1" />
                        Fecha de fin (opcional)
                      </Label>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) =>
                          handleInputChange("endDate", e.target.value)
                        }
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Deja vacío para eventos de un solo día
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium">
                      <MapPin className="h-4 w-4 inline mr-1" />
                      Ubicación *
                    </Label>
                    <Input
                      id="location"
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      required
                      className="h-11"
                      placeholder="Ej: Teatro Municipal, Santiago, Chile"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tipos de Entrada */}
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <Ticket className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <CardTitle className="text-xl">Tipos de Entrada</CardTitle>
                    </div>
                    <Badge variant="secondary" className="px-3 py-1">
                      <Users className="h-3 w-3 mr-1" />
                      Capacidad: {totalCapacity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {ticketTypes.map((ticket, index) => (
                    <div
                      key={ticket.id}
                      className="relative p-6 border border-border/50 rounded-xl bg-gradient-to-br from-background to-muted/20 space-y-4"
                    >
                      {ticketTypes.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute top-3 right-3 h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          onClick={() => removeTicketType(index)}
                          disabled={ticket._count.tickets > 0}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`ticketName-${index}`} className="text-sm font-medium">
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
                            className="h-11"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`ticketPrice-${index}`} className="text-sm font-medium">
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
                            className="h-11"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`ticketCapacity-${index}`} className="text-sm font-medium">
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
                            className="h-11"
                          />
                          {ticket._count.tickets > 0 && (
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-3 w-3 text-yellow-500" />
                              <p className="text-xs text-yellow-600">
                                {ticket._count.tickets} vendidos. Mínimo {ticket._count.tickets}.
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`ticketsGenerated-${index}`} className="text-sm font-medium">
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
                            className="h-11"
                          />
                          {ticket._count.tickets > 0 && (
                            <p className="text-xs text-muted-foreground">
                              No se puede cambiar después de vender tickets.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-dashed border-2 hover:bg-muted/50"
                    onClick={addTicketType}
                  >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Añadir nuevo tipo de entrada
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar con acciones */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                      <Sparkles className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <CardTitle className="text-xl">Acciones</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar Cambios
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12"
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  
                  <Separator />
                  
                  <div className="space-y-3 pt-2">
                    <h4 className="text-sm font-medium text-muted-foreground">
                      Acceso rápido
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-10"
                      onClick={() => router.push(`/events/${event.id}`)}
                    >
                      <Target className="h-4 w-4 mr-2" />
                      Ver evento público
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start h-10"
                      onClick={() => router.push(`/dashboard/events`)}
                    >
                      <Activity className="h-4 w-4 mr-2" />
                      Dashboard de eventos
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Información adicional */}
              <Card className="border-0 shadow-lg bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">Información</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <span>Los cambios se guardan automáticamente al enviar</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertTriangle className="h-4 w-4" />
                    <span>No puedes eliminar tipos con tickets vendidos</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Las fechas se manejan en horario de Chile</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
