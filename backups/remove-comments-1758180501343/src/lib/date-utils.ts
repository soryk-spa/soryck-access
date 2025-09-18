



export function parseChileDatetime(datetimeLocal: string): Date {
  if (!datetimeLocal) {
    throw new Error('Fecha requerida');
  }

  // If string is like 'YYYY-MM-DDTHH:mm' (no timezone), treat it as Chile local time.
  const tzLessPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
  if (tzLessPattern.test(datetimeLocal)) {
    // For timezone-less strings, append Chile timezone offset
    // Chile is UTC-3 (sometimes UTC-4 during DST, but let's use -03:00 for now)
    const withTimezone = `${datetimeLocal}:00-03:00`;
    const date = new Date(withTimezone);
    
    if (isNaN(date.getTime())) {
      throw new Error('Fecha inválida');
    }
    return date;
  }

  const date = new Date(datetimeLocal);
  if (isNaN(date.getTime())) {
    throw new Error('Fecha inválida');
  }

  return date;
}


export function formatToChileDatetimeLocal(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }

  
  const chileDate = new Date(dateObj.toLocaleString("en-US", { timeZone: "America/Santiago" }));
  
  const year = chileDate.getFullYear();
  const month = String(chileDate.getMonth() + 1).padStart(2, '0');
  const day = String(chileDate.getDate()).padStart(2, '0');
  const hours = String(chileDate.getHours()).padStart(2, '0');
  const minutes = String(chileDate.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}


export function toChileISOString(date: Date): string {
  return date.toISOString();
}


export function isFutureDate(date: Date): boolean {
  const now = new Date();
  return date > now;
}


export function isValidDateRange(startDate: Date, endDate: Date): boolean {
  return endDate > startDate;
}


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


export function formatDisplayTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  });
}


export function getCurrentChileDate(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/Santiago" }));
}


export function fromTimestamp(timestamp: number): Date {
  
  const ms = timestamp.toString().length === 10 ? timestamp * 1000 : timestamp;
  return new Date(ms);
}





export const formatFullDateTime = (date: Date | string): string => {
  // If the input is a string without timezone info (e.g. '2025-12-01T12:00'),
  // parse it as Chile local time to avoid unintended UTC shifts when the server runs in UTC.
  const dateObj = typeof date === 'string' ? parseChileDatetime(date) : date;
  
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


export const formatTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  });
};


export const formatShortDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit", 
    year: "numeric",
    timeZone: "America/Santiago",
  });
};


export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return dateObj.toDateString() === today.toDateString();
};


export const isTomorrow = (date: Date | string): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return dateObj.toDateString() === tomorrow.toDateString();
};


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