// src/lib/date.ts - REEMPLAZA EL CONTENIDO EXISTENTE
/**
 * Utilidades de fecha mejoradas que manejan correctamente la zona horaria de Chile
 * Mantiene compatibilidad con los componentes existentes
 */

/**
 * Formatea una fecha completa con día, fecha y hora
 * Mejorado para manejar correctamente la zona horaria de Chile
 */
export const formatFullDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  });
};

/**
 * Formatea solo la fecha (sin hora)
 * Mejorado para manejar correctamente la zona horaria de Chile
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Santiago",
  });
};

/**
 * Formatea solo la hora
 * Mejorado para manejar correctamente la zona horaria de Chile
 */
export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  });
};

/**
 * Formatea fecha corta (día/mes/año)
 */
export const formatShortDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit", 
    year: "numeric",
    timeZone: "America/Santiago",
  });
};

/**
 * Verifica si una fecha es hoy
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return dateObj.toDateString() === today.toDateString();
};

/**
 * Verifica si una fecha es mañana
 */
export const isTomorrow = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return dateObj.toDateString() === tomorrow.toDateString();
};

/**
 * Obtiene una descripción relativa de la fecha (ej: "Hoy", "Mañana", "En 3 días")
 */
export const getRelativeDateDescription = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) return "Hoy";
  if (isTomorrow(dateObj)) return "Mañana";
  
  const now = new Date();
  const diffTime = dateObj.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return diffDays === -1 ? "Ayer" : `Hace ${Math.abs(diffDays)} días`;
  } else if (diffDays <= 7) {
    return `En ${diffDays} días`;
  } else {
    return formatDate(dateObj);
  }
};

/**
 * Calcula el tiempo restante hasta una fecha
 */
export const getTimeUntil = (date: Date | string): {
  days: number;
  hours: number;
  minutes: number;
  isExpired: boolean;
} => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffTime = dateObj.getTime() - now.getTime();
  
  if (diffTime <= 0) {
    return { days: 0, hours: 0, minutes: 0, isExpired: true };
  }
  
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
  
  return { days, hours, minutes, isExpired: false };
};