/**
 * Custom hooks para manejo de formularios de eventos
 * Separa la lógica de negocio del componente UI
 */

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  parseChileDatetime, 
  toChileISOString, 
  isFutureDate, 
  isValidDateRange 
} from "@/lib/date-utils";

// ============================================================================
// TIPOS ESPECÍFICOS PARA FORMULARIOS DE EVENTOS
// ============================================================================

export interface TicketTypeForm {
  name: string;
  price: number;
  capacity: number;
  ticketsGenerated: number;
}

export interface EventFormData {
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  categoryId: string;
  imageUrl: string;
}

export interface EventFormErrors {
  title?: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  imageUrl?: string;
  ticketTypes?: string;
  general?: string;
}

export interface InitialEventData {
  id?: string;
  title?: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  imageUrl?: string;
  ticketTypes?: TicketTypeForm[];
}

// ============================================================================
// HOOK PRINCIPAL PARA MANEJO DE EVENTOS
// ============================================================================

export function useEventForm(
  initialData?: InitialEventData,
  mode: "create" | "edit" = "create"
) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<EventFormErrors>({});

  // Estado del formulario
  const [formData, setFormData] = useState<EventFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    location: initialData?.location || "",
    startDate: initialData?.startDate || "",
    endDate: initialData?.endDate || "",
    categoryId: initialData?.categoryId || "",
    imageUrl: initialData?.imageUrl || "",
  });

  // Validaciones del formulario
  const validateForm = useCallback((data: EventFormData, tickets: TicketTypeForm[]): EventFormErrors => {
    const newErrors: EventFormErrors = {};

    if (!data.title.trim()) {
      newErrors.title = "El título es requerido";
    } else if (data.title.length < 3) {
      newErrors.title = "El título debe tener al menos 3 caracteres";
    }

    if (!data.description.trim()) {
      newErrors.description = "La descripción es requerida";
    } else if (data.description.length < 10) {
      newErrors.description = "La descripción debe tener al menos 10 caracteres";
    }

    if (!data.location.trim()) {
      newErrors.location = "La ubicación es requerida";
    }

    if (!data.startDate) {
      newErrors.startDate = "La fecha de inicio es requerida";
    } else {
      const startDate = parseChileDatetime(data.startDate);
      if (!isFutureDate(startDate)) {
        newErrors.startDate = "La fecha de inicio debe ser futura";
      }
    }

    if (!data.endDate) {
      newErrors.endDate = "La fecha de fin es requerida";
    } else if (data.startDate) {
      const startDate = parseChileDatetime(data.startDate);
      const endDate = parseChileDatetime(data.endDate);
      if (!isValidDateRange(startDate, endDate)) {
        newErrors.endDate = "La fecha de fin debe ser posterior al inicio";
      }
    }

    if (!data.categoryId) {
      newErrors.categoryId = "La categoría es requerida";
    }

    if (tickets.length === 0) {
      newErrors.ticketTypes = "Debe agregar al menos un tipo de ticket";
    } else {
      const hasInvalidTicket = tickets.some(
        ticket => !ticket.name.trim() || ticket.price < 0 || ticket.capacity <= 0
      );
      if (hasInvalidTicket) {
        newErrors.ticketTypes = "Todos los tickets deben tener nombre, precio válido y capacidad mayor a 0";
      }
    }

    return newErrors;
  }, []);

  // Manejo de cambios en el formulario
  const handleInputChange = useCallback((field: keyof EventFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // Manejo de envío del formulario
  const handleSubmit = useCallback(async (
    e: React.FormEvent, 
    ticketTypes: TicketTypeForm[]
  ) => {
    e.preventDefault();
    
    const formErrors = validateForm(formData, ticketTypes);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      toast.error("Por favor, corrige los errores en el formulario");
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const startDate = parseChileDatetime(formData.startDate);
      const endDate = parseChileDatetime(formData.endDate);

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        startDate: toChileISOString(startDate),
        endDate: toChileISOString(endDate),
        categoryId: formData.categoryId,
        imageUrl: formData.imageUrl || undefined,
        ticketTypes: ticketTypes.map(ticket => ({
          name: ticket.name.trim(),
          price: ticket.price,
          capacity: ticket.capacity,
        })),
      };

      console.log('📤 Sending eventData to API:', JSON.stringify(eventData, null, 2));

      const url = mode === "create" 
        ? "/api/events" 
        : `/api/events/${initialData?.id}`;
      
      const method = mode === "create" ? "POST" : "PUT";

      console.log('🌐 API URL:', url);
      console.log('🔄 HTTP Method:', method);

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(
          mode === "create" 
            ? "¡Evento creado exitosamente! 🎉" 
            : "¡Evento actualizado exitosamente! ✨"
        );
        router.push("/dashboard/events");
      } else {
        throw new Error(data.error || `Error al ${mode === "create" ? "crear" : "actualizar"} el evento`);
      }
    } catch (error) {
      console.error(`Error ${mode === "create" ? "creating" : "updating"} event:`, error);
      setErrors({ 
        general: error instanceof Error ? error.message : "Error inesperado" 
      });
      toast.error(`Error al ${mode === "create" ? "crear" : "actualizar"} el evento`);
    } finally {
      setLoading(false);
    }
  }, [formData, validateForm, mode, initialData?.id, router]);

  return {
    formData,
    errors,
    loading,
    handleInputChange,
    handleSubmit,
    setFormData,
    setErrors,
  };
}

// ============================================================================
// HOOK PARA MANEJO DE TIPOS DE TICKETS
// ============================================================================

export function useTicketTypes(initialTicketTypes: TicketTypeForm[] = []) {
  const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>(
    initialTicketTypes.length > 0 
      ? initialTicketTypes 
      : [{ name: "", price: 0, capacity: 100, ticketsGenerated: 0 }]
  );

  const handleTicketTypeChange = useCallback((
    index: number,
    field: keyof TicketTypeForm,
    value: string | number
  ) => {
    setTicketTypes(prev =>
      prev.map((ticket, i) =>
        i === index ? { ...ticket, [field]: value } : ticket
      )
    );
  }, []);

  const addTicketType = useCallback(() => {
    setTicketTypes(prev => [
      ...prev,
      { name: "", price: 0, capacity: 100, ticketsGenerated: 0 }
    ]);
  }, []);

  const removeTicketType = useCallback((index: number) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(prev => prev.filter((_, i) => i !== index));
    }
  }, [ticketTypes.length]);

  // Cálculos derivados
  const totalCapacity = ticketTypes.reduce((sum, ticket) => sum + ticket.capacity, 0);
  const averagePrice = ticketTypes.length > 0 
    ? ticketTypes.reduce((sum, ticket) => sum + ticket.price, 0) / ticketTypes.length 
    : 0;
  const hasFreeTikets = ticketTypes.some(ticket => ticket.price === 0);

  return {
    ticketTypes,
    handleTicketTypeChange,
    addTicketType,
    removeTicketType,
    totalCapacity,
    averagePrice,
    hasFreeTikets,
  };
}

// ============================================================================
// HOOK PARA MANEJO DE IMAGEN
// ============================================================================

export function useEventImage(initialImageUrl?: string) {
  const [imageUrl, setImageUrl] = useState(initialImageUrl || "");

  const handleImageChange = useCallback((newImageUrl: string) => {
    setImageUrl(newImageUrl);
  }, []);

  const clearImage = useCallback(() => {
    setImageUrl("");
  }, []);

  return {
    imageUrl,
    handleImageChange,
    clearImage,
  };
}

// ============================================================================
// UTILIDADES PARA ESTADÍSTICAS DEL FORMULARIO
// ============================================================================

export function useEventFormStats(ticketTypes: TicketTypeForm[]) {
  const totalCapacity = ticketTypes.reduce((sum, ticket) => sum + ticket.capacity, 0);
  const totalTypes = ticketTypes.length;
  const averagePrice = totalTypes > 0 
    ? ticketTypes.reduce((sum, ticket) => sum + ticket.price, 0) / totalTypes 
    : 0;
  const freeTickets = ticketTypes.filter(ticket => ticket.price === 0).length;

  return {
    totalCapacity,
    totalTypes,
    averagePrice,
    freeTickets,
  };
}
