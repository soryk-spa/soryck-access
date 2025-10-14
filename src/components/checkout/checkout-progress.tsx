'use client'

import { CheckoutStepId } from '@/types/checkout'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckoutProgressProps {
  currentStep: CheckoutStepId
  onStepClick?: (step: CheckoutStepId) => void
  className?: string
}

const steps = [
  { id: 1 as CheckoutStepId, title: 'Asientos', icon: '🪑', mobileTitle: 'Asientos' },
  { id: 2 as CheckoutStepId, title: 'Detalles', icon: '🎫', mobileTitle: 'Detalles' },
  { id: 3 as CheckoutStepId, title: 'Datos', icon: '👤', mobileTitle: 'Datos' },
  { id: 4 as CheckoutStepId, title: 'Pago', icon: '💳', mobileTitle: 'Pago' },
]

export function CheckoutProgress({ currentStep, onStepClick, className }: CheckoutProgressProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Desktop Progress */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id
          const isCurrent = currentStep === step.id
          const isUpcoming = currentStep < step.id

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <button
                onClick={() => onStepClick?.(step.id)}
                disabled={isUpcoming}
                className={cn(
                  'flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300',
                  'focus:outline-none focus:ring-2 focus:ring-offset-2',
                  {
                    'bg-gradient-to-r from-blue-600 to-purple-600 border-transparent text-white shadow-lg':
                      isCurrent,
                    'bg-green-500 border-green-500 text-white': isCompleted,
                    'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed': isUpcoming,
                    'hover:shadow-md cursor-pointer': !isUpcoming,
                  }
                )}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <span className="text-2xl">{step.icon}</span>
                )}
              </button>

              {/* Step Label */}
              <div className="ml-3 flex-shrink-0">
                <p
                  className={cn('text-sm font-medium', {
                    'text-blue-600': isCurrent,
                    'text-gray-900': isCompleted,
                    'text-gray-400': isUpcoming,
                  })}
                >
                  {step.title}
                </p>
                <p className="text-xs text-gray-500">Paso {step.id} de 4</p>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-4">
                  <div
                    className={cn('h-1 rounded-full transition-all duration-300', {
                      'bg-gradient-to-r from-blue-600 to-purple-600': isCompleted,
                      'bg-gray-200': !isCompleted,
                    })}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile Progress */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          {steps.map((step) => {
            const isCompleted = currentStep > step.id
            const isCurrent = currentStep === step.id

            return (
              <div key={step.id} className="flex flex-col items-center">
                <button
                  onClick={() => onStepClick?.(step.id)}
                  disabled={currentStep < step.id}
                  className={cn(
                    'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all',
                    {
                      'bg-gradient-to-r from-blue-600 to-purple-600 border-transparent text-white':
                        isCurrent,
                      'bg-green-500 border-green-500 text-white': isCompleted,
                      'bg-gray-100 border-gray-300 text-gray-400': !isCurrent && !isCompleted,
                    }
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-lg">{step.icon}</span>
                  )}
                </button>
                <span
                  className={cn('text-xs mt-1', {
                    'text-blue-600 font-medium': isCurrent,
                    'text-gray-600': !isCurrent,
                  })}
                >
                  {step.mobileTitle}
                </span>
              </div>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}
