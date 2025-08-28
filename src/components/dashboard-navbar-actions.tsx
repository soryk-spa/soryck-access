"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Plus,
  ChevronDown,
  Zap,
  HelpCircle,
  Settings,
} from "lucide-react";
import Link from "next/link";

interface DashboardNavbarActionsProps {
  actions?: React.ReactNode;
}

export function DashboardNavbarActions({ actions }: DashboardNavbarActionsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Custom actions */}
      {actions}

      {/* Quick Actions Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Crear</span>
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 z-[110]">
          <DropdownMenuLabel>Acciones Rápidas</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/organizer/events/create" className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Evento
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/organizer/promo-codes/create" className="flex items-center">
              <Zap className="mr-2 h-4 w-4" />
              Código Promocional
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Notifications */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 z-[110]">
          <DropdownMenuLabel>Notificaciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <div className="p-4 text-sm text-muted-foreground">
            No tienes notificaciones nuevas
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Help */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/help">
          <HelpCircle className="h-4 w-4" />
        </Link>
      </Button>

      {/* Settings */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/dashboard/settings">
          <Settings className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
