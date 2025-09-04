"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, Suspense } from "react";

function RedirectComponent() {
  const searchParams = useSearchParams();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const token = searchParams.get("token");
  const url = searchParams.get("url");
  const amount = searchParams.get("amount");
  const promoCode = searchParams.get("promoCode");
  const discount = searchParams.get("discount");

  useEffect(() => {
    const timer = setTimeout(() => {
      if (buttonRef.current) {
        buttonRef.current.click();
      }
    }, 1500); 

    return () => clearTimeout(timer);
  }, []);

  if (!token || !url) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">
          Error: Faltan parámetros para la redirección.
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200 mb-2">
            Finalizando tu compra
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Serás redirigido a Webpay para completar el pago.
          </p>
          
          {}
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg mb-4">
            {amount && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-300">Total a pagar:</span>
                <span className="font-semibold text-lg">
                  ${parseInt(amount).toLocaleString('es-CL')} CLP
                </span>
              </div>
            )}
            
            {promoCode && discount && (
              <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-green-600 dark:text-green-400">Descuento aplicado ({promoCode}):</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">
                    -${parseInt(discount).toLocaleString('es-CL')} CLP
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <form method="POST" action={url}>
          <input type="hidden" name="token_ws" value={token} />
          <button
            ref={buttonRef}
            type="submit"
            className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors"
          >
            Continuar a Webpay
          </button>
        </form>
        
        <p className="text-xs text-gray-400 mt-3 text-center">
          Si no eres redirigido automáticamente, haz clic en el botón.
        </p>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <p className="mt-4 text-gray-500">Preparando redirección segura...</p>
    </div>
  );
}

export default function TransbankRedirectPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Suspense fallback={<LoadingFallback />}>
        <RedirectComponent />
      </Suspense>
    </div>
  );
}
