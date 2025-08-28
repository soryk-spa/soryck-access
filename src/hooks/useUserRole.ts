"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

export interface UserRole {
  role: "CLIENT" | "ORGANIZER" | "SCANNER" | "ADMIN";
  loading: boolean;
  error: string | null;
}

export function useUserRole(): UserRole {
  const { user } = useUser();
  const [role, setRole] = useState<"CLIENT" | "ORGANIZER" | "SCANNER" | "ADMIN">("CLIENT");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch("/api/user/role");
        
        if (!response.ok) {
          throw new Error("Error al obtener el rol del usuario");
        }

        const data = await response.json();
        setRole(data.role || "CLIENT");
      } catch (err) {
        console.error("Error fetching user role:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
        setRole("CLIENT"); // Fallback a CLIENT en caso de error
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return { role, loading, error };
}
