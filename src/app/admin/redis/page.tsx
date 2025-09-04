"use client";

import { RedisMonitor } from "@/components/redis-monitor";
import { RedisConfigPanel } from "@/components/redis-config-panel";

export default function RedisAdminPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administración de Redis</h1>
          <p className="text-muted-foreground">
            Monitoreo, configuración y gestión del sistema de caché
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {}
        <div>
          <RedisConfigPanel />
        </div>

        {}
        <div>
          <RedisMonitor />
        </div>
      </div>
    </div>
  );
}
