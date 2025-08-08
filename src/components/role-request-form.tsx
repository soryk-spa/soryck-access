"use client";
import { useState } from "react";
import { UserRole } from "@prisma/client";
import { useRoles } from "@/hooks/use-roles";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_LABELS, ROLE_COLORS, ROLE_DESCRIPTIONS } from "@/lib/roles";
import { Mail, Send, CheckCircle, Loader2, Info } from "lucide-react";
import { toast } from "sonner";

export function RoleRequestForm() {
  const { user, isClient } = useRoles();
  const [message, setMessage] = useState("");
  const [requestedRole, setRequestedRole] = useState<UserRole | "">("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!user || !isClient) {
    return null;
  }

  const availableRoles = [
    { value: UserRole.SCANNER, label: "Scanner" },
    { value: UserRole.ORGANIZER, label: "Organizador" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!requestedRole) {
      toast.error("Por favor selecciona un rol");
      return;
    }

    if (!message.trim()) {
      toast.error("Por favor describe por qué quieres este rol");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/user/request-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestedRole,
          message: message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Error al enviar solicitud");
      }

      setSubmitted(true);
      toast.success("Solicitud enviada exitosamente");
    } catch (error) {
      console.error("Error submitting role request:", error);
      toast.error("Error al enviar la solicitud");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Solicitud Enviada</h3>
            <p className="text-muted-foreground">
              Tu solicitud para obtener el rol de{" "}
              <strong>{ROLE_LABELS[requestedRole as UserRole]}</strong> ha sido
              enviada. Te contactaremos pronto con una respuesta.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Solicitar Nuevo Rol
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">Rol actual:</span>
            <Badge className={ROLE_COLORS[user.role]}>
              {ROLE_LABELS[user.role]}
            </Badge>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="requestedRole">¿Qué rol quieres solicitar?</Label>
              <Select
                value={requestedRole}
                onValueChange={(value) =>
                  setRequestedRole(value as UserRole | "")
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <span>{ROLE_LABELS[role.value]}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {requestedRole && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          className={ROLE_COLORS[requestedRole as UserRole]}
                        >
                          {ROLE_LABELS[requestedRole as UserRole]}
                        </Badge>
                      </div>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {ROLE_DESCRIPTIONS[requestedRole as UserRole]}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="message">
                ¿Por qué quieres obtener este rol?
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  requestedRole === UserRole.SCANNER
                    ? "Describe tu experiencia validando entradas, en qué eventos te gustaría trabajar como scanner, etc..."
                    : requestedRole === UserRole.ORGANIZER
                    ? "Describe tu experiencia organizando eventos, tus planes, o cualquier información relevante..."
                    : "Describe por qué quieres este rol y cómo lo utilizarías..."
                }
                className="mt-2 min-h-[120px]"
                required
              />
            </div>

            {requestedRole && (
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
                <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                  Como {ROLE_LABELS[requestedRole as UserRole]} podrás:
                </h4>
                <ul className="text-sm text-green-800 dark:text-green-200 space-y-1">
                  {requestedRole === UserRole.SCANNER && (
                    <>
                      <li>
                        • Validar tickets con códigos QR en eventos asignados
                      </li>
                      <li>
                        • Acceder a la herramienta de verificación de tickets
                      </li>
                      <li>• Ver información básica de los asistentes</li>
                      <li>• Trabajar como staff en eventos</li>
                    </>
                  )}
                  {requestedRole === UserRole.ORGANIZER && (
                    <>
                      <li>• Crear y gestionar eventos</li>
                      <li>• Vender tickets para tus eventos</li>
                      <li>• Acceder a estadísticas de ventas</li>
                      <li>• Gestionar participantes y scanners</li>
                      <li>• Validar tickets de tus propios eventos</li>
                    </>
                  )}
                </ul>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !message.trim() || !requestedRole}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Enviar Solicitud
                </>
              )}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
