"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Plus,
  Users,
  Gift,
  BarChart3,
  Settings,
  QrCode,
  FileText,
  Share2,
  CreditCard,
  Bell,
  UserCircle,
  TrendingUp,
  Target,
  Edit,
  Eye,
  Building,
  Ticket
} from "lucide-react";
import Link from "next/link";

// Datos de navegación organizados por categorías
export const organizerRoutes = {
  events: {
    title: "Gestión de Eventos",
    description: "Crea, edita y administra tus eventos",
    icon: Calendar,
    color: "blue" as const,
    routes: [
      {
        title: "Crear Evento",
        description: "Nuevo evento desde cero",
        href: "/dashboard/events/new",
        icon: Plus,
        color: "blue" as const,
        featured: true
      },
      {
        title: "Mis Eventos",
        description: "Ver y editar eventos existentes",
        href: "/dashboard/events",
        icon: Edit,
        color: "green" as const
      },
      {
        title: "Eventos Públicos",
        description: "Ver eventos publicados",
        href: "/events",
        icon: Eye,
        color: "purple" as const
      },
      {
        title: "Estadísticas",
        description: "Métricas y análisis detallado",
        href: "/dashboard/events",
        icon: BarChart3,
        color: "orange" as const
      }
    ]
  },
  sales: {
    title: "Ventas y Marketing",
    description: "Promociona y monetiza tus eventos",
    icon: Target,
    color: "green" as const,
    routes: [
      {
        title: "Códigos Promocionales",
        description: "Crear y gestionar descuentos",
        href: "/dashboard/promo-codes",
        icon: Gift,
        color: "green" as const,
        featured: true
      },
      {
        title: "Crear Código Promo",
        description: "Nuevo código de descuento",
        href: "/dashboard/promo-codes/create",
        icon: Plus,
        color: "blue" as const
      },
      {
        title: "Mis Tickets",
        description: "Ver tickets vendidos",
        href: "/dashboard/tickets",
        icon: Ticket,
        color: "purple" as const
      },
      {
        title: "Escáner de Tickets",
        description: "Validar entradas",
        href: "/dashboard/organizer/scanners",
        icon: QrCode,
        color: "orange" as const
      }
    ]
  },
  tools: {
    title: "Herramientas",
    description: "Utilidades y configuración",
    icon: Settings,
    color: "purple" as const,
    routes: [
      {
        title: "Mi Perfil",
        description: "Configurar perfil público",
        href: "/dashboard/organizer-profile",
        icon: UserCircle,
        color: "green" as const,
        featured: true
      },
      {
        title: "Mis Venues",
        description: "Gestionar lugares",
        href: "/dashboard/organizer/venues",
        icon: Building,
        color: "blue" as const
      },
      {
        title: "Configuración",
        description: "Ajustes de cuenta",
        href: "/dashboard/settings",
        icon: Settings,
        color: "purple" as const
      },
      {
        title: "Ayuda",
        description: "Centro de ayuda",
        href: "/help",
        icon: FileText,
        color: "orange" as const
      }
    ]
  }
};

interface RouteItem {
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "green" | "purple" | "orange" | "red";
  featured?: boolean;
}

// Componente para mostrar una ruta específica
export const RouteCard = ({ 
  route, 
  badge,
  compact = false 
}: { 
  route: RouteItem;
  badge?: string;
  compact?: boolean;
}) => {
  const colorClasses: Record<string, string> = {
    blue: "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:from-blue-100 hover:to-blue-200 text-blue-700 shadow-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/20 dark:border-blue-800 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 dark:text-blue-300 dark:shadow-blue-900/20",
    green: "bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:from-emerald-100 hover:to-emerald-200 text-emerald-700 shadow-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/20 dark:border-emerald-800 dark:hover:from-emerald-900/30 dark:hover:to-emerald-800/30 dark:text-emerald-300 dark:shadow-emerald-900/20",
    purple: "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:from-purple-100 hover:to-purple-200 text-purple-700 shadow-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/20 dark:border-purple-800 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30 dark:text-purple-300 dark:shadow-purple-900/20",
    orange: "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:from-orange-100 hover:to-orange-200 text-orange-700 shadow-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/20 dark:border-orange-800 dark:hover:from-orange-900/30 dark:hover:to-orange-800/30 dark:text-orange-300 dark:shadow-orange-900/20",
    red: "bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:from-red-100 hover:to-red-200 text-red-700 shadow-red-100/50 dark:from-red-950/20 dark:to-red-900/20 dark:border-red-800 dark:hover:from-red-900/30 dark:hover:to-red-800/30 dark:text-red-300 dark:shadow-red-900/20",
    gray: "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:from-gray-100 hover:to-gray-200 text-gray-700 shadow-gray-100/50 dark:from-gray-950/20 dark:to-gray-900/20 dark:border-gray-800 dark:hover:from-gray-900/30 dark:hover:to-gray-800/30 dark:text-gray-300 dark:shadow-gray-900/20"
  };

  return (
    <Link href={route.href}>
      <Card className={`group transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer border-2 ${colorClasses[route.color] || colorClasses.blue} ${route.featured ? 'ring-2 ring-offset-2 ring-blue-500/30' : ''}`}>
        <CardContent className={compact ? "p-4" : "p-6"}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div className={`p-2 rounded-lg bg-white/80 dark:bg-gray-800/80 shadow-sm border border-gray-200/50 dark:border-gray-700/50 ${compact ? 'p-1.5' : 'p-2'}`}>
                <route.icon className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} group-hover:scale-110 transition-transform duration-200`} />
              </div>
              <div className="flex-1">
                <h3 className={`font-semibold group-hover:text-current transition-colors ${compact ? 'text-sm' : 'text-base'}`}>
                  {route.title}
                </h3>
                <p className={`opacity-70 mt-1 group-hover:opacity-80 transition-opacity ${compact ? 'text-xs' : 'text-sm'}`}>
                  {route.description}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end space-y-1">
              {badge && (
                <Badge variant="secondary" className="text-xs bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border border-gray-200/50 dark:border-gray-700/50">
                  {badge}
                </Badge>
              )}
              {route.featured && (
                <Badge variant="default" className="text-xs bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white shadow-sm">
                  ⭐ Destacado
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

// Componente para mostrar una categoría completa
export const CategorySection = ({ 
  category,
  badges = {},
  title,
  description
}: {
  category: typeof organizerRoutes.events;
  badges?: Record<string, string>;
  title?: string;
  description?: string;
}) => {
  return (
    <Card className="border-2 border-gray-100 dark:border-gray-800 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-950/50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center space-x-3 text-lg">
          <div className={`p-2 rounded-lg bg-gradient-to-br from-${category.color}-50 to-${category.color}-100 dark:from-${category.color}-950/50 dark:to-${category.color}-900/50 shadow-sm border border-gray-200/50 dark:border-gray-700/50`}>
            <category.icon className={`h-5 w-5 text-${category.color}-600 dark:text-${category.color}-400`} />
          </div>
          <span className="text-gray-900 dark:text-gray-100">{title || category.title}</span>
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400 ml-11">
          {description || category.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {category.routes.map((route) => (
          <RouteCard
            key={route.href}
            route={route}
            badge={badges[route.href]}
            compact
          />
        ))}
      </CardContent>
    </Card>
  );
};

// Componente para acciones rápidas destacadas
export const QuickActions = ({ 
  badges = {} 
}: { 
  badges?: Record<string, string> 
}) => {
  const featuredRoutes = [
    ...organizerRoutes.events.routes.filter(r => r.featured),
    ...organizerRoutes.sales.routes.filter(r => r.featured),
    ...organizerRoutes.tools.routes.filter(r => r.featured),
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {featuredRoutes.map((route) => (
        <RouteCard
          key={route.href}
          route={route}
          badge={badges[route.href]}
        />
      ))}
    </div>
  );
};

// Métricas rápidas para el header
export const QuickMetrics = ({
  totalEvents,
  totalRevenue,
  totalTickets,
  activePromoCodes
}: {
  totalEvents: number;
  totalRevenue: number;
  totalTickets: number;
  activePromoCodes: number;
}) => {
  const metrics = [
    {
      label: "Eventos",
      value: totalEvents,
      icon: Calendar,
      color: "blue" as const
    },
    {
      label: "Ingresos",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "green" as const
    },
    {
      label: "Tickets",
      value: totalTickets,
      icon: Users,
      color: "purple" as const
    },
    {
      label: "Promociones",
      value: activePromoCodes,
      icon: Gift,
      color: "orange" as const
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm"
        >
          <div className="flex items-center justify-center mb-2">
            <metric.icon className="h-6 w-6 text-white" />
          </div>
          <div className="text-2xl font-bold text-white">
            {metric.value}
          </div>
          <div className="text-sm text-white/80">
            {metric.label}
          </div>
        </div>
      ))}
    </div>
  );
};
