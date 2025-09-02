"use client";

import { usePathname } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import RouteProtection from "@/components/route-protection";

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Rutas que requieren rol de organizador
  const organizerRoutes = [
    "/dashboard/events",
    "/dashboard/promo-codes", 
    "/dashboard/organizer-profile",
    "/dashboard/organizer"
  ];

  // Verificar si la ruta actual requiere permisos de organizador
  const requiresOrganizer = organizerRoutes.some(route => 
    pathname.startsWith(route)
  );

  return (
    <DashboardLayout 
      title="Dashboard del Organizador"
      showSearch={true}
    >
      {requiresOrganizer ? (
        <RouteProtection requiredRole="ORGANIZER">
          {children}
        </RouteProtection>
      ) : (
        children
      )}
    </DashboardLayout>
  );
}
