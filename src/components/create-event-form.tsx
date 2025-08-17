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
import { Badge } from "@/components/ui/badge";
import ImageUpload from "@/components/image-upload-simple";
import Image from "next/image";
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
  Sparkles,
  Clock,
  DollarSign,
  Target,
  CheckCircle2,
  ArrowRight,
  Zap,
  Award,
  Activity,
} from "lucide-react";
import { toast } from "sonner";
import {
  parseChileDatetime,
  formatToChileDatetimeLocal,
  toChileISOString,
  isFutureDate,
  isValidDateRange,
  formatDisplayDateTime,
} from "@/lib/date-utils";

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
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colors.icon} shadow-sm`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-xl font-bold ${colors.accent}`}>{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
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
      ? formatToChileDatetimeLocal(initialData.startDate)
      : "",
    endDate: initialData?.endDate
      ? formatToChileDatetimeLocal(initialData.endDate)
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
      newTicketTypes[index] = {
        ...newTicketTypes[index],
        [field]: value as string,
      };
    } else {
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

      const url =
        mode === "create" ? "/api/events" : `/api/events/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PUT";

      const body = {
        ...formData,
        startDate: toChileISOString(startDate),
        endDate: endDate ? toChileISOString(endDate) : null,
        ticketTypes,
      };

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
      console.error("Error:", error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Error de conexión");
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

  const totalRevenue = ticketTypes.reduce(
    (sum, type) => sum + type.price * type.capacity,
    0
  );

  const avgPrice =
    ticketTypes.length > 0
      ? ticketTypes.reduce((sum, type) => sum + type.price, 0) /
        ticketTypes.length
      : 0;

  const freeTickets = ticketTypes.filter((t) => t.price === 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-cyan-600/90"></div>
          <div className="absolute top-4 right-4 opacity-20">
            <Sparkles className="h-32 w-32" />
          </div>
          <div className="relative z-10">
            <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 mb-6">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {mode === "create" ? "Crear Nuevo Evento" : "Editar Evento"}
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-4">
                {mode === "create"
                  ? "Dale vida a tu evento"
                  : "Perfecciona tu evento"}
              </h1>
              <p className="text-xl text-purple-100 mb-6 max-w-2xl">
                {mode === "create"
                  ? "Convierte tu idea en una experiencia inolvidable. Completa los detalles y empieza a vender tickets."
                  : "Ajusta los detalles de tu evento para ofrecer la mejor experiencia."}
              </p>
              <div className="flex items-center gap-6 text-purple-100 text-sm">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>Plataforma profesional</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span>Solo 6% de comisión</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Pagos seguros</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Capacidad Total"
            value={totalCapacity}
            icon={Users}
            description="Asistentes máximos"
            accentColor="blue"
          />
          <StatCard
            title="Tipos de Entrada"
            value={ticketTypes.length}
            icon={Ticket}
            description="Opciones de ticket"
            accentColor="green"
          />
          <StatCard
            title="Ingresos Potenciales"
            value={`$${totalRevenue.toLocaleString("es-CL")}`}
            icon={DollarSign}
            description="Si se vende todo"
            accentColor="purple"
          />
          <StatCard
            title="Precio Promedio"
            value={avgPrice > 0 ? `$${Math.round(avgPrice).toLocaleString("es-CL")}` : "Gratis"}
            icon={Target}
            description={freeTickets > 0 ? `${freeTickets} gratis` : "Precio por ticket"}
            accentColor="orange"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Información Principal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="text-sm font-medium">
                        Título del evento *
                      </Label>
                      <Input
                        id="title"
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange("title", e.target.value)}
                        placeholder="Ej: Concierto Acústico de Verano"
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description" className="text-sm font-medium">
                        Descripción
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          handleInputChange("description", e.target.value)
                        }
                        placeholder="Describe tu evento: el ambiente, los artistas, qué esperar..."
                        rows={4}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="category" className="text-sm font-medium">
                        Categoría *
                      </Label>
                      <Select
                        value={formData.categoryId}
                        onValueChange={(value) =>
                          handleInputChange("categoryId", value)
                        }
                        required
                      >
                        <SelectTrigger className="mt-1">
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
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-green-600" />
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
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Fecha y Ubicación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate" className="text-sm font-medium">
                        Fecha y hora de inicio *
                      </Label>
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={formData.startDate}
                        onChange={(e) =>
                          handleInputChange("startDate", e.target.value)
                        }
                        className="mt-1"
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Hora de Chile (se ajusta automáticamente por horario de verano)
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="endDate" className="text-sm font-medium">
                        Fecha y hora de fin (opcional)
                      </Label>
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={formData.endDate}
                        onChange={(e) =>
                          handleInputChange("endDate", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-sm font-medium">
                      Ubicación *
                    </Label>
                    <Input
                      id="location"
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      placeholder="Ej: Teatro Cervantes, Valdivia"
                      className="mt-1"
                      required
                    />
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-5 w-5 text-orange-600" />
                      Tipos de Entrada
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      Capacidad Total: {totalCapacity} personas
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {ticketTypes.map((ticket, index) => (
                    <div
                      key={index}
                      className="relative p-6 border border-gray-200 dark:border-gray-700 rounded-xl bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700"
                    >
                      {ticketTypes.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeTicketType(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {index + 1}
                          </div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            Tipo de Entrada #{index + 1}
                          </h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`ticketName-${index}`} className="text-sm font-medium">
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
                              className="mt-1"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`ticketPrice-${index}`} className="text-sm font-medium">
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
                              className="mt-1"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor={`ticketCapacity-${index}`} className="text-sm font-medium">
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
                              className="mt-1"
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`ticketsGenerated-${index}`} className="text-sm font-medium">
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
                              className="mt-1"
                              required
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                              Para paquetes (ej. 2 para un 2x1).
                            </p>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                          <div className="flex justify-between text-sm">
                            <span className="text-blue-700 dark:text-blue-400">
                              Total tickets a generar:
                            </span>
                            <span className="font-semibold text-blue-800 dark:text-blue-300">
                              {ticket.capacity * ticket.ticketsGenerated}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm mt-1">
                            <span className="text-blue-700 dark:text-blue-400">
                              Ingresos potenciales:
                            </span>
                            <span className="font-semibold text-blue-800 dark:text-blue-300">
                              ${(ticket.price * ticket.capacity).toLocaleString("es-CL")} CLP
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-dashed border-2 py-8 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    onClick={addTicketType}
                  >
                    <PlusCircle className="w-5 h-5 mr-2" />
                    Añadir otro tipo de entrada
                  </Button>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6 lg:sticky top-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                <CardHeader>
                  <CardTitle className="text-blue-700 dark:text-blue-400">
                    Vista Previa
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white">
                      {formData.title || "Título de tu evento"}
                    </h3>
                    {formData.imageUrl && (
                      <div className="w-full h-32 bg-gray-200 rounded-lg mb-4 overflow-hidden relative">
                        <Image
                          src={formData.imageUrl}
                          alt="Preview"
                          fill
                          className="object-cover"
                          style={{ objectFit: "cover" }}
                          sizes="100vw"
                          priority
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-4 w-4 mt-1 flex-shrink-0 text-blue-600" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {formData.location || "Ubicación del evento"}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-4 w-4 mt-1 flex-shrink-0 text-blue-600" />
                      <span className="text-gray-700 dark:text-gray-300">
                        {formData.startDate
                          ? formatDisplayDateTime(
                              parseChileDatetime(formData.startDate)
                            )
                          : "Fecha y hora"}
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <Users className="h-4 w-4 mt-1 flex-shrink-0 text-blue-600" />
                      <span className="text-gray-700 dark:text-gray-300">
                        Capacidad para {totalCapacity} personas
                      </span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="font-semibold text-blue-700 dark:text-blue-400">
                      Precios:
                    </h4>
                    {ticketTypes.map((t, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">
                          {t.name || `Ticket ${i + 1}`}
                          {t.ticketsGenerated > 1 && (
                            <span className="text-xs text-blue-600 ml-1">
                              (Paquete {t.ticketsGenerated}x)
                            </span>
                          )}
                        </span>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">
                          {t.price === 0
                            ? "Gratis"
                            : `$${t.price.toLocaleString("es-CL")}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <div className="space-y-4">
                <Button
                  type="submit"
                  className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-5 w-5 mr-2" />
                  )}
                  {mode === "create" ? "Crear Evento" : "Guardar Cambios"}
                  {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
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
                  Las fechas se guardan automáticamente en la zona horaria de
                  Chile, incluyendo el ajuste por horario de verano.
                </AlertDescription>
              </Alert>
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <Sparkles className="h-5 w-5" />
                    Tips para tu evento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                    <span className="text-green-700 dark:text-green-300">
                      Usa imágenes de alta calidad para atraer más asistentes
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                    <span className="text-green-700 dark:text-green-300">
                      Describe claramente qué pueden esperar los asistentes
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                    <span className="text-green-700 dark:text-green-300">
                      Configura diferentes tipos de entrada para maximizar ventas
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 mt-0.5 text-green-600" />
                    <span className="text-green-700 dark:text-green-300">
                      Solo pagamos una comisión del 6% por venta exitosa
                    </span>
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