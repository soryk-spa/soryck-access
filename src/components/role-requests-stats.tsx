"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { UserRole } from "@prisma/client";

interface RoleRequestStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  thisMonth: {
    total: number;
    approved: number;
    rejected: number;
  };
  lastMonth: {
    total: number;
    approved: number;
    rejected: number;
  };
  byRole: Array<{
    role: UserRole;
    count: number;
    approved: number;
    rejected: number;
  }>;
  responseTime: {
    average: number;
    median: number;
  };
}

interface RoleRequestStatsProps {
  initialStats?: RoleRequestStats;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const ROLE_LABELS: Record<UserRole, string> = {
  CLIENT: "Cliente",
  ORGANIZER: "Organizador",
  SCANNER: "Scanner",
  ADMIN: "Administrador",
};

const ROLE_COLORS: Record<UserRole, string> = {
  CLIENT: "bg-blue-500",
  ORGANIZER: "bg-green-500",
  SCANNER: "bg-orange-500",
  ADMIN: "bg-purple-500",
};

export default function RoleRequestsStats({
  initialStats,
  autoRefresh = false,
  refreshInterval = 30000,
}: RoleRequestStatsProps) {
  const [stats, setStats] = useState<RoleRequestStats | null>(
    initialStats || null
  );
  const [loading, setLoading] = useState(!initialStats);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/role-requests/stats");
      if (!response.ok) throw new Error("Error al cargar estadísticas");

      const data = await response.json();
      setStats(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!initialStats) {
      fetchStats();
    }

    if (autoRefresh) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, initialStats]);

  const getChangeIndicator = (current: number, previous: number) => {
    if (previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    const isPositive = change > 0;

    return (
      <div
        className={`flex items-center gap-1 text-xs ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        {Math.abs(change).toFixed(1)}%
      </div>
    );
  };

  const formatResponseTime = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  if (loading && !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-blue-500 text-white shadow-sm">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Solicitudes
                    </p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.total}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    Historial completo
                  </p>
                  {getChangeIndicator(
                    stats.thisMonth.total,
                    stats.lastMonth.total
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-orange-500 text-white shadow-sm">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Pendientes
                    </p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {stats.pending}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Requieren atención
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-green-500 text-white shadow-sm">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Aprobadas
                    </p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.approved}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {stats.total > 0
                      ? Math.round((stats.approved / stats.total) * 100)
                      : 0}
                    % del total
                  </p>
                  {getChangeIndicator(
                    stats.thisMonth.approved,
                    stats.lastMonth.approved
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-purple-500 text-white shadow-sm">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Tiempo Respuesta
                    </p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formatResponseTime(stats.responseTime.average)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Mediana: {formatResponseTime(stats.responseTime.median)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-[#0053CC]" />
              Solicitudes por Rol
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchStats}
              disabled={loading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Actualizar
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.byRole.map((roleData) => (
              <div key={roleData.role} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${ROLE_COLORS[roleData.role]}`}
                    ></div>
                    <span className="text-sm font-medium">
                      {ROLE_LABELS[roleData.role]}
                    </span>
                  </div>
                  <Badge variant="outline">{roleData.count}</Badge>
                </div>

                {roleData.count > 0 && (
                  <div className="flex gap-4 text-xs text-muted-foreground pl-5">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                      {roleData.approved} aprobadas
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle className="h-3 w-3 text-red-500" />
                      {roleData.rejected} rechazadas
                    </span>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[#0053CC]" />
              Comparación Mensual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Este Mes
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total</span>
                    <Badge variant="outline">{stats.thisMonth.total}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-600">Aprobadas</span>
                    <Badge className="bg-green-100 text-green-800 text-xs">
                      {stats.thisMonth.approved}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600">Rechazadas</span>
                    <Badge className="bg-red-100 text-red-800 text-xs">
                      {stats.thisMonth.rejected}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Mes Anterior
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total</span>
                    <Badge variant="secondary">{stats.lastMonth.total}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-600">Aprobadas</span>
                    <Badge className="bg-green-50 text-green-700 text-xs">
                      {stats.lastMonth.approved}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-red-600">Rechazadas</span>
                    <Badge className="bg-red-50 text-red-700 text-xs">
                      {stats.lastMonth.rejected}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-muted-foreground mb-2">
                Tendencias
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Actividad general</span>
                  {getChangeIndicator(
                    stats.thisMonth.total,
                    stats.lastMonth.total
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Tasa de aprobación</span>
                  <div className="text-xs font-medium">
                    {stats.thisMonth.total > 0
                      ? Math.round(
                          (stats.thisMonth.approved / stats.thisMonth.total) *
                            100
                        )
                      : 0}
                    %
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Última actualización: {lastUpdated.toLocaleString("es-CL")}</span>
        {autoRefresh && (
          <span>
            Actualización automática cada {Math.round(refreshInterval / 1000)}s
          </span>
        )}
      </div>
    </div>
  );
}
