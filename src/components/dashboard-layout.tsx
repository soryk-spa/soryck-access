"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import DashboardNavbar from "@/components/dashboard-navbar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  showSearch?: boolean;
  actions?: React.ReactNode;
}

export function DashboardLayout({ 
  children, 
  title = "Dashboard",
  showSearch = true,
  actions 
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {/* Sidebar for desktop */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="w-64">
          <DashboardSidebar />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-background border-r shadow-xl z-[60]">
            <DashboardSidebar onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Dashboard Navbar */}
        <DashboardNavbar
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
          showSearch={showSearch}
          actions={actions}
        />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto pt-16">
          <div className="container mx-auto p-4 lg:p-6 max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
