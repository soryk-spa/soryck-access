"use client"

import { useState } from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DashboardNavbarActions } from "@/components/dashboard-navbar-actions";
import {
  Search,
  Menu,
} from "lucide-react";
import { useScrollBehavior } from "@/hooks/use-scroll-behavior";
import { cn } from "@/lib/utils";

interface DashboardNavbarProps {
  onMenuClick?: () => void;
  title?: string;
  showSearch?: boolean;
  actions?: React.ReactNode;
}

export default function DashboardNavbar({ 
  onMenuClick, 
  title = "Dashboard",
  showSearch = true,
  actions 
}: DashboardNavbarProps) {
  const { user } = useUser();
  const { isAtTop } = useScrollBehavior();
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <nav className={cn(
      "fixed top-0 right-0 z-[100] h-16 border-b transition-all duration-200",
      "left-0 lg:left-64", // Ajustamos para dejar espacio a la sidebar en desktop
      isAtTop 
        ? "bg-background/80 backdrop-blur-sm" 
        : "bg-background/95 backdrop-blur-md shadow-sm"
    )}>
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center gap-4">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Title */}
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            <Badge variant="secondary" className="hidden sm:inline-flex">
              {user?.publicMetadata?.role as string || "Usuario"}
            </Badge>
          </div>
        </div>

        {/* Center section - Search */}
        {showSearch && (
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar eventos, tickets..."
                className="pl-9 bg-muted/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Right section */}
        <div className="flex items-center gap-2">
          <DashboardNavbarActions actions={actions} />

          {/* User Menu */}
          <div className="z-[110]">
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                  userButtonPopoverCard: "z-[110]",
                  userButtonPopoverActionButton: "z-[110]"
                }
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
