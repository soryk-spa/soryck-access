/**
 * Utilidades centralizadas para formateo y operaciones comunes
 * Elimina duplicaciones y proporciona consistencia
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ============================================================================
// UTILIDADES DE ESTILO
// ============================================================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ============================================================================
// UTILIDADES DE FORMATEO
// ============================================================================

/**
 * Formatea un precio con la moneda especificada
 */
export function formatCurrency(
  amount: number, 
  currency: string = 'CLP'
): string {
  if (amount === 0) return 'Gratis';
  
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Formatea un rango de precios
 */
export function formatPriceRange(
  min: number, 
  max: number, 
  currency: string = 'CLP'
): string {
  if (min === 0 && max === 0) return "Gratis";
  if (min === max) return formatCurrency(min, currency);
  return `Desde ${formatCurrency(min, currency)}`;
}

/**
 * Formatea números grandes con sufijos (K, M, B)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + 'B';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

/**
 * Formatea porcentajes
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// ============================================================================
// UTILIDADES DE FECHA
// ============================================================================

/**
 * Formatea una fecha para mostrar en la UI
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
 * Formatea una fecha con hora
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
 */
export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  });
}

/**
 * Formatea fecha corta (dd/mm/yyyy)
 */
export function formatShortDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Santiago",
  });
}

/**
 * Obtiene descripción relativa de fecha (Hoy, Mañana, etc.)
 */
export function getRelativeDateDescription(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  // Verificar si es hoy
  if (dateObj.toDateString() === now.toDateString()) return "Hoy";
  
  // Verificar si es mañana
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateObj.toDateString() === tomorrow.toDateString()) return "Mañana";
  
  // Calcular diferencia en días
  const diffTime = dateObj.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return diffDays === -1 ? "Ayer" : `Hace ${Math.abs(diffDays)} días`;
  } else if (diffDays <= 7) {
    return `En ${diffDays} días`;
  } else {
    return formatDisplayDate(dateObj);
  }
}

// ============================================================================
// UTILIDADES DE VALIDACIÓN
// ============================================================================

/**
 * Valida si una fecha es futura
 */
export function isFutureDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
}

/**
 * Valida email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida que una URL sea válida
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// UTILIDADES DE TEXTO
// ============================================================================

/**
 * Capitaliza la primera letra de una cadena
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convierte texto a slug (URL-friendly)
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special chars
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
}

/**
 * Trunca texto con elipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

/**
 * Obtiene iniciales de un nombre
 */
export function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.charAt(0).toUpperCase() || '';
  const last = lastName?.charAt(0).toUpperCase() || '';
  return (first + last) || '?';
}

/**
 * Formatea nombre completo
 */
export function formatFullName(firstName?: string | null, lastName?: string | null): string {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'Usuario';
}

// ============================================================================
// UTILIDADES DE ARRAYS Y OBJETOS
// ============================================================================

/**
 * Agrupa array por una propiedad
 */
export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    return {
      ...groups,
      [group]: [...(groups[group] || []), item]
    };
  }, {} as Record<string, T[]>);
}

/**
 * Ordena array por una propiedad
 */
export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Filtra valores únicos de un array
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

// ============================================================================
// UTILIDADES DE PROMOCIONES
// ============================================================================

/**
 * Formatea el descuento de un código promocional
 */
export function formatDiscount(type: string, value: number): string {
  switch (type) {
    case "PERCENTAGE":
      return `${value}%`;
    case "FIXED_AMOUNT":
      return formatCurrency(value);
    case "FREE":
      return "Gratis";
    default:
      return value.toString();
  }
}

/**
 * Calcula el porcentaje de uso de un código promocional
 */
export function calculateUsagePercentage(used: number, limit?: number): number {
  if (!limit) return 0;
  return Math.min((used / limit) * 100, 100);
}

// ============================================================================
// UTILIDADES DE ESTADO
// ============================================================================

/**
 * Obtiene la configuración de color para un estado
 */
export function getStatusConfig(status: string): {
  label: string;
  color: string;
  variant: "default" | "secondary" | "destructive" | "outline";
} {
  const configs = {
    ACTIVE: { label: "Activo", color: "bg-green-100 text-green-800", variant: "default" as const },
    INACTIVE: { label: "Inactivo", color: "bg-gray-100 text-gray-800", variant: "secondary" as const },
    EXPIRED: { label: "Expirado", color: "bg-red-100 text-red-800", variant: "destructive" as const },
    USED_UP: { label: "Agotado", color: "bg-orange-100 text-orange-800", variant: "outline" as const },
    PENDING: { label: "Pendiente", color: "bg-yellow-100 text-yellow-800", variant: "outline" as const },
    PAID: { label: "Pagado", color: "bg-green-100 text-green-800", variant: "default" as const },
    FAILED: { label: "Fallido", color: "bg-red-100 text-red-800", variant: "destructive" as const },
    CANCELLED: { label: "Cancelado", color: "bg-gray-100 text-gray-800", variant: "secondary" as const },
    REFUNDED: { label: "Reembolsado", color: "bg-blue-100 text-blue-800", variant: "outline" as const },
  };

  return configs[status as keyof typeof configs] || {
    label: status,
    color: "bg-gray-100 text-gray-800",
    variant: "secondary" as const
  };
}

// ============================================================================
// UTILIDADES DE DEBOUNCE
// ============================================================================

/**
 * Función de debounce para optimizar búsquedas
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// ============================================================================
// UTILIDADES DE ARCHIVOS
// ============================================================================

/**
 * Convierte bytes a formato legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Valida tipo de archivo por extensión
 */
export function isValidImageFile(filename: string): boolean {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return validExtensions.includes(extension);
}
