// src/app/admin/role-requests/page.tsx
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import RoleRequestsManagement from "@/components/role-requests-management";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  UserCheck,
  Mail,
  ArrowLeft,
  Shield,
  Activity,
  Filter,
  Download,
  Search,
  Calendar,
  BarChart3,
  Target,
  Award,
  Zap,
  Info,
} from "lucide-react";

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  accentColor = "blue",
  className = "",
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  trend?: string;
  accentColor?: "blue" | "green" | "purple" | "orange" | "red";
  className?: string;
}) => {
  const colorVariants = {
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
      icon: "bg-blue-500 text-white",
      accent: "text-blue-600 dark:text-blue-400",
      trend: "text-blue-500",
    },
    green: {
      bg: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
      icon: "bg-green-500 text-white",
      accent: "text-green-600 dark:text-green-400",
      trend: "text-green-500",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
      icon: "bg-purple-500 text-white",
      accent: "text-purple-600 dark:text-purple-400",
      trend: "text-purple-500",
    },
    orange: {
      bg: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900",
      icon: "bg-orange-500 text-white",
      accent: "text-orange-600 dark:text-orange-400",
      trend: "text-orange-500",
    },
    red: {
      bg: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900",
      icon: "bg-red-500 text-white",
      accent: "text-red-600 dark:text-red-400",
      trend: "text-red-500",
    },
  };

  const colors = colorVariants[accentColor];

  return (
    <Card
      className={`group hover:shadow-xl transition-all duration-300 border-0 ${colors.bg} ${className}`}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-2.5 rounded-xl ${colors.icon} shadow-sm group-hover:scale-110 transition-transform duration-200`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {title}
                </p>
                <p className={`text-2xl font-bold ${colors.accent}`}>{value}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{description}</p>
            {trend && (
              <div
                className={`flex items-center gap-1 text-xs font-medium ${colors.trend}`}
              >
                <TrendingUp className="h-3 w-3" />
                {trend}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default async function RoleRequestsPage() {
  const currentUser = await requireAdmin();

  // Obtener todas las solicitudes de rol con información detallada
  const [
    allRequests,
    pendingRequests,
    approvedRequests,
    rejectedRequests,
    recentActivity,
    requestStats,
  ] = await Promise.all([
    // Todas las solicitudes
    prisma.roleRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    // Solicitudes pendientes
    prisma.roleRequest.findMany({
      where: { status: "PENDING" },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),

    // Solicitudes aprobadas (último mes)
    prisma.roleRequest.count({
      where: {
        status: "APPROVED",
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),

    // Solicitudes rechazadas (último mes)
    prisma.roleRequest.count({
      where: {
        status: "REJECTED",
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),

    // Actividad reciente (últimas 10)
    prisma.roleRequest.findMany({
      take: 10,
      where: {
        status: { in: ["APPROVED", "REJECTED"] },
        reviewedAt: { not: null },
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { reviewedAt: "desc" },
    }),

    // Estadísticas por tipo de rol solicitado
    prisma.roleRequest.groupBy({
      by: ["requestedRole"],
      _count: { requestedRole: true },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  const totalRequests = allRequests.length;
  const pendingCount = pendingRequests.length;
  const responseRate =
    totalRequests > 0
      ? ((approvedRequests + rejectedRequests) / totalRequests) * 100
      : 0;

  // Serializar fechas para el componente cliente
  const serializedRequests = allRequests.map((request) => ({
    ...request,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    reviewedAt: request.reviewedAt?.toISOString() || null,
    user: {
      ...request.user,
      createdAt: request.user.createdAt.toISOString(),
    },
  }));

  const serializedRecentActivity = recentActivity.map((request) => ({
    ...request,
    createdAt: request.createdAt.toISOString(),
    reviewedAt: request.reviewedAt?.toISOString() || null,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header con navegación */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Panel
            </Link>
          </Button>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Solicitudes de Rol
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Administra las solicitudes de cambio de rol de usuarios
            </p>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/90 to-purple-600/90"></div>
          <div className="absolute top-4 right-4 opacity-20">
            <UserCheck className="h-32 w-32" />
          </div>
          <div className="relative z-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <UserCheck className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl sm:text-4xl font-bold">
                      Solicitudes de Rol
                    </h2>
                    <p className="text-indigo-100 text-lg">
                      Panel de gestión administrativo
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-indigo-100 text-sm">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {pendingCount} pendientes
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    {totalRequests} total
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    {responseRate.toFixed(1)}% procesadas
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="bg-white text-indigo-600 hover:bg-gray-100"
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filtrar
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </div>
        </div>

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

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Solicitudes"
            value={totalRequests}
            icon={Mail}
            description="Solicitudes históricas"
            trend="Todas las solicitudes"
            accentColor="blue"
          />
          <StatCard
            title="Pendientes"
            value={pendingCount}
            icon={Clock}
            description="Requieren revisión"
            trend="Acción requerida"
            accentColor="orange"
          />
          <StatCard
            title="Aprobadas (30d)"
            value={approvedRequests}
            icon={CheckCircle2}
            description="Último mes"
            trend="Usuarios promovidos"
            accentColor="green"
          />
          <StatCard
            title="Tasa Respuesta"
            value={`${responseRate.toFixed(1)}%`}
            icon={BarChart3}
            description="Solicitudes procesadas"
            trend="Eficiencia del sistema"
            accentColor="purple"
          />
        </div>

        {/* Panel de análisis */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#0053CC]" />
                Roles Más Solicitados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {requestStats.map((stat) => (
                <div
                  key={stat.requestedRole}
                  className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-[#0053CC]" />
                    <span className="text-sm font-medium">
                      {stat.requestedRole}
                    </span>
                  </div>
                  <Badge variant="outline">{stat._count.requestedRole}</Badge>
                </div>
              ))}
              {requestStats.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay datos del último mes
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-[#0053CC]" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {serializedRecentActivity.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${request.status === "APPROVED" ? "bg-green-500" : "bg-red-500"}`}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {request.user.firstName || request.user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {request.status === "APPROVED" ? "Aprobado" : "Rechazado"}{" "}
                      • {request.requestedRole}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(request.reviewedAt!).toLocaleDateString("es-CL")}
                  </div>
                </div>
              ))}
              {serializedRecentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay actividad reciente
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-[#0053CC]" />
                Acciones Rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Aprobar Todas las Válidas
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-2 hover:border-[#0053CC]"
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar por Usuario
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-2 hover:border-[#0053CC]"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Filtrar por Fecha
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-2 hover:border-[#0053CC]"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar Reporte
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Componente principal de gestión */}
        <RoleRequestsManagement
          initialRequests={serializedRequests}
          currentUserRole={currentUser.role}
        />

        {/* Información adicional */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#0053CC] rounded-xl">
                <Info className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#0053CC] dark:text-[#01CBFE] mb-2">
                  Guía para Gestión de Roles
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-2">
                      Criterios de Aprobación:
                    </p>
                    <ul className="text-muted-foreground space-y-1 text-xs">
                      <li>• Usuario activo con historial positivo</li>
                      <li>• Justificación clara y válida</li>
                      <li>• Cumple requisitos del rol solicitado</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-muted-foreground mb-2">
                      Mejores Prácticas:
                    </p>
                    <ul className="text-muted-foreground space-y-1 text-xs">
                      <li>• Revisar solicitudes dentro de 48h</li>
                      <li>• Proporcionar feedback claro</li>
                      <li>• Documentar decisiones importantes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
