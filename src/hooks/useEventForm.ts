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
  allowCourtesy: boolean;
  courtesyLimit: number | null;
  courtesyValidUntil: string | null;
  courtesyPriceAfter: number | null;
}

export interface EventFormErrors {
  title?: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  imageUrl?: string;
  allowCourtesy?: string;
  courtesyLimit?: string;
  courtesyValidUntil?: string;
  courtesyPriceAfter?: string;
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
  allowCourtesy?: boolean;
  courtesyLimit?: number | null;
  courtesyValidUntil?: string | null;
  courtesyPriceAfter?: number | null;
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
    allowCourtesy: initialData?.allowCourtesy || false,
    courtesyLimit: initialData?.courtesyLimit || null,
    courtesyValidUntil: initialData?.courtesyValidUntil || null,
    courtesyPriceAfter: initialData?.courtesyPriceAfter || null,
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

    // Validación del sistema de cortesías
    if (data.allowCourtesy && (!data.courtesyLimit || data.courtesyLimit <= 0)) {
      newErrors.courtesyLimit = "El límite de cortesías debe ser mayor a 0 cuando están habilitadas";
    }

    // Validar hora límite de cortesía
    if (data.allowCourtesy && data.courtesyValidUntil) {
      const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(data.courtesyValidUntil)) {
        newErrors.courtesyValidUntil = "Formato de hora inválido (use HH:mm)";
      }
    }

    // Validar precio después de cortesía
    if (data.allowCourtesy && data.courtesyValidUntil && (!data.courtesyPriceAfter || data.courtesyPriceAfter < 0)) {
      newErrors.courtesyPriceAfter = "El precio después de la hora límite debe ser mayor o igual a 0";
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

  // Manejo de cambios en campos booleanos
  const handleBooleanChange = useCallback((field: keyof EventFormData, value: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario cambie el valor
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [errors]);

  // Manejo de cambios en campos numéricos
  const handleNumberChange = useCallback((field: keyof EventFormData, value: number | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Limpiar error del campo cuando el usuario cambie el valor
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
        allowCourtesy: formData.allowCourtesy,
        courtesyLimit: formData.allowCourtesy ? formData.courtesyLimit : null,
        courtesyValidUntil: formData.allowCourtesy ? formData.courtesyValidUntil : null,
        courtesyPriceAfter: formData.allowCourtesy && formData.courtesyValidUntil ? formData.courtesyPriceAfter : null,
        ticketTypes: ticketTypes.map(ticket => ({
          name: ticket.name.trim(),
          price: ticket.price,
          capacity: ticket.capacity,
        })),
      };

  // Use structured logging for API submissions
  // Import logger lazily to avoid client-side bundling in hooks
  const { logger } = await import('@/lib/logger');
  logger.debug('📤 Sending eventData to API', { eventData });

      const url = mode === "create" 
        ? "/api/events" 
        : `/api/events/${initialData?.id}`;
      
      const method = mode === "create" ? "POST" : "PUT";

  logger.debug('🌐 API URL', { url });
  logger.debug('🔄 HTTP Method', { method });

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
  const { logger } = await import('@/lib/logger');
  logger.error(`Error ${mode === "create" ? "creating" : "updating"} event:`, error as Error);
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
    handleBooleanChange,
    handleNumberChange,
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
