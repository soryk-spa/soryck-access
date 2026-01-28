'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import SeatMapViewer from './seat-map-viewer'

interface Section {
  id: string
  name: string
  basePrice?: number
  hasSeats: boolean
  seats?: EventSeat[]
}

interface EventSeat {
  id: string
  row: string
  number: string
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED'
}

interface Event {
  id: string
  title: string
  location: string
  startDate: string
  hasSeatingPlan?: boolean
}

interface SelectedSeat {
  id: string
  sectionId?: string
  sectionName?: string
  row?: string
  number?: string
  price?: number
}

interface PurchaseFlowProps {
  isOpen: boolean
  onClose: () => void
  event: Event
  sections: Section[]
  eventId: string
}

interface BuyerInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export default function PurchaseFlow({ event, sections, onClose }: PurchaseFlowProps) {
  const [step, setStep] = useState(1)
  const [selectedSeats, setSelectedSeats] = useState<string[]>([])
  const [selectedSeatsDetails, setSelectedSeatsDetails] = useState<SelectedSeat[]>([])
  const [buyerInfo, setBuyerInfo] = useState<BuyerInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(300) 
  const [reservedSeats] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleTimeExpired = useCallback(async () => {
    if (sessionId) {
      await fetch(`/api/events/${event.id}/reservations?sessionId=${sessionId}`, {
        method: 'DELETE'
      })
      setSessionId(null)
      setSelectedSeats([])
      setSelectedSeatsDetails([])
      alert('La reserva ha expirado. Por favor, selecciona nuevos asientos.')
      setStep(1)
    }
  }, [sessionId, event.id])

  
  useEffect(() => {
    if (sessionId && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
      return () => clearInterval(timer)
    } else if (timeLeft === 0) {
      handleTimeExpired()
    }
  }, [sessionId, timeLeft, handleTimeExpired])

  const handleSeatSelection = async (seatIds: string[], detailedSeats: SelectedSeat[]) => {
    setSelectedSeats(seatIds)
    setSelectedSeatsDetails(detailedSeats)

    if (seatIds.length > 0) {
      try {
        
        if (sessionId) {
          await fetch(`/api/events/${event.id}/reservations?sessionId=${sessionId}`, {
            method: 'DELETE'
          })
        }

        
        const response = await fetch(`/api/events/${event.id}/reservations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ seatIds })
        })

        if (response.ok) {
          const { sessionId: newSessionId } = await response.json()
          setSessionId(newSessionId)
          setTimeLeft(300) 
        } else {
          const error = await response.json()
          if (response.status === 400 && error.error.includes('ya están reservados')) {
            alert('⚠️ Algunos asientos ya han sido seleccionados por otro usuario. Por favor, elige otros asientos disponibles.')
            
            setSelectedSeats([])
            setSelectedSeatsDetails([])
          } else {
            alert(`Error: ${error.error || 'No se pudo reservar los asientos'}`)
          }
        }
      } catch (error) {
        console.error('Error reserving seats:', error)
        alert('Error de conexión. Por favor, intenta nuevamente.')
      }
    } else if (sessionId) {
      
      await fetch(`/api/events/${event.id}/reservations?sessionId=${sessionId}`, {
        method: 'DELETE'
      })
      setSessionId(null)
    }
  }

  const getTotalAmount = () => {
    return selectedSeatsDetails.reduce((total, seat) => total + (seat.price || 0), 0)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleContinue = () => {
    if (step === 1 && selectedSeats.length > 0) {
      setStep(2)
    } else if (step === 2 && isFormValid()) {
      setStep(3)
    }
  }

  const isFormValid = () => {
    return buyerInfo.firstName && buyerInfo.lastName && buyerInfo.email && buyerInfo.phone
  }

  const handleConfirmPurchase = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/events/${event.id}/purchase/create-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          buyerInfo,
          seatIds: selectedSeats,
          selectedSeats: selectedSeatsDetails,
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Si es gratis, la compra ya está confirmada
        if (data.isFree) {
          alert('¡Compra realizada exitosamente! Recibirás los tickets por email.')
          onClose()
          return
        }
        
        // Si tiene que pagar, redirigir a Transbank
        if (data.paymentUrl) {
          // Redirigir al usuario a Transbank WebPay
          window.location.href = data.paymentUrl
        } else {
          alert('Error: No se pudo generar la URL de pago')
        }
      } else {
        const error = await response.json()
        alert(error.error || 'Error al procesar la compra')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error confirming purchase:', error)
      alert('Error al procesar la compra')
      setIsLoading(false)
    }
    // No ponemos finally aquí porque si redirige a Transbank, el componente se desmonta
  }

  const handleInputChange = (field: keyof BuyerInfo, value: string) => {
    setBuyerInfo(prev => ({ ...prev, [field]: value }))
  }

  const getProgressValue = () => {
    return (step / 3) * 100
  }

  const stepTitles = {
    1: 'Seleccionar Asientos',
    2: 'Información del Comprador',
    3: 'Confirmar Compra'
  }

  const sectionsWithSeats = sections.filter(s => s.hasSeats)
  const hasSeatingPlan = sectionsWithSeats.length > 0

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold">{stepTitles[step as keyof typeof stepTitles]}</h2>
              <p className="text-blue-100 text-sm">{event.title}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-full"
            >
              ✕
            </Button>
          </div>
          
          {}
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-blue-100">
              <span>Progreso del proceso</span>
              <span>Paso {step} de 3</span>
            </div>
            <div className="w-full bg-blue-400/30 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${getProgressValue()}%` }}
              />
            </div>
            
            {}
            <div className="flex justify-between mt-4">
              {[1, 2, 3].map((stepNum) => (
                <div key={stepNum} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${stepNum <= step 
                      ? 'bg-white text-blue-600' 
                      : 'bg-blue-400/30 text-blue-200'
                    }
                  `}>
                    {stepNum < step ? '✓' : stepNum}
                  </div>
                  <span className={`ml-2 text-sm ${stepNum <= step ? 'text-white' : 'text-blue-200'}`}>
                    {stepNum === 1 && 'Asientos'}
                    {stepNum === 2 && 'Datos'}
                    {stepNum === 3 && 'Pago'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {}
          {sessionId && (
            <div className="mt-4 flex justify-between items-center p-3 bg-white/10 rounded-lg backdrop-blur-sm">
              <span className="text-sm font-medium">⏱️ Tiempo restante para completar:</span>
              <Badge 
                variant={timeLeft < 60 ? "destructive" : "secondary"}
                className={`
                  ${timeLeft < 60 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-white/20 text-white'
                  }
                `}
              >
                {formatTime(timeLeft)}
              </Badge>
            </div>
          )}
        </div>

        {}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    🎫 Selecciona tus asientos preferidos
                  </h3>
                  <p className="text-gray-600">Haz clic en los asientos disponibles para seleccionarlos</p>
                </div>

                {hasSeatingPlan ? (
                  <SeatMapViewer
                    sections={sectionsWithSeats}
                    onSeatSelect={handleSeatSelection}
                    reservedSeats={reservedSeats}
                  />
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="max-w-md mx-auto">
                      <div className="text-4xl mb-4">🎪</div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Evento de Admisión General</h3>
                      <p className="text-gray-600">Este evento no tiene asientos asignados</p>
                      <p className="text-sm text-gray-500">La entrada te permitirá acceso a cualquier área disponible</p>
                    </div>
                  </div>
                )}

                {selectedSeats.length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                        ✓
                      </div>
                      <h3 className="font-semibold text-gray-800">Asientos Seleccionados</h3>
                    </div>
                    <div className="space-y-3">
                      {selectedSeatsDetails.map((seat, index) => (
                        <div key={index} className="flex justify-between items-center bg-white rounded-lg p-3 shadow-sm">
                          <div className="flex items-center">
                            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium mr-3">
                              {seat.sectionName}
                            </div>
                            <span className="text-gray-700">
                              Fila {seat.row}, Asiento {seat.number}
                            </span>
                          </div>
                          <span className="font-semibold text-green-600">
                            ${seat.price?.toLocaleString()} CLP
                          </span>
                        </div>
                      ))}
                      <div className="border-t pt-3 mt-3">
                        <div className="flex justify-between items-center text-lg font-bold">
                          <span className="text-gray-800">Total:</span>
                          <span className="text-green-600">${getTotalAmount().toLocaleString()} CLP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    👤 Información del Comprador
                  </h3>
                  <p className="text-gray-600">Necesitamos estos datos para enviarte tus tickets</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                        Nombre *
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="Ej: Juan"
                        value={buyerInfo.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                        Apellido *
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Ej: Pérez"
                        value={buyerInfo.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Correo Electrónico *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={buyerInfo.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                    <p className="text-xs text-gray-500">Aquí recibirás tus tickets digitales</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                      Teléfono *
                    </Label>
                    <Input
                      id="phone"
                      placeholder="+56 9 1234 5678"
                      value={buyerInfo.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="text-center mb-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    🛡️ Confirmar Compra
                  </h3>
                  <p className="text-gray-600">Revisa que toda la información sea correcta antes de proceder</p>
                </div>

                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                  <div className="grid md:grid-cols-2 gap-8">
                    {}
                    <div className="space-y-4">
                      <div className="flex items-center mb-4">
                        <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                          🎭
                        </div>
                        <h4 className="font-semibold text-gray-800">Detalles del Evento</h4>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <h5 className="font-medium text-gray-800">{event.title}</h5>
                        <p className="text-sm text-gray-600 mt-1">📍 {event.location}</p>
                        <p className="text-sm text-gray-600">📅 {new Date(event.startDate).toLocaleDateString('es-CL')}</p>
                      </div>
                    </div>

                    {}
                    <div className="space-y-4">
                      <div className="flex items-center mb-4">
                        <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                          👤
                        </div>
                        <h4 className="font-semibold text-gray-800">Información del Comprador</h4>
                      </div>
                      <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="font-medium text-gray-800">
                          {buyerInfo.firstName} {buyerInfo.lastName}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">📧 {buyerInfo.email}</p>
                        <p className="text-sm text-gray-600">📱 {buyerInfo.phone}</p>
                      </div>
                    </div>
                  </div>

                  {}
                  <div className="mt-8">
                    <div className="flex items-center mb-4">
                      <div className="bg-purple-500 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                        🎫
                      </div>
                      <h4 className="font-semibold text-gray-800">Asientos Seleccionados</h4>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="space-y-3">
                        {selectedSeatsDetails.map((seat, index) => (
                          <div key={index} className="flex justify-between items-center border-b border-gray-100 last:border-0 pb-2 last:pb-0">
                            <div className="flex items-center">
                              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium mr-3">
                                {seat.sectionName}
                              </div>
                              <span className="text-sm text-gray-700">
                                Fila {seat.row}, Asiento {seat.number}
                              </span>
                            </div>
                            <span className="font-medium text-gray-800">
                              ${seat.price?.toLocaleString()} CLP
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-800">Total a Pagar:</span>
                          <span className="text-2xl font-bold text-green-600">
                            ${getTotalAmount().toLocaleString()} CLP
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="border-t bg-gray-50 p-6 flex justify-between items-center">
          {step > 1 ? (
            <Button 
              variant="outline" 
              onClick={() => setStep(step - 1)}
              className="flex items-center space-x-2"
            >
              <span>←</span>
              <span>Anterior</span>
            </Button>
          ) : (
            <div></div>
          )}
          
          <div className="flex items-center space-x-4">
            {step < 3 ? (
              <Button 
                onClick={handleContinue}
                disabled={
                  (step === 1 && selectedSeats.length === 0) ||
                  (step === 2 && !isFormValid())
                }
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 flex items-center space-x-2"
              >
                <span>Continuar</span>
                <span>→</span>
              </Button>
            ) : (
              <Button 
                onClick={handleConfirmPurchase}
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Procesando...</span>
                  </>
                ) : (
                  <>
                    <span>🔒</span>
                    <span>Confirmar Compra</span>
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}