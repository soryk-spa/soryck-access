"use client";

import { useState } from "react";
import Link from "next/link";
import { DashboardPageLayout } from "@/components/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Clock,
  Copy,
  MoreVertical,
  Power,
  Users,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap,
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

const StatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  gradient,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  trend?: string;
  gradient: string;
}) => {
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-5`} />
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold">{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
            {trend && (
              <div className="flex items-center gap-1 text-xs text-green-600">
                <TrendingUp className="h-3 w-3" />
                {trend}
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-200`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function PromoCodesManagement({ initialPromoCodes }: PromoCodesManagementProps) {
  const [promoCodes] = useState<PromoCode[]>(initialPromoCodes);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  const filteredPromoCodes = promoCodes.filter((code) => {
    const matchesSearch = code.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         code.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         code.event?.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || code.status === statusFilter;
    const matchesType = typeFilter === "all" || code.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Activo
          </Badge>
        );
      case "INACTIVE":
        return (
          <Badge className="bg-gradient-to-r from-gray-400 to-gray-500 text-white border-0">
            <XCircle className="h-3 w-3 mr-1" />
            Inactivo
          </Badge>
        );
      case "EXPIRED":
        return (
          <Badge className="bg-gradient-to-r from-red-500 to-rose-500 text-white border-0">
            <Clock className="h-3 w-3 mr-1" />
            Expirado
          </Badge>
        );
      case "USED_UP":
        return (
          <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
            <AlertCircle className="h-3 w-3 mr-1" />
            Agotado
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string, value: number) => {
    switch (type) {
      case "PERCENTAGE":
        return (
          <Badge className="bg-gradient-to-r from-[#0053CC] to-[#01CBFE] text-white border-0">
            <Percent className="h-3 w-3 mr-1" />
            {value}% OFF
          </Badge>
        );
      case "FIXED_AMOUNT":
        return (
          <Badge className="bg-gradient-to-r from-[#FDBD00] to-[#FE4F00] text-white border-0">
            <DollarSign className="h-3 w-3 mr-1" />
            ${value.toLocaleString("es-CL")} CLP
          </Badge>
        );
      case "FREE":
        return (
          <Badge className="bg-gradient-to-r from-[#CC66CC] to-[#FE4F00] text-white border-0">
            <Gift className="h-3 w-3 mr-1" />
            GRATIS
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const calculateStats = () => {
    const totalCodes = promoCodes.length;
    const activeCodes = promoCodes.filter(code => code.status === "ACTIVE").length;
    const totalUsages = promoCodes.reduce((acc, code) => acc + code.usedCount, 0);
    const totalSavings = promoCodes.reduce((acc, code) => {
      if (code.type === "FIXED_AMOUNT") {
        return acc + (code.discountValue * code.usedCount);
      }
      return acc;
    }, 0);

    return { totalCodes, activeCodes, totalUsages, totalSavings };
  };

  const stats = calculateStats();

  return (
    <DashboardPageLayout
      header={{
        title: "Códigos Promocionales",
        description: "Gestiona los descuentos y promociones para tus eventos",
        actions: [
          {
            label: "Crear Código",
            href: "/dashboard/promo-codes/create",
            icon: Plus,
            variant: "default"
          }
        ],
        backgroundIcon: Gift,
        gradient: "from-[#0053CC] to-[#01CBFE]"
      }}
    >
      {}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Códigos"
          value={stats.totalCodes}
          icon={Gift}
          description="Códigos creados"
          trend="+8%"
          gradient="from-[#CC66CC] to-[#FE4F00]"
        />
        <StatCard
          title="Códigos Activos"
          value={stats.activeCodes}
          icon={Target}
          description="Disponibles para uso"
          trend="+12%"
          gradient="from-[#0053CC] to-[#01CBFE]"
        />
        <StatCard
          title="Total Usos"
          value={stats.totalUsages}
          icon={Users}
          description="Aplicaciones totales"
          trend="+18%"
          gradient="from-[#01CBFE] to-[#CC66CC]"
        />
        <StatCard
          title="Ahorros Generados"
          value={`$${stats.totalSavings.toLocaleString("es-CL")}`}
          icon={DollarSign}
          description="CLP en descuentos"
          trend="+25%"
          gradient="from-[#FDBD00] to-[#FE4F00]"
        />
      </div>

      {}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5 text-[#0053CC]" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código, descripción o evento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="ACTIVE">Activo</SelectItem>
                <SelectItem value="INACTIVE">Inactivo</SelectItem>
                <SelectItem value="EXPIRED">Expirado</SelectItem>
                <SelectItem value="USED_UP">Agotado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="PERCENTAGE">Porcentaje</SelectItem>
                <SelectItem value="FIXED_AMOUNT">Monto fijo</SelectItem>
                <SelectItem value="FREE">Gratis</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#0053CC]" />
            Códigos Promocionales ({filteredPromoCodes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-[#0053CC]/5 to-[#01CBFE]/5">
                  <TableHead className="font-semibold">Código</TableHead>
                  <TableHead className="font-semibold">Tipo / Descuento</TableHead>
                  <TableHead className="font-semibold">Estado</TableHead>
                  <TableHead className="font-semibold">Evento</TableHead>
                  <TableHead className="font-semibold">Usos</TableHead>
                  <TableHead className="font-semibold">Vencimiento</TableHead>
                  <TableHead className="font-semibold text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromoCodes.map((promoCode) => {
                  const usagePercentage = promoCode.usageLimit 
                    ? Math.round((promoCode.usedCount / promoCode.usageLimit) * 100)
                    : 0;

                  return (
                    <TableRow key={promoCode.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="font-mono font-bold text-[#0053CC] bg-[#0053CC]/10 px-3 py-1 rounded-lg">
                            {promoCode.code}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(promoCode.code)}
                            className="h-6 w-6 p-0 hover:bg-[#01CBFE]/10"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        {promoCode.description && (
                          <p className="text-xs text-muted-foreground mt-1 max-w-48 truncate">
                            {promoCode.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(promoCode.type, promoCode.discountValue)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(promoCode.status)}
                      </TableCell>
                      <TableCell>
                        {promoCode.event ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-gradient-to-r from-[#CC66CC] to-[#FE4F00] rounded-full" />
                            <span className="text-sm font-medium max-w-32 truncate">
                              {promoCode.event.title}
                            </span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />
                            General
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {promoCode.usedCount}
                              {promoCode.usageLimit ? `/${promoCode.usageLimit}` : ""}
                            </span>
                            {promoCode.usageLimit && (
                              <Badge variant="outline" className="text-xs">
                                {usagePercentage}%
                              </Badge>
                            )}
                          </div>
                          {promoCode.usageLimit && (
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-gradient-to-r from-[#0053CC] to-[#01CBFE] h-1.5 rounded-full transition-all"
                                style={{ width: `${usagePercentage}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {promoCode.validUntil ? (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {new Date(promoCode.validUntil).toLocaleDateString("es-CL")}
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Sin límite
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
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
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {filteredPromoCodes.length === 0 && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0053CC]/10 to-[#01CBFE]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="h-8 w-8 text-[#0053CC]" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No se encontraron códigos</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Crea tu primer código promocional para empezar"}
              </p>
              <Link href="/dashboard/promo-codes/create">
                <Button className="bg-gradient-to-r from-[#0053CC] to-[#01CBFE] hover:from-[#0053CC]/90 hover:to-[#01CBFE]/90 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Código
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardPageLayout>
  );
}
