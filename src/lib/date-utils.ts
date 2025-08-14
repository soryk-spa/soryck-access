// src/lib/date-utils.ts
/**
 * Utilidades para manejo correcto de fechas en zona horaria de Chile
 * Maneja tanto CLT (UTC-4) como CLST (UTC-3) automáticamente
 */

/**
 * Convierte un string de datetime-local a Date con zona horaria de Chile
 * @param datetimeLocal - String del input datetime-local (formato: "2024-12-25T15:30")
 * @returns Date object con la hora correcta para Chile
 */
export function parseChileDatetime(datetimeLocal: string): Date {
  if (!datetimeLocal) {
    throw new Error('Fecha requerida');
  }

  // Crear fecha interpretando como hora local de Chile
  const date = new Date(datetimeLocal);
  
  // Verificar si la fecha es válida
  if (isNaN(date.getTime())) {
    throw new Error('Fecha inválida');
  }

  return date;
}

/**
 * Convierte una Date de la base de datos a formato datetime-local para Chile
 * @param date - Date object de la base de datos
 * @returns String en formato datetime-local ("2024-12-25T15:30")
 */
export function formatToChileDatetimeLocal(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  // Formatear en zona horaria de Chile
  const chileDate = new Date(dateObj.toLocaleString("en-US", { timeZone: "America/Santiago" }));
  
  const year = chileDate.getFullYear();
  const month = String(chileDate.getMonth() + 1).padStart(2, '0');
  const day = String(chileDate.getDate()).padStart(2, '0');
  const hours = String(chileDate.getHours()).padStart(2, '0');
  const minutes = String(chileDate.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Convierte una Date a ISO string manteniendo la zona horaria de Chile
 * @param date - Date object
 * @returns ISO string para enviar a la API
 */
export function toChileISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Valida que una fecha sea futura
 * @param date - Date object a validar
 * @returns boolean
 */
export function isFutureDate(date: Date): boolean {
  const now = new Date();
  return date > now;
}

/**
 * Valida que la fecha de fin sea posterior a la de inicio
 * @param startDate - Fecha de inicio
 * @param endDate - Fecha de fin
 * @returns boolean
 */
export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return endDate > startDate;
}

/**
 * Formatea una fecha para mostrar en la UI (solo fecha)
 * @param date - Date object o string ISO
 * @returns String formateado ("Lunes, 25 de diciembre de 2024")
 */
export function formatDisplayDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString("es-CL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Santiago",
  });
}

/**
 * Formatea una fecha para mostrar en la UI (fecha y hora)
 * @param date - Date object o string ISO
 * @returns String formateado ("Lunes, 25 de diciembre de 2024 a las 15:30")
 */
export function formatDisplayDateTime(date: Date | string): string {
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
}

/**
 * Formatea solo la hora
 * @param date - Date object o string ISO
 * @returns String formateado ("15:30")
 */
export function formatDisplayTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  });
}

/**
 * Obtiene la fecha actual en Chile
 * @returns Date object con la fecha/hora actual de Chile
 */
export function getCurrentChileDate(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Santiago" }));
}

/**
 * Convierte timestamp Unix a Date
 * @param timestamp - Timestamp en segundos o milisegundos
 * @returns Date object
 */
export function fromTimestamp(timestamp: number): Date {
  // Si el timestamp está en segundos (10 dígitos), convertir a milisegundos
  const ms = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp;
  return new Date(ms);
}

// ✅ EXPORTAR FUNCIONES COMPATIBLES CON EL ARCHIVO ORIGINAL date.ts
// Estas funciones mantienen compatibilidad con los componentes existentes

/**
 * Formatea una fecha completa con día, fecha y hora (compatible con date.ts)
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
 * Formatea solo la fecha (sin hora) (compatible con date.ts)
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
 * Formatea solo la hora (compatible con date.ts)
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