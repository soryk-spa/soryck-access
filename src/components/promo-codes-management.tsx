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
  Plus,
  Search,
  MoreVertical,
  Copy,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Users,
  TrendingUp,
  Activity,
  Target,
  Percent,
  DollarSign,
  Gift,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { formatDate } from "@/lib/date";

interface PromoCode {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE";
  value: number;
  status: "ACTIVE" | "INACTIVE" | "EXPIRED" | "USED_UP";
  usedCount: number;
  usageLimit?: number;
  validFrom: string;
  validUntil?: string;
  event?: { title: string };
  _count: { usages: number };
}

interface PromoCodesManagementProps {
  initialPromoCodes: PromoCode[];
  eventId?: string;
}

export default function PromoCodesManagement({
  initialPromoCodes,
}: PromoCodesManagementProps) {
  const [promoCodes] = useState<PromoCode[]>(initialPromoCodes);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPromoCodes = promoCodes.filter(
    (code) =>
      code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      code.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado al portapapeles");
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      ACTIVE: "default",
      INACTIVE: "secondary",
      EXPIRED: "destructive",
      USED_UP: "outline",
    } as const;

    const labels = {
      ACTIVE: "Activo",
      INACTIVE: "Inactivo",
      EXPIRED: "Expirado",
      USED_UP: "Agotado",
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "PERCENTAGE":
        return <Percent className="h-4 w-4" />;
      case "FIXED_AMOUNT":
        return <DollarSign className="h-4 w-4" />;
      case "FREE":
        return <Gift className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  const formatDiscount = (type: string, value: number) => {
    switch (type) {
      case "PERCENTAGE":
        return `${value}%`;
      case "FIXED_AMOUNT":
        return `$${value.toLocaleString("es-CL")}`;
      case "FREE":
        return "Gratis";
      default:
        return value.toString();
    }
  };

  const getUsageProgress = (used: number, limit?: number) => {
    if (!limit) return null;

    const percentage = (used / limit) * 100;
    const color =
      percentage >= 90
        ? "bg-red-500"
        : percentage >= 70
          ? "bg-yellow-500"
          : "bg-green-500";

    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${color}`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    );
  };

  const totalStats = {
    total: promoCodes.length,
    active: promoCodes.filter((code) => code.status === "ACTIVE").length,
    totalUsages: promoCodes.reduce((sum, code) => sum + code.usedCount, 0),
    expired: promoCodes.filter((code) => code.status === "EXPIRED").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Códigos Promocionales</h2>
          <p className="text-muted-foreground">
            Gestiona descuentos y promociones para tus eventos
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Crear código
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-xl font-bold">{totalStats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Activos</p>
                <p className="text-xl font-bold">{totalStats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Usos totales</p>
                <p className="text-xl font-bold">{totalStats.totalUsages}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expirados</p>
                <p className="text-xl font-bold">{totalStats.expired}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y búsqueda */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                Filtrar por fecha
              </Button>
              <Button variant="outline" size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Estado
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de códigos promocionales */}
      <Card>
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
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPromoCodes.map((promoCode) => (
                <TableRow key={promoCode.id}>
                  <TableCell>
                    <div>
                      <div className="flex items-center gap-2">
                        <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                          {promoCode.code}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(promoCode.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">
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
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{promoCode.usedCount}</span>
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
                    <div className="text-sm">
                      <div>Desde: {formatDate(promoCode.validFrom)}</div>
                      {promoCode.validUntil && (
                        <div className="text-muted-foreground">
                          Hasta: {formatDate(promoCode.validUntil)}
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
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
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">
                No hay códigos promocionales
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm
                  ? "No se encontraron códigos que coincidan con tu búsqueda"
                  : "Crea tu primer código promocional para empezar a ofrecer descuentos"}
              </p>
              {!searchTerm && (
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primer código
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
