'use client'

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { CheckoutData, CheckoutStepId, SelectedSeat, TicketDetails, BuyerInfo } from '@/types/checkout'

interface CheckoutContextType {
  // Estado
  currentStep: CheckoutStepId
  checkoutData: CheckoutData
  timeRemaining: number
  
  // Acciones de navegación
  goToNextStep: () => void
  goToPreviousStep: () => void
  goToStep: (step: CheckoutStepId) => void
  
  // Acciones de datos
  updateSeats: (seats: SelectedSeat[]) => void
  updateTicketDetails: (details: TicketDetails) => void
  updateBuyerInfo: (info: BuyerInfo) => void
  setSessionId: (sessionId: string) => void
  setReservationExpiry: (expiry: Date) => void
  
  // Validaciones
  canProceedToNextStep: () => boolean
  resetCheckout: () => void
  
  // Cálculos
  getTotalAmount: () => number
  getTotalSeats: () => number
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined)

interface CheckoutProviderProps {
  children: ReactNode
  eventId: string
  initialStep?: CheckoutStepId
}

export function CheckoutProvider({ children, eventId, initialStep = 1 }: CheckoutProviderProps) {
  const [currentStep, setCurrentStep] = useState<CheckoutStepId>(initialStep)
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutos
  
  const [checkoutData, setCheckoutData] = useState<CheckoutData>({
    eventId,
    seats: [],
    ticketDetails: {
      quantity: 1,
    },
    buyerInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
  })

  // Timer de reserva
  useEffect(() => {
    if (!checkoutData.sessionId || !checkoutData.reservationExpiry) {
      return
    }

    const interval = setInterval(() => {
      const now = new Date()
      if (!checkoutData.reservationExpiry) return
      
      const expiry = new Date(checkoutData.reservationExpiry)
      const remaining = Math.floor((expiry.getTime() - now.getTime()) / 1000)
      
      if (remaining <= 0) {
        setTimeRemaining(0)
        // Aquí podrías agregar lógica para liberar los asientos
      } else {
        setTimeRemaining(remaining)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [checkoutData.sessionId, checkoutData.reservationExpiry])

  // Validaciones por paso
  const validateStep1 = useCallback(() => {
    return checkoutData.seats.length > 0
  }, [checkoutData.seats])

  const validateStep2 = useCallback(() => {
    return checkoutData.ticketDetails.quantity > 0
  }, [checkoutData.ticketDetails])

  const validateStep3 = useCallback(() => {
    const { firstName, lastName, email, phone } = checkoutData.buyerInfo
    return !!(firstName && lastName && email && phone)
  }, [checkoutData.buyerInfo])

  const canProceedToNextStep = useCallback(() => {
    switch (currentStep) {
      case 1:
        return validateStep1()
      case 2:
        return validateStep2()
      case 3:
        return validateStep3()
      case 4:
        return true
      default:
        return false
    }
  }, [currentStep, validateStep1, validateStep2, validateStep3])

  // Navegación
  const goToNextStep = useCallback(() => {
    if (currentStep < 4 && canProceedToNextStep()) {
      setCurrentStep((prev) => (prev + 1) as CheckoutStepId)
    }
  }, [currentStep, canProceedToNextStep])

  const goToPreviousStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as CheckoutStepId)
    }
  }, [currentStep])

  const goToStep = useCallback((step: CheckoutStepId) => {
    if (step >= 1 && step <= 4) {
      setCurrentStep(step)
    }
  }, [])

  // Actualización de datos
  const updateSeats = useCallback((seats: SelectedSeat[]) => {
    setCheckoutData((prev) => ({ ...prev, seats }))
  }, [])

  const updateTicketDetails = useCallback((details: TicketDetails) => {
    setCheckoutData((prev) => ({ ...prev, ticketDetails: details }))
  }, [])

  const updateBuyerInfo = useCallback((info: BuyerInfo) => {
    setCheckoutData((prev) => ({ ...prev, buyerInfo: info }))
  }, [])

  const setSessionId = useCallback((sessionId: string) => {
    setCheckoutData((prev) => ({ ...prev, sessionId }))
  }, [])

  const setReservationExpiry = useCallback((expiry: Date) => {
    setCheckoutData((prev) => ({ ...prev, reservationExpiry: expiry }))
  }, [])

  // Cálculos
  const getTotalAmount = useCallback(() => {
    return checkoutData.seats.reduce((sum, seat) => sum + seat.finalPrice, 0)
  }, [checkoutData.seats])

  const getTotalSeats = useCallback(() => {
    return checkoutData.seats.length
  }, [checkoutData.seats])

  const resetCheckout = useCallback(() => {
    setCheckoutData({
      eventId,
      seats: [],
      ticketDetails: { quantity: 1 },
      buyerInfo: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
      },
    })
    setCurrentStep(1)
    setTimeRemaining(300)
  }, [eventId])

  const value: CheckoutContextType = {
    currentStep,
    checkoutData,
    timeRemaining,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    updateSeats,
    updateTicketDetails,
    updateBuyerInfo,
    setSessionId,
    setReservationExpiry,
    canProceedToNextStep,
    resetCheckout,
    getTotalAmount,
    getTotalSeats,
  }

  return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>
}

export function useCheckout() {
  const context = useContext(CheckoutContext)
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider')
  }
  return context
}
