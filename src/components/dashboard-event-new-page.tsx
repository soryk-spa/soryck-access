"use client";

import CreateEventForm from "@/components/create-event-form";
import { DashboardPageLayout } from "@/components/dashboard-page-layout";
import { CalendarPlus } from "lucide-react";
import type { Category } from "@/types";

interface DashboardEventNewPageProps {
  categories: Category[];
}

export function DashboardEventNewPage({ categories }: DashboardEventNewPageProps) {
  return (
    <DashboardPageLayout
      header={{
        title: "Crear Nuevo Evento",
        description: "Completa los detalles de tu evento y comienza a vender entradas",
        backgroundIcon: CalendarPlus,
        gradient: "from-blue-500 to-purple-600",
        badge: {
          label: "Nuevo Evento",
          variant: "secondary",
        },
        actions: [
          {
            label: "Ver Eventos",
            href: "/dashboard/events",
            icon: CalendarPlus,
            variant: "outline",
          },
        ],
      }}
    >
      <div className="p-6">
        <CreateEventForm categories={categories} mode="create" />
      </div>
    </DashboardPageLayout>
  );
}
