/**
 * Tipos centralizados para SorykAccess
 * Elimina duplicaciones y proporciona consistencia en toda la aplicación
 */

import { UserRole } from "@prisma/client";

// ============================================================================
// INTERFACES PRINCIPALES
// ============================================================================

export interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketType {
  id: string;
  name: string;
  description?: string;
  price: number;
  capacity: number;
  currency: string;
  eventId: string;
  createdAt?: string;
  updatedAt?: string;
  ticketsGenerated?: number;
  priceTiers?: PriceTier[];
}

export interface PriceTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  ticketTypeId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  imageUrl?: string;
  capacity: number;
  price: number;
  currency: string;
  isFree: boolean;
  isPublished: boolean;
  categoryId: string;
  organizerId: string;
  allowCourtesy?: boolean;
  courtesyLimit?: number | null;
  courtesyValidUntil?: string | null;
  courtesyPriceAfter?: number | null;
  createdAt?: string;
  updatedAt?: string;
  category: Category;
  organizer: User;
  ticketTypes: TicketType[];
  _count: {
    orders: number;
  };
}

export interface PromoCode {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE";
  value: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  currency: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "USED_UP";
  usedCount: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  validFrom: string;
  validUntil?: string;
  eventId: string | null;
  categoryId: string | null;
  ticketTypeId: string | null;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
  event?: Pick<Event, "id" | "title">;
  category?: Pick<Category, "id" | "name">;
  ticketType?: Pick<TicketType, "id" | "name" | "price">;
  _count: { usages: number };
}

export interface Ticket {
  id: string;
  qrCode: string;
  status: "ACTIVE" | "USED" | "CANCELLED";
  usedAt?: string;
  eventId: string;
  userId: string;
  orderId: string;
  ticketTypeId: string;
  createdAt?: string;
  updatedAt?: string;
  event: Event;
  user: User;
  order: Order;
  ticketType: TicketType;
}

export interface Order {
  id: string;
  orderNumber: string;
  totalAmount: number;
  currency: string;
  status: "PENDING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED";
  paymentMethod?: string;
  userId: string;
  eventId: string;
  createdAt?: string;
  updatedAt?: string;
  user: User;
  event: Event;
  tickets: Ticket[];
}

// ============================================================================
// INTERFACES EXTENDIDAS PARA COMPONENTES ESPECÍFICOS
// ============================================================================

export interface EventWithStats extends Event {
  revenue: number;
  occupancy: number;
  ticketsSold: number;
}

export interface UserProfile extends User {
  bio?: string;
  website?: string;
  phone?: string;
  socialLinks?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface PromoCodeWithDetails extends PromoCode {
  totalDiscount: number;
  uniqueUsers: number;
  conversionRate: number;
}

// ============================================================================
// TIPOS PARA FORMULARIOS
// ============================================================================

export interface CreateEventData {
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  location: string;
  imageUrl?: string;
  categoryId: string;
  ticketTypes: Omit<TicketType, "id" | "eventId" | "createdAt" | "updatedAt">[];
}

export interface CreatePromoCodeData {
  code: string;
  name: string;
  description?: string;
  type: PromoCode["type"];
  value: number;
  usageLimit?: number;
  validFrom: string;
  validUntil?: string;
  eventId?: string;
  ticketTypeId?: string;
}

export interface UpdateUserProfileData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  website?: string;
  phone?: string;
  socialLinks?: UserProfile["socialLinks"];
}

// ============================================================================
// TIPOS PARA APIS Y RESPONSES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface EventFilters {
  search?: string;
  categoryId?: string;
  minPrice?: string;
  maxPrice?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  isFree?: boolean;
}

export interface PromoCodeFilters {
  search?: string;
  status?: PromoCode["status"] | "all";
  type?: PromoCode["type"];
  eventId?: string;
}

// ============================================================================
// TIPOS PARA ESTADÍSTICAS Y DASHBOARDS
// ============================================================================

export interface EventStats {
  totalEvents: number;
  publishedEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  averageOccupancy: number;
  popularCategories: Array<{
    category: Category;
    eventCount: number;
    revenue: number;
  }>;
}

export interface PromoCodeStats {
  totalCodes: number;
  activeCodes: number;
  totalUsages: number;
  totalDiscount: number;
  conversionRate: number;
  topCodes: Array<{
    code: PromoCode;
    usages: number;
    discount: number;
  }>;
}

export interface CommissionStats {
  totalCommissions: number;
  monthlyCommissions: number;
  totalRevenue: number;
  commissionRate: number;
  topEvents: Array<{
    id: string;
    title: string;
    revenue: number;
    commission: number;
  }>;
  recentCommissions: Array<{
    id: string;
    eventTitle: string;
    orderNumber: string;
    baseAmount: number;
    commissionAmount: number;
    createdAt: string;
  }>;
}

// ============================================================================
// TIPOS PARA UI Y COMPONENTES
// ============================================================================

export interface TableColumn<T> {
  key: keyof T;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

export interface StatusConfig {
  label: string;
  color: string;
  variant: "default" | "secondary" | "destructive" | "outline";
}

export interface Availability {
  status: "available" | "almost-sold" | "filling-up" | "sold-out";
  text: string;
  color: string;
  available: number;
}

// ============================================================================
// TIPOS PARA PAGOS Y COMISIONES
// ============================================================================

export interface PriceBreakdown {
  basePrice: number;
  commission: number;
  totalPrice: number;
  currency: string;
  originalAmount?: number;
  discountAmount?: number;
  promoCode?: string;
}

export interface PaymentData {
  eventId: string;
  ticketTypeId?: string;
  quantity: number;
  promoCode?: string;
  totalAmount: number;
}

// ============================================================================
// EXPORTS PARA CONVENIENCE
// ============================================================================

export type EventStatus = "draft" | "published" | "completed" | "cancelled";
export type TicketStatus = Ticket["status"];
export type OrderStatus = Order["status"];
export type PromoCodeType = PromoCode["type"];
export type PromoCodeStatus = PromoCode["status"];
