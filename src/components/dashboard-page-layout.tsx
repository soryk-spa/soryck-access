"use client";

import { DashboardHeader } from "@/components/dashboard-header";
import { LucideIcon } from "lucide-react";

interface DashboardPageLayoutProps {
  children: React.ReactNode;
  header: {
    title: string;
    description: string;
    greeting?: string;
    stats?: Array<{
      icon: LucideIcon;
      label: string;
      value: string | number;
    }>;
    actions?: Array<{
      label: string;
      href: string;
      icon: LucideIcon;
      variant?: "default" | "outline" | "secondary";
    }>;
    badge?: {
      label: string;
      variant?: "default" | "secondary" | "outline";
    };
    backgroundIcon?: LucideIcon;
    gradient?: string;
  };
  className?: string;
}

export function DashboardPageLayout({ children, header, className = "" }: DashboardPageLayoutProps) {
  return (
    <div className={`space-y-8 ${className}`}>
      <DashboardHeader {...header} />
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}
