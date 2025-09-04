

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";





export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}






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


export function formatPriceRange(
  min: number, 
  max: number, 
  currency: string = 'CLP'
): string {
  if (min === 0 && max === 0) return "Gratis";
  if (min === max) return formatCurrency(min, currency);
  return `Desde ${formatCurrency(min, currency)}`;
}


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


export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
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


export function formatTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleTimeString("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Santiago",
  });
}


export function formatShortDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleDateString("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Santiago",
  });
}


export function getRelativeDateDescription(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  
  
  if (dateObj.toDateString() === now.toDateString()) return "Hoy";
  
  
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateObj.toDateString() === tomorrow.toDateString()) return "Mañana";
  
  
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






export function isFutureDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
}


export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}


export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}






export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}


export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') 
    .replace(/[^a-z0-9\s-]/g, '') 
    .replace(/\s+/g, '-') 
    .replace(/-+/g, '-') 
    .trim();
}


export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}


export function getInitials(firstName?: string | null, lastName?: string | null): string {
  const first = firstName?.charAt(0).toUpperCase() || '';
  const last = lastName?.charAt(0).toUpperCase() || '';
  return (first + last) || '?';
}


export function formatFullName(firstName?: string | null, lastName?: string | null): string {
  const parts = [firstName, lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : 'Usuario';
}






export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const group = String(item[key]);
    return {
      ...groups,
      [group]: [...(groups[group] || []), item]
    };
  }, {} as Record<string, T[]>);
}


export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];
    
    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}


export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}






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


export function calculateUsagePercentage(used: number, limit?: number): number {
  if (!limit) return 0;
  return Math.min((used / limit) * 100, 100);
}






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






export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}


export function isValidImageFile(filename: string): boolean {
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return validExtensions.includes(extension);
}
