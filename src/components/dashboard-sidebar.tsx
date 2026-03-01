"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calendar,
  ChevronLeft,
  Home,
  Menu,
  Settings,
  Tag,
  Ticket,
  User,
  UserCheck,
  Users,
  BarChart3,
  Shield,
  Building,
  Bell,
  HelpCircle,
  Database,
  Armchair,
  Layout,
} from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useUserRole } from "@/hooks/useUserRole";
import { useSidebar } from "@/components/sidebar-context";

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
  const { collapsed, toggleCollapsed } = useSidebar();
  const pathname = usePathname();
  const { user } = useUser();
  const { role: userRole, loading: roleLoading } = useUserRole();

  const isAdmin = pathname.startsWith("/admin");

  const clientItems: NavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home,
      description: "Vista general de tu actividad",
    },
    {
      title: "Mis Tickets",
      href: "/dashboard/tickets",
      icon: Ticket,
      description: "Ver mis tickets comprados",
    },
  ];

  const organizerItems: NavItem[] = [
    {
      title: "Mis Eventos",
      href: "/dashboard/events",
      icon: Calendar,
      description: "Gestiona tus eventos",
    },
    {
      title: "Gestión",
      href: "/dashboard",
      icon: Armchair,
      description: "Venues, scanners y configuración",
    },
    {
      title: "Editor de Venues",
      href: "/dashboard/organizer/venues",
      icon: Layout,
      description: "Editor visual de venues y distribución de asientos",
    },
    {
      title: "Compradores",
      href: "/organizer/buyers",
      icon: UserCheck,
      description: "Usuarios que compraron tickets",
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
      title: "Venues y Asientos",
      href: "/admin/venues",
      icon: Armchair,
      description: "Gestionar venues y plantillas de asientos",
    },
    {
      title: "Reportes",
      href: "/admin/reports",
      icon: BarChart3,
      description: "Estadísticas y análisis",
    },
    {
      title: "Redis",
      href: "/admin/redis",
      icon: Database,
      description: "Monitoreo y configuración de caché",
    },
  ];

  const settingsItems: NavItem[] = [
    {
      title: "Configuración",
      href: "/dashboard/settings",
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

  const getDashboardItems = () => {
    if (isAdmin) return adminItems;
    
    if (roleLoading) return clientItems;
    
    switch (userRole) {
      case "ORGANIZER":
      case "SCANNER":
      case "ADMIN":
        
        return [
          ...clientItems,  
          ...organizerItems.filter(item => item.href !== "/dashboard") 
        ];
      case "CLIENT":
      default:
        return clientItems;
    }
  };

  const currentItems = getDashboardItems();

  const isActiveRoute = (href: string) => {
    
    if (href === "/dashboard" || href === "/admin") {
      return pathname === href;
    }
    
    
    if (href === "/dashboard/events") {
      
      return pathname.startsWith("/dashboard/events") || pathname.startsWith("/organizer/events");
    }
    
    if (href === "/dashboard") {
      
      return pathname === "/dashboard" || 
             (pathname.startsWith("/organizer") && !pathname.startsWith("/organizer/events"));
    }
    
    
    return pathname.startsWith(href);
  };

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-background border-r border-border",
        className
      )}
    >
      {}
      <div className="flex h-16 items-center justify-between px-4 border-b border-border bg-background/95">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-[#0053CC] to-[#01CBFE] flex items-center justify-center">
              <Ticket className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {isAdmin ? "Admin Panel" : "Dashboard"}
              </h2>
              <p className="text-xs text-muted-foreground">SorykPass</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleCollapsed}
          className="h-8 w-8 shrink-0"
        >
          {collapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {}
      <div className="flex-1 overflow-auto">
        <div className="space-y-2 p-2">
          {}
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

          {}
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

      {}
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
    
    if (onClose) {
      onClose();
    }
  };

  const buttonContent = (
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
  );

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={300}>
          <TooltipTrigger asChild>
            <Link href={item.href} onClick={handleClick}>
              {buttonContent}
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            <p>{item.title}</p>
            {item.description && (
              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Link href={item.href} onClick={handleClick}>
      {buttonContent}
    </Link>
  );
}
