"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface DashboardHeaderProps {
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
}

export function DashboardHeader({
  title,
  description,
  greeting,
  stats = [],
  actions = [],
  badge,
  backgroundIcon: BackgroundIcon,
  gradient = "from-indigo-600 via-blue-600 to-purple-600"
}: DashboardHeaderProps) {
  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${gradient} p-8 text-white shadow-2xl`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${gradient.replace('to-purple-600', 'to-purple-600/90')}`}></div>
      
      {BackgroundIcon && (
        <div className="absolute top-4 right-4 opacity-20">
          <BackgroundIcon className="h-32 w-32" />
        </div>
      )}
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-bold">
                {title}
              </h1>
              {badge && (
                <Badge variant={badge.variant || "secondary"} className="bg-white/20 text-white border-white/30">
                  {badge.label}
                </Badge>
              )}
            </div>
            
            <p className="text-blue-100 text-lg mb-4">
              {greeting && <span>{greeting}, </span>}
              {description}
            </p>
            
            {stats.length > 0 && (
              <div className="flex flex-wrap items-center gap-4 text-blue-100 text-sm">
                {stats.map((stat, index) => (
                  <div key={index} className="flex items-center gap-1">
                    <stat.icon className="h-4 w-4" />
                    <span>{stat.value} {stat.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {actions.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  size="lg"
                  variant={action.variant === "outline" ? "outline" : "default"}
                  className={
                    action.variant === "outline" 
                      ? "border-white/30 text-white hover:bg-white/10" 
                      : "bg-white text-indigo-600 hover:bg-gray-100"
                  }
                  asChild
                >
                  <Link href={action.href}>
                    <action.icon className="w-5 h-5 mr-2" />
                    {action.label}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
