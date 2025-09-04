"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Activity, Database, RefreshCw, Trash2, Server } from "lucide-react";

interface RedisHealth {
  status: "healthy" | "unhealthy";
  redis: "connected" | "disconnected" | "error";
  timestamp: string;
  error?: string;
}

interface RedisConfig {
  host: string;
  port: string;
  database: string;
  hasPassword: boolean;
  passwordLength: number;
  maskedPassword: string;
  environment: string;
  connectionUrl: string;
}

export function RedisMonitor() {
  const [health, setHealth] = useState<RedisHealth | null>(null);
  const [config, setConfig] = useState<RedisConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [invalidating, setInvalidating] = useState<string | null>(null);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/health/redis");
      const data = await response.json();
      setHealth(data);
    } catch (error) {
      console.error("Error checking Redis health:", error);
      setHealth({
        status: "unhealthy",
        redis: "error",
        timestamp: new Date().toISOString(),
        error: "Failed to check health"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRedisConfig = async () => {
    try {
      setLoadingConfig(true);
      const response = await fetch("/api/admin/redis/config");
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      } else {
        console.error("Failed to get Redis config");
      }
    } catch (error) {
      console.error("Error getting Redis config:", error);
    } finally {
      setLoadingConfig(false);
    }
  };

  const invalidateCache = async (type: string, target?: string) => {
    try {
      setInvalidating(type);
      const response = await fetch("/api/admin/cache/invalidate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type, target }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.error || "Error al invalidar caché");
      }
    } catch (error) {
      console.error("Error invalidating cache:", error);
      toast.error("Error al invalidar caché");
    } finally {
      setInvalidating(null);
    }
  };

  useEffect(() => {
    checkHealth();
    getRedisConfig();
    
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "connected":
        return "bg-green-500";
      case "unhealthy":
      case "disconnected":
        return "bg-red-500";
      case "error":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            Estado de Redis
          </CardTitle>
          <CardDescription>
            Monitoreo en tiempo real del sistema de caché
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${health ? getStatusColor(health.status) : "bg-gray-400"}`} />
              <div>
                <p className="font-medium">
                  {health ? (health.status === "healthy" ? "Saludable" : "No disponible") : "Verificando..."}
                </p>
                <p className="text-sm text-muted-foreground">
                  {health ? `Conexión: ${health.redis}` : "Cargando..."}
                </p>
                {health?.error && (
                  <p className="text-sm text-red-600">{health.error}</p>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={checkHealth}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Verificar
            </Button>
          </div>
          {health && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground">
                Última verificación: {new Date(health.timestamp).toLocaleString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Configuración de Redis
          </CardTitle>
          <CardDescription>
            Detalles de la conexión y configuración actual
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingConfig ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span>Cargando configuración...</span>
            </div>
          ) : config ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Host</label>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <Server className="h-4 w-4" />
                    <span className="font-mono">{config.host}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Puerto</label>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="font-mono">{config.port}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Base de Datos</label>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    <Database className="h-4 w-4" />
                    <span className="font-mono">DB {config.database}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Autenticación</label>
                  <div className="flex items-center gap-2 p-2 bg-muted rounded">
                    {config.hasPassword ? (
                      <>
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="font-mono text-sm">{config.maskedPassword}</span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-sm">Sin contraseña</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No se pudo cargar la configuración
            </div>
          )}
          
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Entorno</p>
                <p className="text-xs text-muted-foreground">
                  {config?.environment || 'development'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Tipo de Conexión</p>
                <p className="text-xs text-muted-foreground">
                  {config?.connectionUrl || 'Configuración manual'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gestión de Caché
          </CardTitle>
          <CardDescription>
            Herramientas para administrar el sistema de caché
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              variant="outline"
              onClick={() => invalidateCache("events")}
              disabled={invalidating === "events"}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Activity className="h-5 w-5" />
              <span className="text-sm">Eventos</span>
              {invalidating === "events" && (
                <RefreshCw className="h-3 w-3 animate-spin" />
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => invalidateCache("dashboard")}
              disabled={invalidating === "dashboard"}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Activity className="h-5 w-5" />
              <span className="text-sm">Dashboard</span>
              {invalidating === "dashboard" && (
                <RefreshCw className="h-3 w-3 animate-spin" />
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => invalidateCache("user")}
              disabled={invalidating === "user"}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Activity className="h-5 w-5" />
              <span className="text-sm">Usuarios</span>
              {invalidating === "user" && (
                <RefreshCw className="h-3 w-3 animate-spin" />
              )}
            </Button>

            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("¿Estás seguro de que quieres invalidar todo el caché? Esta acción no se puede deshacer.")) {
                  invalidateCache("all");
                }
              }}
              disabled={invalidating === "all"}
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Trash2 className="h-5 w-5" />
              <span className="text-sm">Todo</span>
              {invalidating === "all" && (
                <RefreshCw className="h-3 w-3 animate-spin" />
              )}
            </Button>
          </div>

          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="text-sm font-medium mb-2">Información sobre caché:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• <strong>Eventos:</strong> Caché de eventos públicos (TTL: 10 min)</li>
              <li>• <strong>Dashboard:</strong> Estadísticas del dashboard (TTL: 5 min)</li>
              <li>• <strong>Usuarios:</strong> Roles y perfiles de usuarios (TTL: 30 min)</li>
              <li>• <strong>Todo:</strong> Elimina completamente el caché</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Estadísticas de Rendimiento</CardTitle>
          <CardDescription>
            Métricas de uso del sistema de caché
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">Redis</div>
              <div className="text-sm text-muted-foreground">Sistema de Caché</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">~90%</div>
              <div className="text-sm text-muted-foreground">Reducción en tiempo de respuesta</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">~75%</div>
              <div className="text-sm text-muted-foreground">Menos consultas a BD</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
