// Tipos para el flujo de checkout multi-step

export interface SelectedSeat {
  id: string
  sectionId: string
  sectionName: string
  row: string
  number: string
  finalPrice: number
  isAccessible: boolean
}

export interface TicketDetails {
  ticketTypeId?: string
  quantity: number
  promoCode?: string
  discounts?: string[]
}

export interface BuyerInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  documentType?: 'dni' | 'passport' | 'other'
  documentNumber?: string
  notificationPreference?: 'email' | 'whatsapp' | 'both'
}

export interface CheckoutData {
  eventId: string
  seats: SelectedSeat[]
  ticketDetails: TicketDetails
  buyerInfo: BuyerInfo
  sessionId?: string
  reservationExpiry?: Date
}

export interface CheckoutStep {
  id: number
  title: string
  description: string
  icon: string
  isValid: boolean
  isCompleted: boolean
}

export type CheckoutStepId = 1 | 2 | 3 | 4

export interface CheckoutValidation {
  isValid: boolean
  errors: string[]
}
