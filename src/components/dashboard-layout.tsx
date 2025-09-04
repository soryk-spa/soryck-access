"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import DashboardNavbar from "@/components/dashboard-navbar";
import { SidebarProvider, useSidebar } from "@/components/sidebar-context";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  showSearch?: boolean;
  actions?: React.ReactNode;
}

function DashboardLayoutContent({ 
  children, 
  title = "Dashboard",
  showSearch = true,
  actions 
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { collapsed } = useSidebar();

  return (
    <div className="h-screen flex overflow-hidden bg-background">
      {}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className={`transition-all duration-300 ease-in-out ${collapsed ? 'w-16' : 'w-64'}`}>
          <DashboardSidebar />
        </div>
      </div>

      {}
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

      {}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {}
        <DashboardNavbar
          onMenuClick={() => setSidebarOpen(true)}
          title={title}
          showSearch={showSearch}
          actions={actions}
        />

        {}
        <main className={`flex-1 overflow-y-auto transition-all duration-300 ease-in-out pt-16 ${
          collapsed ? 'lg:ml-0' : 'lg:ml-0'
        }`}>
          <div className="container mx-auto p-4 lg:p-6 max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <DashboardLayoutContent {...props} />
    </SidebarProvider>
  );
}
