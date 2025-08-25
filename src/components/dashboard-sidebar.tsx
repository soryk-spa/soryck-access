"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  ChevronLeft,
  Home,
  Menu,
  Settings,
  Tag,
  Ticket,
  User,
  Users,
  BarChart3,
  Shield,
  Building,
  Bell,
  HelpCircle,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";

interface SidebarProps {
  className?: string;
  onClose?: () => void;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
  roles?: string[];
}

export function DashboardSidebar({ className, onClose }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useUser();

  // Determinar el tipo de dashboard basado en la ruta
  const isAdmin = pathname.startsWith("/admin");

  // Items de navegación para Dashboard General
  const dashboardItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      description: "Vista general de tu actividad",
    },
    {
      title: "Mis Eventos",
      href: "/dashboard/events",
      icon: Calendar,
      description: "Gestiona tus eventos",
    },
    {
      title: "Códigos Promocionales",
      href: "/dashboard/promo-codes",
      icon: Tag,
      description: "Crea y gestiona descuentos",
    },
    {
      title: "Perfil de Organizador",
      href: "/dashboard/organizer-profile",
      icon: User,
      description: "Configura tu perfil público",
    },
  ];

  // Items de navegación para Admin
  const adminItems: NavItem[] = [
    {
      title: "Panel Admin",
      href: "/admin",
      icon: Shield,
      description: "Dashboard administrativo",
    },
    {
      title: "Gestión de Usuarios",
      href: "/admin/users",
      icon: Users,
      description: "Administrar usuarios y roles",
    },
    {
      title: "Solicitudes de Rol",
      href: "/admin/role-requests",
      icon: Bell,
      description: "Revisar solicitudes pendientes",
    },
    {
      title: "Categorías",
      href: "/admin/categories",
      icon: Building,
      description: "Gestionar categorías de eventos",
    },
    {
      title: "Reportes",
      href: "/admin/reports",
      icon: BarChart3,
      description: "Estadísticas y análisis",
    },
  ];

  // Items de configuración
  const settingsItems: NavItem[] = [
    {
      title: "Configuración",
      href: "/settings",
      icon: Settings,
      description: "Preferencias de la cuenta",
    },
    {
      title: "Ayuda",
      href: "/help",
      icon: HelpCircle,
      description: "Centro de ayuda",
    },
  ];

  // Seleccionar items según el dashboard
  const currentItems = isAdmin ? adminItems : dashboardItems;

  const isActiveRoute = (href: string) => {
    if (href === "/dashboard" || href === "/admin") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      {/* Header del Sidebar */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#0053CC] to-[#01CBFE] flex items-center justify-center">
              <Ticket className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold">
                {isAdmin ? "Admin Panel" : "Dashboard"}
              </h2>
              <p className="text-xs text-muted-foreground">SorykPass</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Contenido del Sidebar */}
      <div className="flex-1 overflow-auto">
        <div className="space-y-2 p-2">
          {/* Navegación Principal */}
          <div className="space-y-1">
            {currentItems.map((item) => (
              <SidebarItem
                key={item.href}
                item={item}
                isActive={isActiveRoute(item.href)}
                collapsed={collapsed}
                onClose={onClose}
              />
            ))}
          </div>

          <Separator className="my-4" />

          {/* Items de Configuración */}
          <div className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                Configuración
              </p>
            )}
            {settingsItems.map((item) => (
              <SidebarItem
                key={item.href}
                item={item}
                isActive={isActiveRoute(item.href)}
                collapsed={collapsed}
                onClose={onClose}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer del Sidebar */}
      <div className="border-t p-2">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#FE4F00] to-[#CC66CC] flex items-center justify-center text-white text-sm font-medium">
            {user?.firstName?.[0] || user?.emailAddresses[0]?.emailAddress[0]?.toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.firstName || user?.emailAddresses[0]?.emailAddress}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {isAdmin ? "Administrador" : "Organizador"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SidebarItemProps {
  item: NavItem;
  isActive: boolean;
  collapsed: boolean;
  onClose?: () => void;
}

function SidebarItem({ item, isActive, collapsed, onClose }: SidebarItemProps) {
  const Icon = item.icon;

  const handleClick = () => {
    // Cerrar sidebar en móviles cuando se hace click
    if (onClose) {
      onClose();
    }
  };

  return (
    <Link href={item.href} onClick={handleClick}>
      <Button
        variant={isActive ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start gap-3 h-10",
          collapsed && "px-2",
          isActive && "bg-accent font-medium"
        )}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left truncate">{item.title}</span>
            {item.badge && (
              <Badge variant="secondary" className="text-xs">
                {item.badge}
              </Badge>
            )}
          </>
        )}
      </Button>
    </Link>
  );
}
