"use client";

import { DashboardPageLayout } from "@/components/dashboard-page-layout";
import RoleRequestsManagement from "@/components/role-requests-management";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  UserCheck,
  Mail,
  Clock,
  Target,
  Activity,
  AlertCircle,
} from "lucide-react";
import { UserRole } from "@prisma/client";

interface RoleRequest {
  id: string;
  userId: string;
  currentRole: UserRole;
  requestedRole: UserRole;
  message: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
    createdAt: string;
  };
}

interface RoleRequestsPageClientProps {
  totalRequests: number;
  pendingCount: number;
  responseRate: number;
  serializedRequests: RoleRequest[];
  currentUserRole: UserRole;
}

export function RoleRequestsPageClient({
  totalRequests,
  pendingCount,
  responseRate,
  serializedRequests,
  currentUserRole,
}: RoleRequestsPageClientProps) {
  // Configuración del header para DashboardPageLayout
  const headerConfig = {
    title: "Gestión de Solicitudes de Rol",
    description: "Administra las solicitudes de cambio de rol de usuarios",
    backgroundIcon: UserCheck,
    gradient: "from-indigo-600 to-purple-600",
    badge: {
      label: "Admin",
      variant: "secondary" as const,
    },
    stats: [
      {
        icon: Mail,
        label: "Total Solicitudes",
        value: totalRequests.toString(),
      },
      {
        icon: Clock,
        label: "Pendientes",
        value: pendingCount.toString(),
      },
      {
        icon: Target,
        label: "Tasa Respuesta",
        value: `${responseRate.toFixed(1)}%`,
      },
      {
        icon: Activity,
        label: "Estado",
        value: "Sistema Activo",
      },
    ],
  };

  return (
    <DashboardPageLayout header={headerConfig}>
      <div className="space-y-8">
        {/* Alertas importantes */}
        {pendingCount > 0 && (
          <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800 dark:text-amber-200">
              <strong>Atención:</strong> Hay {pendingCount} solicitud
              {pendingCount > 1 ? "es" : ""} pendiente
              {pendingCount > 1 ? "s" : ""} de revisión que requieren tu
              atención.
            </AlertDescription>
          </Alert>
        )}

        {/* Componente de gestión */}
        <RoleRequestsManagement
          initialRequests={serializedRequests}
          currentUserRole={currentUserRole}
        />
      </div>
    </DashboardPageLayout>
  );
}
