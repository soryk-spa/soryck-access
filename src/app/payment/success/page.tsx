import { Suspense } from "react";
import PaymentSuccessClient from "@/components/payment-success-client";

// Interfaz corregida
interface SuccessPageProps {
  searchParams: { orderId?: string };
}

function LoadingSkeleton() {
  // ... (el contenido no cambia)
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="animate-pulse space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4"></div>
          <div className="h-8 bg-muted rounded w-48 mx-auto mb-2"></div>
          <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded"></div>
        </div>
        <div className="space-y-2">
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-10 bg-muted rounded"></div>
        </div>
      </div>
    </div>
  );
}

export default async function PaymentSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const orderId = searchParams.orderId; // Corregido

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PaymentSuccessClient orderId={orderId} />
    </Suspense>
  );
}
