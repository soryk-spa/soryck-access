"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Plus,
  Search,
  Power,
  MoreVertical,
  Copy,
  Eye,
  Edit,
  Users,
  Activity,
  Target,
  Percent,
  DollarSign,
  Gift,
  Clock,
  Filter,
  Download,
  Share2,
  BarChart3,
} from "lucide-react";
import Link from "next/link";

// Importaciones optimizadas desde utilidades centralizadas
import type { PromoCode } from "@/types";
import { 
  formatDisplayDate,
  formatDiscount, 
  getStatusConfig,
  calculateUsagePercentage,
  formatCurrency 
} from "@/lib/utils";
import { 
  usePromoCodeManagement, 
  usePromoCodeFilters, 
  usePromoCodeStats,
  usePromoCodeSharing 
} from "@/hooks/usePromoCode";

interface PromoCodesManagementProps {
  initialPromoCodes: PromoCode[];
}

export default function PromoCodesManagement({
  initialPromoCodes,
}: PromoCodesManagementProps) {
  // Hooks personalizados para manejo de estado y lógica
  const { promoCodes, loadingStates, togglePromoCodeStatus, copyToClipboard } = 
    usePromoCodeManagement(initialPromoCodes);
  
  const { filters, filteredPromoCodes, updateFilter } = usePromoCodeFilters(promoCodes);
  
  const totalStats = usePromoCodeStats(promoCodes);
  
  const { sharePromoCode } = usePromoCodeSharing();

  // Estado local para UI
  const [selectedPromoCode, setSelectedPromoCode] = useState<PromoCode | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const getStatusBadge = (status: string) => {
    const config = getStatusConfig(status);
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PERCENTAGE":
        return <Percent className="h-4 w-4 text-blue-600" />;
      case "FIXED_AMOUNT":
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case "FREE":
        return <Gift className="h-4 w-4 text-purple-600" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const getUsageProgress = (used: number, limit?: number) => {
    if (!limit) return null;

    const percentage = calculateUsagePercentage(used, limit);
    const color =
      percentage >= 90
        ? "bg-red-500"
        : percentage >= 70
          ? "bg-yellow-500"
          : "bg-green-500";

    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color} transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    );
  };

  const PromoCodeDetails = ({ promoCode }: { promoCode: PromoCode }) => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-sm text-muted-foreground">Código</h4>
          <div className="flex items-center gap-2 mt-1">
            <code className="bg-muted px-2 py-1 rounded text-lg font-mono">
              {promoCode.code}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(promoCode.code)}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div>
          <h4 className="font-medium text-sm text-muted-foreground">Estado</h4>
          <div className="mt-1">{getStatusBadge(promoCode.status)}</div>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-sm text-muted-foreground">Descuento</h4>
        <div className="flex items-center gap-2 mt-1">
          {getTypeIcon(promoCode.type)}
          <span className="text-lg font-semibold">
            {formatDiscount(promoCode.type, promoCode.value)}
          </span>
        </div>
      </div>

      {promoCode.description && (
        <div>
          <h4 className="font-medium text-sm text-muted-foreground">
            Descripción
          </h4>
          <p className="mt-1 text-sm">{promoCode.description}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-sm text-muted-foreground">
            Válido desde
          </h4>
          <p className="mt-1 text-sm">{formatDisplayDate(promoCode.validFrom)}</p>
        </div>
        {promoCode.validUntil && (
          <div>
            <h4 className="font-medium text-sm text-muted-foreground">
              Válido hasta
            </h4>
            <p className="mt-1 text-sm">{formatDisplayDate(promoCode.validUntil)}</p>
          </div>
        )}
      </div>

      <div>
        <h4 className="font-medium text-sm text-muted-foreground">Uso</h4>
        <div className="space-y-2 mt-1">
          <div className="flex items-center justify-between text-sm">
            <span>Usado: {promoCode.usedCount}</span>
            {promoCode.usageLimit && (
              <span className="text-muted-foreground">
                de {promoCode.usageLimit}
              </span>
            )}
          </div>
          {getUsageProgress(promoCode.usedCount, promoCode.usageLimit)}
        </div>
      </div>

      {promoCode.event && (
        <div>
          <h4 className="font-medium text-sm text-muted-foreground">Evento</h4>
          <p className="mt-1 text-sm">{promoCode.event.title}</p>
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={() => sharePromoCode(promoCode, formatDiscount)}
          className="flex-1"
        >
          <Share2 className="h-4 w-4 mr-2" />
          Compartir
        </Button>
        <Button variant="outline" size="sm" className="flex-1">
          <BarChart3 className="h-4 w-4 mr-2" />
          Estadísticas
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold">Códigos Promocionales</h2>
          <p className="text-muted-foreground">
            Gestiona descuentos y promociones para incrementar las ventas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button asChild>
            <Link href="/dashboard/promo-codes/create">
              <Plus className="h-4 w-4 mr-2" />
              Crear código
            </Link>
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-500 text-white rounded-xl shadow-sm">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {totalStats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-500 text-white rounded-xl shadow-sm">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Activos
                </p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {totalStats.active}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500 text-white rounded-xl shadow-sm">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Usos totales
                </p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {totalStats.totalUsages}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-500 text-white rounded-xl shadow-sm">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Expirados
                </p>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {totalStats.expired}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código o nombre..."
                  value={filters.search || ""}
                  onChange={(e) => updateFilter("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filters.status}
                onChange={(e) => updateFilter("status", e.target.value as "all" | "ACTIVE" | "INACTIVE" | "EXPIRED" | "USED_UP")}
                className="px-3 py-2 border rounded-md text-sm bg-background"
              >
                <option value="all">Todos los estados</option>
                <option value="ACTIVE">Activos</option>
                <option value="INACTIVE">Inactivos</option>
                <option value="EXPIRED">Expirados</option>
                <option value="USED_UP">Agotados</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Más filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de códigos promocionales */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descuento</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Uso</TableHead>
                <TableHead>Validez</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Tipo de Ticket</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPromoCodes.map((promoCode) => (
                <TableRow key={promoCode.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono font-medium">
                          {promoCode.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(promoCode.code)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground mt-1">
                        {promoCode.name}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(promoCode.type)}
                      <span className="font-medium">
                        {formatDiscount(promoCode.type, promoCode.value)}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>{getStatusBadge(promoCode.status)}</TableCell>

                  <TableCell>
                    <div className="space-y-1 min-w-[100px]">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          {promoCode.usedCount}
                        </span>
                        {promoCode.usageLimit && (
                          <span className="text-muted-foreground">
                            / {promoCode.usageLimit}
                          </span>
                        )}
                      </div>
                      {getUsageProgress(
                        promoCode.usedCount,
                        promoCode.usageLimit
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="text-muted-foreground">Desde:</span>{" "}
                        {new Date(promoCode.validFrom).toLocaleDateString(
                          "es-CL"
                        )}
                      </div>
                      {promoCode.validUntil && (
                        <div className="text-muted-foreground">
                          <span>Hasta:</span>{" "}
                          {new Date(promoCode.validUntil).toLocaleDateString(
                            "es-CL"
                          )}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    {promoCode.event ? (
                      <span className="text-sm">{promoCode.event.title}</span>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Todos los eventos
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    {promoCode.ticketType ? (
                      <div className="text-sm">
                        <span className="font-medium">{promoCode.ticketType.name}</span>
                        {promoCode.ticketType.price > 0 && (
                          <div className="text-muted-foreground text-xs">
                            {formatCurrency(promoCode.ticketType.price)} CLP
                          </div>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Todos los tipos
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedPromoCode(promoCode);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          <Link
                            href={`/dashboard/promo-codes/${promoCode.id}/edit`}
                          >
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => sharePromoCode(promoCode, formatDiscount)}
                        >
                          <Share2 className="h-4 w-4 mr-2" />
                          Compartir
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => togglePromoCodeStatus(promoCode)}
                          disabled={loadingStates[promoCode.id] || promoCode.status === "EXPIRED" || promoCode.status === "USED_UP"}
                          className={promoCode.status === "ACTIVE" ? "text-orange-600" : "text-green-600"}
                        >
                          <Power className="h-4 w-4 mr-2" />
                          {promoCode.status === "ACTIVE" ? "Desactivar" : "Activar"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredPromoCodes.length === 0 && (
            <div className="p-8 text-center">
              <div className="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                <Target className="h-12 w-12 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {filters.search || filters.status !== "all"
                  ? "No se encontraron códigos"
                  : "No hay códigos promocionales"}
              </h3>
              <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
                {filters.search || filters.status !== "all"
                  ? "Intenta ajustar tus filtros de búsqueda"
                  : "Crea tu primer código promocional para empezar a ofrecer descuentos increíbles"}
              </p>
              {!filters.search && filters.status === "all" && (
                <Button asChild>
                  <Link href="/dashboard/promo-codes/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear primer código
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de detalles */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detalles del Código Promocional</DialogTitle>
            <DialogDescription>{selectedPromoCode?.name}</DialogDescription>
          </DialogHeader>
          {selectedPromoCode && (
            <PromoCodeDetails promoCode={selectedPromoCode} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
