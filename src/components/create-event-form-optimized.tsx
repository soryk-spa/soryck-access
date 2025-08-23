"use client";

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
  CheckCircle2,
  ArrowRight,
  Award,
  Activity,
} from "lucide-react";

// Importaciones optimizadas desde utilidades centralizadas
import type { Category } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  useEventForm,
  useTicketTypes,
  useEventImage,
  useEventFormStats,
  type InitialEventData,
} from "@/hooks/useEventForm";

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

const StatCard = ({
  icon,
  title,
  value,
  description,
  color = "blue",
}: {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  description: string;
  color?: "blue" | "green" | "purple" | "orange";
}) => {
  const colorClasses = {
    blue: "from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 bg-blue-500 text-blue-600 dark:text-blue-400",
    green: "from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 bg-green-500 text-green-600 dark:text-green-400",
    purple: "from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 bg-purple-500 text-purple-600 dark:text-purple-400",
    orange: "from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 bg-orange-500 text-orange-600 dark:text-orange-400",
  };

  const bgClass = colorClasses[color].split(" ")[0] + " " + colorClasses[color].split(" ")[1];
  const iconBgClass = colorClasses[color].split(" ")[2];
  const textClass = colorClasses[color].split(" ")[3] + " " + colorClasses[color].split(" ")[4];

  return (
    <Card className={`border-0 shadow-lg bg-gradient-to-br ${bgClass}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 ${iconBgClass} text-white rounded-xl shadow-sm`}>
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-2xl font-bold ${textClass}`}>{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

interface EventFormProps {
  categories: Category[];
  initialData?: InitialEventData;
  mode: "create" | "edit";
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function CreateEventFormOptimized({
  categories,
  initialData,
  mode = "create",
}: EventFormProps) {
  // Hooks personalizados para manejo de estado y lógica
  const eventForm = useEventForm(initialData, mode);
  const ticketTypesHook = useTicketTypes(initialData?.ticketTypes);
  const { imageUrl, handleImageChange } = useEventImage(initialData?.imageUrl);
  const stats = useEventFormStats(ticketTypesHook.ticketTypes);

  // Sincronizar imageUrl con el formulario
  const handleFormImageChange = (newImageUrl: string) => {
    handleImageChange(newImageUrl);
    eventForm.handleInputChange('imageUrl', newImageUrl);
  };

  // Manejar envío del formulario
  const handleFormSubmit = (e: React.FormEvent) => {
    eventForm.handleSubmit(e, ticketTypesHook.ticketTypes);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            {mode === "create" ? "Crear Nuevo Evento" : "Editar Evento"}
          </div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {mode === "create" 
              ? "Crea un evento increíble" 
              : `Editando: ${initialData?.title || "Evento"}`
            }
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {mode === "create"
              ? "Llena los detalles de tu evento y comienza a vender entradas de inmediato"
              : "Actualiza los detalles de tu evento y gestiona tus cambios"
            }
          </p>
        </div>

        {/* Estadísticas del formulario */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Ticket className="h-5 w-5" />}
            title="Tipos de Ticket"
            value={stats.totalTypes}
            description="Tipos configurados"
            color="blue"
          />
          <StatCard
            icon={<Users className="h-5 w-5" />}
            title="Capacidad Total"
            value={stats.totalCapacity}
            description="Asientos disponibles"
            color="green"
          />
          <StatCard
            icon={<DollarSign className="h-5 w-5" />}
            title="Precio Promedio"
            value={formatCurrency(stats.averagePrice)}
            description="Por ticket"
            color="purple"
          />
          <StatCard
            icon={<Award className="h-5 w-5" />}
            title="Tickets Gratuitos"
            value={stats.freeTickets}
            description="Entradas sin costo"
            color="orange"
          />
        </div>

        {/* Formulario */}
        <form onSubmit={handleFormSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna izquierda - Información básica */}
            <div className="lg:col-span-2 space-y-6">
              {/* Información básica del evento */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-blue-600" />
                    Información Básica
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="title" className="text-sm font-medium">
                      Título del evento *
                    </Label>
                    <Input
                      id="title"
                      placeholder="Ej: Concierto de Rock en el Estadio"
                      value={eventForm.formData.title}
                      onChange={(e) => eventForm.handleInputChange('title', e.target.value)}
                      className="mt-1"
                    />
                    {eventForm.errors.title && (
                      <p className="text-sm text-red-600 mt-1">{eventForm.errors.title}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-sm font-medium">
                      Descripción *
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Describe tu evento de manera atractiva..."
                      value={eventForm.formData.description}
                      onChange={(e) => eventForm.handleInputChange('description', e.target.value)}
                      className="mt-1 min-h-[100px]"
                    />
                    {eventForm.errors.description && (
                      <p className="text-sm text-red-600 mt-1">{eventForm.errors.description}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-sm font-medium">
                      Ubicación *
                    </Label>
                    <div className="relative mt-1">
                      <MapPin className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        id="location"
                        placeholder="Ej: Teatro Municipal, Santiago Centro"
                        value={eventForm.formData.location}
                        onChange={(e) => eventForm.handleInputChange('location', e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {eventForm.errors.location && (
                      <p className="text-sm text-red-600 mt-1">{eventForm.errors.location}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="categoryId" className="text-sm font-medium">
                      Categoría *
                    </Label>
                    <Select
                      value={eventForm.formData.categoryId}
                      onValueChange={(value) => eventForm.handleInputChange('categoryId', value)}
                    >
                      <SelectTrigger className="mt-1">
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
                    {eventForm.errors.categoryId && (
                      <p className="text-sm text-red-600 mt-1">{eventForm.errors.categoryId}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Fechas y horarios */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-600" />
                    Fechas y Horarios
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate" className="text-sm font-medium">
                        Fecha y hora de inicio *
                      </Label>
                      <div className="relative mt-1">
                        <Clock className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          id="startDate"
                          type="datetime-local"
                          value={eventForm.formData.startDate}
                          onChange={(e) => eventForm.handleInputChange('startDate', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {eventForm.errors.startDate && (
                        <p className="text-sm text-red-600 mt-1">{eventForm.errors.startDate}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="endDate" className="text-sm font-medium">
                        Fecha y hora de fin
                      </Label>
                      <div className="relative mt-1">
                        <Clock className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <Input
                          id="endDate"
                          type="datetime-local"
                          value={eventForm.formData.endDate}
                          onChange={(e) => eventForm.handleInputChange('endDate', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {eventForm.errors.endDate && (
                        <p className="text-sm text-red-600 mt-1">{eventForm.errors.endDate}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tipos de tickets */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Ticket className="h-5 w-5 text-purple-600" />
                      Tipos de Tickets
                    </CardTitle>
                    <Button
                      type="button"
                      onClick={ticketTypesHook.addTicketType}
                      variant="outline"
                      size="sm"
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Agregar tipo
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ticketTypesHook.ticketTypes.map((ticket, index) => (
                    <div key={index} className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium">Tipo de Ticket {index + 1}</h4>
                        {ticketTypesHook.ticketTypes.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => ticketTypesHook.removeTicketType(index)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label className="text-sm font-medium">Nombre *</Label>
                          <Input
                            placeholder="Ej: General"
                            value={ticket.name}
                            onChange={(e) =>
                              ticketTypesHook.handleTicketTypeChange(index, 'name', e.target.value)
                            }
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Precio (CLP) *</Label>
                          <div className="relative mt-1">
                            <DollarSign className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={ticket.price}
                              onChange={(e) =>
                                ticketTypesHook.handleTicketTypeChange(index, 'price', Number(e.target.value))
                              }
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div>
                          <Label className="text-sm font-medium">Capacidad *</Label>
                          <div className="relative mt-1">
                            <Users className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <Input
                              type="number"
                              min="1"
                              placeholder="100"
                              value={ticket.capacity}
                              onChange={(e) =>
                                ticketTypesHook.handleTicketTypeChange(index, 'capacity', Number(e.target.value))
                              }
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>

                      {ticket.price > 0 && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          Ingresos estimados: {formatCurrency(ticket.price * ticket.capacity)}
                        </div>
                      )}
                    </div>
                  ))}

                  {eventForm.errors.ticketTypes && (
                    <Alert>
                      <AlertDescription>{eventForm.errors.ticketTypes}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Columna derecha - Imagen */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-orange-600" />
                    Imagen del Evento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <ImageUpload onImageChange={handleFormImageChange} />
                    {imageUrl && (
                      <div className="relative">
                        <Image
                          src={imageUrl}
                          alt="Preview"
                          width={400}
                          height={300}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="bg-white/90">
                            Vista previa
                          </Badge>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Resumen del evento */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-600" />
                    Resumen del Evento
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Capacidad total</p>
                      <p className="font-semibold">{stats.totalCapacity} personas</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Tipos de ticket</p>
                      <p className="font-semibold">{stats.totalTypes} tipos</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Precio promedio</p>
                      <p className="font-semibold">{formatCurrency(stats.averagePrice)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">Tickets gratuitos</p>
                      <p className="font-semibold">{stats.freeTickets} tipos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Errores generales */}
          {eventForm.errors.general && (
            <Alert className="border-red-200 bg-red-50 dark:bg-red-950">
              <AlertDescription className="text-red-700 dark:text-red-200">
                {eventForm.errors.general}
              </AlertDescription>
            </Alert>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={eventForm.loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={eventForm.loading} className="min-w-32">
              {eventForm.loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {mode === "create" ? "Creando..." : "Actualizando..."}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {mode === "create" ? "Crear Evento" : "Actualizar Evento"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
