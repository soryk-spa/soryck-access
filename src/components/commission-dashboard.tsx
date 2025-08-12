import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/commission";
import { DollarSign, TrendingUp, Percent, Calendar } from "lucide-react";

interface CommissionStats {
  totalCommissions: number;
  totalRevenue: number;
  commissionRate: number;
  monthlyCommissions: number;
  monthlyRevenue: number;
  topEvents: Array<{
    id: string;
    title: string;
    totalRevenue: number;
    commissions: number;
    ticketsSold: number;
  }>;
  recentCommissions: Array<{
    id: string;
    orderNumber: string;
    eventTitle: string;
    baseAmount: number;
    commissionAmount: number;
    totalAmount: number;
    createdAt: string;
  }>;
}

interface CommissionDashboardProps {
  stats: CommissionStats;
  currency?: string;
}

export default function CommissionDashboard({
  stats,
  currency = "CLP",
}: CommissionDashboardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Resumen de Comisiones</h2>
        <Badge variant="outline" className="text-primary">
          Comisión actual: {(stats.commissionRate * 100).toFixed(0)}%
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Comisiones Totales
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(stats.totalCommissions, currency)}
            </div>
            <p className="text-xs text-muted-foreground">Desde el inicio</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos Totales
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(stats.totalRevenue, currency)}
            </div>
            <p className="text-xs text-muted-foreground">Volumen procesado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Comisiones del Mes
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatPrice(stats.monthlyCommissions, currency)}
            </div>
            <p className="text-xs text-muted-foreground">Mes actual</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa Efectiva</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRevenue > 0
                ? ((stats.totalCommissions / stats.totalRevenue) * 100).toFixed(
                    2
                  )
                : "0.00"}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Comisión real promedio
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Eventos Más Rentables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="font-medium text-sm">{event.title}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {event.ticketsSold} tickets vendidos
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-medium text-green-600">
                      {formatPrice(event.commissions, currency)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      de {formatPrice(event.totalRevenue, currency)}
                    </div>
                  </div>
                </div>
              ))}

              {stats.topEvents.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay datos de eventos aún
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Comisiones Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentCommissions.map((commission) => (
                <div
                  key={commission.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {commission.eventTitle}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Orden: {commission.orderNumber}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(commission.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-medium text-green-600">
                      {formatPrice(commission.commissionAmount, currency)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Base: {formatPrice(commission.baseAmount, currency)}
                    </div>
                  </div>
                </div>
              ))}

              {stats.recentCommissions.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No hay comisiones recientes
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Información del Sistema de Comisiones</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">
                Cómo Funcionan las Comisiones
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>
                  • Se aplica un {(stats.commissionRate * 100).toFixed(0)}%
                  sobre el precio del evento
                </li>
                <li>• Las comisiones se calculan automáticamente</li>
                <li>• Los eventos gratuitos no generan comisiones</li>
                <li>• Los reembolsos incluyen la comisión</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Transparencia</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Los usuarios ven el desglose completo del precio</li>
                <li>• La comisión se muestra claramente en el checkout</li>
                <li>• Los organizadores conocen los costos por adelantado</li>
                <li>• Reportes detallados disponibles</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Nota:</strong> Las comisiones nos permiten mantener la
              plataforma funcionando, mejorar continuamente las funcionalidades
              y brindar soporte técnico a nuestros usuarios.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function useCommissionStats() {
  const mockStats: CommissionStats = {
    totalCommissions: 150000,
    totalRevenue: 2500000,
    commissionRate: 0.06,
    monthlyCommissions: 25000,
    monthlyRevenue: 416667,
    topEvents: [
      {
        id: "1",
        title: "Concierto de Rock",
        totalRevenue: 500000,
        commissions: 30000,
        ticketsSold: 200,
      },
      {
        id: "2",
        title: "Conferencia Tech",
        totalRevenue: 300000,
        commissions: 18000,
        ticketsSold: 150,
      },
    ],
    recentCommissions: [
      {
        id: "1",
        orderNumber: "SP20240115001",
        eventTitle: "Workshop de Marketing",
        baseAmount: 50000,
        commissionAmount: 3000,
        totalAmount: 53000,
        createdAt: new Date().toISOString(),
      },
    ],
  };

  return mockStats;
}
