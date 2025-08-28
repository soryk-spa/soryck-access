"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardPageLayout } from "@/components/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Gift,
  Percent,
  DollarSign,
  Plus,
  Eye,
  Settings,
  TrendingUp,
  Target,
  Activity,
  Filter,
  Search,
  Grid3X3,
  List,
  Clock,
  Copy,
  MoreVertical,
  Power,
  Users,
  Award,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PromoCode {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE";
  discountValue: number;
  description?: string;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "USED_UP";
  validFrom: string;
  validUntil?: string;
  usageLimit?: number;
  usedCount: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  event?: {
    id: string;
    title: string;
  };
  category?: {
    id: string;
    name: string;
  };
  ticketType?: {
    id: string;
    name: string;
  };
  _count: {
    usages: number;
  };
}

interface PromoCodesManagementProps {
  initialPromoCodes: PromoCode[];
}

// Componente para tarjetas de estadísticas modernas
const ModernStatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendDirection = "up",
  accentColor = "blue",
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  accentColor?: "blue" | "green" | "purple" | "orange";
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
  };

  const colors = colorVariants[accentColor];

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 border-0 ${colors.bg}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2.5 rounded-xl ${colors.icon} shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className={`text-2xl font-bold ${colors.accent}`}>{value}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{description}</p>
            {trend && (
              <div className={`flex items-center gap-1 text-xs font-medium ${colors.trend}`}>
                <TrendingUp className={`h-3 w-3 ${trendDirection === "down" ? "rotate-180" : ""}`} />
                {trend}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para tarjeta de código promocional moderno
const ModernPromoCodeCard = ({ promoCode }: { promoCode: PromoCode }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return {
          label: "Activo",
          color: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        };
      case "INACTIVE":
        return {
          label: "Inactivo",
          color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        };
      case "EXPIRED":
        return {
          label: "Expirado",
          color: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
        };
      case "USED_UP":
        return {
          label: "Agotado",
          color: "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300",
        };
      default:
        return {
          label: status,
          color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        };
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PERCENTAGE":
        return { icon: Percent, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900" };
      case "FIXED_AMOUNT":
        return { icon: DollarSign, color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900" };
      case "FREE":
        return { icon: Gift, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-100 dark:bg-purple-900" };
      default:
        return { icon: Target, color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-100 dark:bg-gray-900" };
    }
  };

  const formatDiscount = (type: string, value: number) => {
    switch (type) {
      case "PERCENTAGE":
        return `${value}% OFF`;
      case "FIXED_AMOUNT":
        return `$${value.toLocaleString("es-CL")} CLP OFF`;
      case "FREE":
        return "GRATIS";
      default:
        return `${value}`;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error("Error copying to clipboard:", err);
    }
  };

  const status = getStatusConfig(promoCode.status);
  const typeConfig = getTypeIcon(promoCode.type);
  const TypeIcon = typeConfig.icon;
  
  const usagePercentage = promoCode.usageLimit 
    ? Math.round((promoCode.usedCount / promoCode.usageLimit) * 100)
    : 0;

  const isHighUsage = usagePercentage > 80;

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-white dark:bg-gray-800 hover:scale-[1.02] cursor-pointer overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          {/* Header con gradiente */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 p-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <code className="text-2xl font-bold font-mono bg-white/20 px-3 py-1 rounded-lg">
                    {promoCode.code}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                    onClick={() => copyToClipboard(promoCode.code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {isHighUsage && (
                    <div className="flex items-center gap-1 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      <Clock className="h-3 w-3" />
                      Casi agotado
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-purple-100 text-sm">
                  <Badge className={status.color} variant="secondary">
                    {status.label}
                  </Badge>
                  <Badge variant="outline" className="border-purple-200 text-purple-100 bg-purple-500/20">
                    {formatDiscount(promoCode.type, promoCode.discountValue)}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-purple-200 hover:text-white hover:bg-white/20">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/promo-codes/${promoCode.id}`}>
                      <Eye className="h-4 w-4 mr-2" />
                      Ver detalles
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/dashboard/promo-codes/${promoCode.id}/edit`}>
                      <Settings className="h-4 w-4 mr-2" />
                      Editar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Power className="h-4 w-4 mr-2" />
                    {promoCode.status === "ACTIVE" ? "Desactivar" : "Activar"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="p-6 space-y-6">
            {/* Información del código */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className={`p-2 ${typeConfig.bg} rounded-lg`}>
                    <TypeIcon className={`h-4 w-4 ${typeConfig.color}`} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Tipo de descuento</p>
                    <p className="text-muted-foreground">{formatDiscount(promoCode.type, promoCode.discountValue)}</p>
                  </div>
                </div>

                {promoCode.event && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground line-clamp-1">{promoCode.event.title}</p>
                      <p className="text-muted-foreground">Evento específico</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                    <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {promoCode.usedCount}
                      {promoCode.usageLimit ? `/${promoCode.usageLimit}` : ""} usos
                    </p>
                    <p className="text-muted-foreground">
                      {promoCode.usageLimit ? `${usagePercentage}% utilizado` : "Sin límite"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-sm">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                    <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {promoCode.validUntil 
                        ? new Date(promoCode.validUntil).toLocaleDateString("es-CL")
                        : "Sin fecha límite"
                      }
                    </p>
                    <p className="text-muted-foreground">Válido hasta</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Barra de progreso de uso */}
            {promoCode.usageLimit && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Uso del código</span>
                  <span className="font-medium">{usagePercentage}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      usagePercentage > 80
                        ? "bg-gradient-to-r from-orange-500 to-red-500"
                        : usagePercentage > 50
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                          : "bg-gradient-to-r from-green-500 to-blue-500"
                    }`}
                    style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Información adicional */}
            <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-muted-foreground">
                {promoCode.description && (
                  <p className="line-clamp-2">{promoCode.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Activity className="h-3 w-3" />
                {promoCode._count.usages} aplicaciones
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function PromoCodesManagement({ initialPromoCodes }: PromoCodesManagementProps) {
  const [promoCodes] = useState<PromoCode[]>(initialPromoCodes);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Calcular estadísticas
  const totalCodes = promoCodes.length;
  const activeCodes = promoCodes.filter((code) => code.status === "ACTIVE").length;
  const totalUsages = promoCodes.reduce((sum, code) => sum + code.usedCount, 0);
  const totalSavings = promoCodes.reduce((sum, code) => {
    if (code.type === "FIXED_AMOUNT") {
      return sum + (code.discountValue * code.usedCount);
    }
    return sum;
  }, 0);

  // Configuración del header
  const headerConfig = {
    title: "Códigos Promocionales",
    description: "gestiona y monitorea tus códigos de descuento",
    greeting: "Promociones activas",
    backgroundIcon: Gift,
    stats: [
      { icon: Target, label: "códigos creados", value: totalCodes },
      { icon: Award, label: "usos totales", value: totalUsages },
    ],
    actions: [
      {
        label: "Crear Código",
        href: "/dashboard/promo-codes/create",
        icon: Plus,
        variant: "default" as const,
      },
    ],
  };

  if (totalCodes === 0) {
    return (
      <DashboardPageLayout header={headerConfig}>
        <Card className="text-center py-16">
          <CardContent>
            <Gift className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-2xl font-semibold mb-2">¡Crea tu primer código promocional!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Incrementa tus ventas con códigos de descuento atractivos para tus eventos.
            </p>
            <Button size="lg" asChild>
              <Link href="/dashboard/promo-codes/create">
                <Plus className="w-5 h-5 mr-2" />
                Crear Primer Código
              </Link>
            </Button>
          </CardContent>
        </Card>
      </DashboardPageLayout>
    );
  }

  return (
    <DashboardPageLayout header={headerConfig}>
      {/* Estadísticas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ModernStatCard
          title="Total Códigos"
          value={totalCodes}
          icon={Gift}
          description="Códigos creados"
          trend="+8%"
          trendDirection="up"
          accentColor="purple"
        />
        <ModernStatCard
          title="Códigos Activos"
          value={activeCodes}
          icon={Target}
          description="Disponibles para uso"
          trend="+12%"
          trendDirection="up"
          accentColor="green"
        />
        <ModernStatCard
          title="Total Usos"
          value={totalUsages}
          icon={Users}
          description="Aplicaciones totales"
          trend="+18%"
          trendDirection="up"
          accentColor="blue"
        />
        <ModernStatCard
          title="Ahorros Generados"
          value={`$${totalSavings.toLocaleString("es-CL")}`}
          icon={DollarSign}
          description="CLP en descuentos"
          trend="+25%"
          trendDirection="up"
          accentColor="orange"
        />
      </div>

      {/* Controles de vista */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              Grid
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4 mr-2" />
              Lista
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
        </div>
      </div>

      {/* Lista de códigos promocionales */}
      <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 xl:grid-cols-3" : "space-y-4"}>
        {promoCodes.map((promoCode) => (
          <ModernPromoCodeCard key={promoCode.id} promoCode={promoCode} />
        ))}
      </div>
    </DashboardPageLayout>
  );
}
