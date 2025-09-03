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
  Activity,
  ArrowLeft,
  Gift,
} from "lucide-react";

// Importaciones optimizadas desde utilidades centralizadas
import type { Category, Event, User } from "@/types";
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
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    green: "border-green-200 bg-green-50 text-green-700",
    purple: "border-purple-200 bg-purple-50 text-purple-700",
    orange: "border-orange-200 bg-orange-50 text-orange-700",
  };

  return (
    <div className={`border rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <div className="text-lg">{icon}</div>
          <div>
            <h3 className="font-medium text-sm">{title}</h3>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </div>
      <p className="text-xs mt-2 opacity-75">{description}</p>
    </div>
  );
};

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

interface EditEventFormProps {
  event: Event;
  categories: Category[];
  user: User;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function EditEventForm({
  event,
  categories,
}: EditEventFormProps) {
  // Preparar datos iniciales para el hook
  const initialData: InitialEventData = {
    id: event.id,
    title: event.title,
    description: event.description || "",
    location: event.location,
    startDate: event.startDate,
    endDate: event.endDate || "",
    categoryId: event.category.id,
    imageUrl: event.imageUrl || "",
    ticketTypes: event.ticketTypes.map(ticket => ({
      name: ticket.name,
      price: ticket.price,
      capacity: ticket.capacity,
      ticketsGenerated: ticket.ticketsGenerated || 1,
    })),
  };

  // ============================================================================
  // HOOKS ESPECIALIZADOS
  // ============================================================================

  const eventForm = useEventForm(initialData, "edit");
  const ticketTypesHook = useTicketTypes(initialData.ticketTypes);
  const { imageUrl, handleImageChange } = useEventImage(initialData.imageUrl);
  const stats = useEventFormStats(ticketTypesHook.ticketTypes);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  // Sincronizar imageUrl con el formulario
  const handleFormImageChange = (newImageUrl: string) => {
    console.log('🖼️ handleFormImageChange called with:', newImageUrl);
    console.log('🖼️ Form data before update:', eventForm.formData);
    handleImageChange(newImageUrl);
    eventForm.handleInputChange('imageUrl', newImageUrl);
    console.log('🖼️ Form data after update:', eventForm.formData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('🚀 Submitting form with data:', eventForm.formData);
    await eventForm.handleSubmit(e, ticketTypesHook.ticketTypes);
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Status Badge and Back Button */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.history.back()}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver</span>
        </Button>
        
        <Badge variant={event.isPublished ? "default" : "secondary"}>
          {event.isPublished ? "Publicado" : "Borrador"}
        </Badge>
      </div>

      {/* Estadísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Ticket />}
          title="Tipos de Entrada"
          value={stats.totalTypes}
          description="Variedades disponibles"
          color="blue"
        />
        <StatCard
          icon={<Users />}
          title="Capacidad Total"
          value={stats.totalCapacity}
          description="Asistentes máximos"
          color="green"
        />
        <StatCard
          icon={<DollarSign />}
          title="Precio Promedio"
          value={formatCurrency(stats.averagePrice)}
          description="Por entrada"
          color="purple"
        />
        <StatCard
          icon={<Activity />}
          title="Vendidos"
          value={event._count?.tickets || 0}
          description="Entradas vendidas"
          color="orange"
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Columna Principal - Información del Evento (3/4 del ancho en pantallas grandes) */}
          <div className="xl:col-span-3 space-y-6">
            
            {/* Información Básica */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Info className="h-5 w-5" />
                  <span>Información del Evento</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="lg:col-span-2">
                    <Label htmlFor="title">Título del evento *</Label>
                    <Input
                      id="title"
                      value={eventForm.formData.title}
                      onChange={(e) => eventForm.handleInputChange("title", e.target.value)}
                      placeholder="Ej: Conferencia de Tecnología 2024"
                      className="mt-1"
                    />
                    {eventForm.errors.title && (
                      <p className="text-red-500 text-sm mt-1">{eventForm.errors.title}</p>
                    )}
                  </div>

                  <div className="lg:col-span-2">
                    <Label htmlFor="description">Descripción *</Label>
                    <Textarea
                      id="description"
                      value={eventForm.formData.description}
                      onChange={(e) => eventForm.handleInputChange("description", e.target.value)}
                      placeholder="Describe tu evento de manera atractiva..."
                      className="mt-1 min-h-[80px]"
                    />
                    {eventForm.errors.description && (
                      <p className="text-red-500 text-sm mt-1">{eventForm.errors.description}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="location">Ubicación *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="location"
                        value={eventForm.formData.location}
                        onChange={(e) => eventForm.handleInputChange("location", e.target.value)}
                        placeholder="Ej: Centro de Convenciones, Santiago"
                        className="pl-10 mt-1"
                      />
                    </div>
                    {eventForm.errors.location && (
                      <p className="text-red-500 text-sm mt-1">{eventForm.errors.location}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="categoryId">Categoría *</Label>
                    <Select 
                      value={eventForm.formData.categoryId} 
                      onValueChange={(value) => eventForm.handleInputChange("categoryId", value)}
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
                      <p className="text-red-500 text-sm mt-1">{eventForm.errors.categoryId}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Fechas y Horarios */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Calendar className="h-5 w-5" />
                  <span>Fechas y Horarios</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Fecha y hora de inicio *</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={eventForm.formData.startDate}
                        onChange={(e) => eventForm.handleInputChange("startDate", e.target.value)}
                        className="pl-10 mt-1"
                      />
                    </div>
                    {eventForm.errors.startDate && (
                      <p className="text-red-500 text-sm mt-1">{eventForm.errors.startDate}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="endDate">Fecha y hora de fin</Label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={eventForm.formData.endDate}
                        onChange={(e) => eventForm.handleInputChange("endDate", e.target.value)}
                        className="pl-10 mt-1"
                      />
                    </div>
                    {eventForm.errors.endDate && (
                      <p className="text-red-500 text-sm mt-1">{eventForm.errors.endDate}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tipos de Entrada */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between text-lg">
                  <div className="flex items-center space-x-2">
                    <Ticket className="h-5 w-5" />
                    <span>Tipos de Entrada</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={ticketTypesHook.addTicketType}
                    className="flex items-center space-x-1"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>Agregar Tipo</span>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticketTypesHook.ticketTypes.map((ticket, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Tipo de Entrada #{index + 1}</h4>
                      {ticketTypesHook.ticketTypes.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => ticketTypesHook.removeTicketType(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-sm">Nombre *</Label>
                        <Input
                          value={ticket.name}
                          onChange={(e) => ticketTypesHook.handleTicketTypeChange(index, "name", e.target.value)}
                          placeholder="Ej: General"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Precio (CLP) *</Label>
                        <Input
                          type="number"
                          min="0"
                          value={ticket.price}
                          onChange={(e) => ticketTypesHook.handleTicketTypeChange(index, "price", e.target.value)}
                          placeholder="0"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Capacidad *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={ticket.capacity}
                          onChange={(e) => ticketTypesHook.handleTicketTypeChange(index, "capacity", e.target.value)}
                          placeholder="50"
                          className="mt-1"
                        />
                      </div>

                      <div>
                        <Label className="text-sm">Por Ticket *</Label>
                        <Input
                          type="number"
                          min="1"
                          value={ticket.ticketsGenerated || 1}
                          onChange={(e) => ticketTypesHook.handleTicketTypeChange(index, "ticketsGenerated", e.target.value)}
                          placeholder="1"
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      <span>Ingresos estimados: {formatCurrency(ticket.price * ticket.capacity)}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Sistema de Cortesías */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Gift className="h-5 w-5" />
                  <span>Sistema de Cortesías</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="allowCourtesy"
                    checked={eventForm.formData.allowCourtesy}
                    onChange={(e) => 
                      eventForm.handleBooleanChange("allowCourtesy", e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <Label htmlFor="allowCourtesy" className="text-sm font-medium leading-none cursor-pointer">
                    Habilitar cortesías para este evento
                  </Label>
                </div>

                {eventForm.formData.allowCourtesy && (
                  <div className="mt-4 space-y-3">
                    <div>
                      <Label htmlFor="courtesyLimit" className="text-sm font-medium">
                        Límite de cortesías
                      </Label>
                      <Input
                        id="courtesyLimit"
                        type="number"
                        min="1"
                        value={eventForm.formData.courtesyLimit || ""}
                        onChange={(e) => {
                          const value = e.target.value === "" ? null : parseInt(e.target.value);
                          eventForm.handleNumberChange("courtesyLimit", value);
                        }}
                        placeholder="Ej: 50"
                        className="mt-1"
                      />
                      {eventForm.errors.courtesyLimit && (
                        <p className="text-red-500 text-sm mt-1">{eventForm.errors.courtesyLimit}</p>
                      )}
                      <p className="text-gray-500 text-xs mt-1">
                        Número máximo de entradas gratuitas que se pueden solicitar
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="courtesyValidUntil" className="text-sm font-medium">
                          Válido hasta (opcional)
                        </Label>
                        <Input
                          id="courtesyValidUntil"
                          type="time"
                          value={eventForm.formData.courtesyValidUntil || ""}
                          onChange={(e) => {
                            const value = e.target.value === "" ? null : e.target.value;
                            eventForm.handleInputChange("courtesyValidUntil", value || "");
                          }}
                          className="mt-1"
                        />
                        {eventForm.errors.courtesyValidUntil && (
                          <p className="text-red-500 text-sm mt-1">{eventForm.errors.courtesyValidUntil}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">
                          Hora límite para solicitar cortesías gratuitas
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="courtesyPriceAfter" className="text-sm font-medium">
                          Precio después de la hora límite
                        </Label>
                        <Input
                          id="courtesyPriceAfter"
                          type="number"
                          min="0"
                          step="100"
                          value={eventForm.formData.courtesyPriceAfter || ""}
                          onChange={(e) => {
                            const value = e.target.value === "" ? null : parseFloat(e.target.value);
                            eventForm.handleNumberChange("courtesyPriceAfter", value);
                          }}
                          placeholder="Ej: 6000"
                          className="mt-1"
                          disabled={!eventForm.formData.courtesyValidUntil}
                        />
                        {eventForm.errors.courtesyPriceAfter && (
                          <p className="text-red-500 text-sm mt-1">{eventForm.errors.courtesyPriceAfter}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">
                          Precio fijo después de la hora límite (en CLP)
                        </p>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                          <p className="font-medium">¿Cómo funcionan las cortesías?</p>
                          <p className="mt-1">
                            Los usuarios podrán solicitar entradas que deberás aprobar manualmente desde el panel de administración.
                            {eventForm.formData.courtesyValidUntil ? (
                              <>
                                <br /><strong>Horario especial:</strong> Las cortesías serán gratuitas hasta las {eventForm.formData.courtesyValidUntil}, 
                                después tendrán un costo de {eventForm.formData.courtesyPriceAfter ? `$${eventForm.formData.courtesyPriceAfter.toLocaleString()}` : '$0'}.
                              </>
                            ) : (
                              " Las cortesías serán siempre gratuitas."
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Columna Lateral - Imagen (1/4 del ancho en pantallas grandes) */}
          <div className="xl:col-span-1 space-y-6">
            
            {/* Imagen del Evento */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <ImageIcon className="h-5 w-5" />
                  <span>Imagen</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {imageUrl ? (
                    <div className="relative">
                      <Image
                        src={imageUrl}
                        alt="Imagen del evento"
                        width={300}
                        height={200}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => handleFormImageChange("")}
                        className="absolute top-2 right-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Sin imagen</p>
                      </div>
                    </div>
                  )}
                  
                  <ImageUpload
                    currentImageUrl={imageUrl}
                    onImageChange={handleFormImageChange}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Resumen Compacto */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center space-x-2 text-lg">
                  <Sparkles className="h-5 w-5" />
                  <span>Resumen</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Tipos:</span>
                    <Badge variant="outline">{stats.totalTypes}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Capacidad:</span>
                    <Badge variant="outline">{stats.totalCapacity}</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Precio prom.:</span>
                    <span className="font-medium">{formatCurrency(stats.averagePrice)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm pt-2 border-t">
                    <span className="text-gray-600">Ingresos pot.:</span>
                    <span className="font-semibold text-green-600">{formatCurrency(stats.totalCapacity * stats.averagePrice)}</span>
                  </div>

                  {event._count?.tickets > 0 && (
                    <div className="flex justify-between items-center text-sm pt-2 border-t">
                      <span className="text-gray-600">Vendidas:</span>
                      <Badge variant="default">{event._count.tickets}</Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 pt-6 border-t bg-gray-50 -mx-6 px-6 py-4 rounded-b-lg">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>Los cambios se guardarán automáticamente</span>
          </div>
          
          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
            >
              Cancelar
            </Button>
            
            <Button
              type="submit"
              disabled={eventForm.loading}
              className="flex items-center space-x-2"
            >
              {eventForm.loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{eventForm.loading ? "Guardando..." : "Guardar Cambios"}</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
