"use client"

import { useSearchParams } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function TransbankRedirectPage() {
  const searchParams = useSearchParams()
  const buttonRef = useRef<HTMLButtonElement>(null)

  const token = searchParams.get('token')
  const url = searchParams.get('url')

  useEffect(() => {
    const timer = setTimeout(() => {
      if (buttonRef.current) {
        buttonRef.current.click()
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  if (!token || !url) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Error: Faltan parámetros para la redirección a Transbank.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="text-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <h2 className="mt-4 text-xl font-semibold text-gray-700 dark:text-gray-200">
          Finalizando tu compra
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Serás redirigido a Webpay para completar el pago.
        </p>

        <form method="POST" action={url}>
          <input type="hidden" name="token_ws" value={token} />
          <button
            ref={buttonRef}
            type="submit"
            className="mt-6 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
          >
            Continuar a Webpay
          </button>
        </form>
         <p className="text-xs text-gray-400 mt-2">
          Si no eres redirigido automáticamente, por favor haz clic en el botón.
        </p>
      </div>
    </div>
  )
}