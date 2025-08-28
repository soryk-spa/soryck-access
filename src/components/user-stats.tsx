"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, Calendar, ShoppingCart } from "lucide-react";

interface UserStatsData {
  totalUsers: number;
  usersByRole: {
    CLIENT: number;
    ORGANIZER: number;
    SCANNER: number;
    ADMIN: number;
  };
  activeUsersThisMonth: number;
  usersWithEvents: number;
  usersWithTickets: number;
}

export default function UserStats() {
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/admin/users/stats");
        if (!response.ok) {
          throw new Error("Error al cargar estadísticas");
        }
        const data = await response.json();
        setStats(data.stats);
      } catch (err) {
        console.error("Error fetching user stats:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <UserStatsSkeleton />;
  }

  if (error || !stats) {
    return (
      <div className="text-center p-4 text-muted-foreground">
        Error al cargar las estadísticas: {error}
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total de Usuarios",
      value: stats.totalUsers.toLocaleString(),
      description: `+${stats.activeUsersThisMonth} este mes`,
      icon: Users,
      trend: stats.activeUsersThisMonth > 0 ? "up" : "neutral"
    },
    {
      title: "Organizadores",
      value: stats.usersByRole.ORGANIZER.toLocaleString(),
      description: `${Math.round((stats.usersByRole.ORGANIZER / stats.totalUsers) * 100)}% del total`,
      icon: UserCheck,
      trend: "neutral"
    },
    {
      title: "Con Eventos",
      value: stats.usersWithEvents.toLocaleString(),
      description: `${Math.round((stats.usersWithEvents / stats.totalUsers) * 100)}% activos`,
      icon: Calendar,
      trend: "neutral"
    },
    {
      title: "Con Tickets",
      value: stats.usersWithTickets.toLocaleString(),
      description: `${Math.round((stats.usersWithTickets / stats.totalUsers) * 100)}% compradores`,
      icon: ShoppingCart,
      trend: "neutral"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsCards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className={`text-xs ${
                card.trend === "up" 
                  ? "text-green-600" 
                  : "text-muted-foreground"
              }`}>
                {card.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function UserStatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-20 bg-muted rounded animate-pulse" />
            <div className="h-4 w-4 bg-muted rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-muted rounded animate-pulse mb-1" />
            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
