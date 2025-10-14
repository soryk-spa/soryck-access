'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckoutProvider, useCheckout } from './checkout-context'
import { CheckoutProgress } from './checkout-progress'
import { CheckoutSummarySidebar } from './checkout-summary-sidebar'
import { Step1SeatSelection } from './steps/step1-seat-selection'
import { Step2TicketDetails } from './steps/step2-ticket-details'
import { Step3BuyerInfo } from './steps/step3-buyer-info'
import { Step4PaymentReview } from './steps/step4-payment-review'
import { ArrowLeft, ArrowRight } from 'lucide-react'

interface CheckoutWizardProps {
  eventId: string
  eventTitle: string
  eventLocation?: string
  eventDate?: string
  eventImageUrl?: string
}

function CheckoutWizardContent({
  eventId,
  eventTitle,
  eventLocation,
  eventDate,
  eventImageUrl,
}: Omit<CheckoutWizardProps, 'eventId'> & { eventId: string }) {
  const {
    currentStep,
    goToNextStep,
    goToPreviousStep,
    canProceedToNextStep,
    getTotalSeats,
  } = useCheckout()

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1SeatSelection eventId={eventId} />
      case 2:
        return <Step2TicketDetails eventId={eventId} />
      case 3:
        return <Step3BuyerInfo />
      case 4:
        return (
          <Step4PaymentReview
            eventId={eventId}
            eventTitle={eventTitle}
            eventLocation={eventLocation}
            eventDate={eventDate}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <CheckoutProgress currentStep={currentStep} />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Steps */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step Content */}
            {renderStep()}

            {/* Navigation Buttons */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  {/* Back Button */}
                  <Button
                    variant="outline"
                    onClick={goToPreviousStep}
                    disabled={currentStep === 1}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Anterior
                  </Button>

                  {/* Next/Finish Button */}
                  <Button
                    onClick={goToNextStep}
                    disabled={!canProceedToNextStep()}
                    className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {currentStep === 4 ? 'Finalizar Compra' : 'Siguiente'}
                    {currentStep < 4 && <ArrowRight className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Helper Text */}
                {!canProceedToNextStep() && (
                  <p className="text-center text-sm text-gray-500 mt-4">
                    {currentStep === 1 && getTotalSeats() === 0 && '⚠️ Selecciona al menos un asiento para continuar'}
                    {currentStep === 2 && 'Completa los detalles del ticket'}
                    {currentStep === 3 && 'Completa tus datos personales'}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Summary */}
          <div className="lg:col-span-1">
            <CheckoutSummarySidebar
              eventTitle={eventTitle}
              eventLocation={eventLocation || ''}
              eventDate={eventDate || ''}
              eventImage={eventImageUrl}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export function CheckoutWizard({
  eventId,
  eventTitle,
  eventLocation,
  eventDate,
  eventImageUrl,
}: CheckoutWizardProps) {
  return (
    <CheckoutProvider eventId={eventId}>
      <CheckoutWizardContent
        eventId={eventId}
        eventTitle={eventTitle}
        eventLocation={eventLocation}
        eventDate={eventDate}
        eventImageUrl={eventImageUrl}
      />
    </CheckoutProvider>
  )
}
