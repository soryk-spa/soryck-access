"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Eye, EyeOff, RefreshCw, Settings } from "lucide-react";
import { toast } from "sonner";

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

export function RedisConfigPanel() {
  const [config, setConfig] = useState<RedisConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const getRedisConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/redis/config");
      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      } else {
        console.error("Failed to get Redis config");
        toast.error("Error al cargar configuración de Redis");
      }
    } catch (error) {
      console.error("Error getting Redis config:", error);
      toast.error("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  useEffect(() => {
    getRedisConfig();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Cargando configuración de Redis...</span>
        </CardContent>
      </Card>
    );
  }

  if (!config) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">No se pudo cargar la configuración</p>
          <Button onClick={getRedisConfig} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configuración de Redis
        </CardTitle>
        <CardDescription>
          Variables de entorno y configuración de conexión
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Host/Servidor</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-muted rounded font-mono text-sm">
                  {config.host}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(config.host, "Host")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Puerto</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-muted rounded font-mono text-sm">
                  {config.port}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(config.port, "Puerto")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Base de Datos</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-muted rounded font-mono text-sm">
                  DB {config.database}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(config.database, "Base de datos")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Autenticación</label>
              <div className="p-3 bg-muted rounded">
                {config.hasPassword ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">Protegido</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm">Sin contraseña</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium">Información del Entorno</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Ocultar detalles
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Ver detalles
                  </>
                )}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Entorno</label>
                <div className="mt-1">
                  <Badge variant={config.environment === 'production' ? 'destructive' : 'secondary'}>
                    {config.environment.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Tipo de Conexión</label>
                <div className="mt-1">
                  <Badge variant="outline">
                    {config.connectionUrl}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {}
          {showDetails && (
            <div className="border-t pt-4 space-y-4">
              <h4 className="text-sm font-medium">Variables de Entorno</h4>
              
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">REDIS_HOST</span>
                    <span className="font-mono text-xs text-muted-foreground">{config.host}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">REDIS_PORT</span>
                    <span className="font-mono text-xs text-muted-foreground">{config.port}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">REDIS_DB</span>
                    <span className="font-mono text-xs text-muted-foreground">{config.database}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">REDIS_PASSWORD</span>
                    <span className="font-mono text-xs text-muted-foreground">
                      {config.hasPassword ? config.maskedPassword : "No configurada"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                <p>💡 <strong>Tip:</strong> Para cambiar la configuración, actualiza las variables de entorno en tu archivo .env</p>
              </div>
            </div>
          )}

          {}
          <div className="border-t pt-4">
            <Button
              variant="outline"
              onClick={getRedisConfig}
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar Configuración
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
