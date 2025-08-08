"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  UserPlus,
  UserMinus,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  CheckCircle,
  QrCode,
} from "lucide-react";

interface Scanner {
  id: string;
  eventId: string;
  scannerId: string;
  assignedBy: string;
  assignedAt: string;
  isActive: boolean;
  scanner: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: "SCANNER" | "ORGANIZER" | "ADMIN";
  };
  assigner: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

interface EventScannersManagementProps {
  eventId: string;
  initialScanners: Scanner[];
  canManage: boolean;
}

export default function EventScannersManagement({
  eventId,
  initialScanners,
  canManage,
}: EventScannersManagementProps) {
  const [scanners, setScanners] = useState<Scanner[]>(initialScanners);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newScannerEmail, setNewScannerEmail] = useState("");
  const [errors, setErrors] = useState<string[]>([]);
  const [success, setSuccess] = useState<string | null>(null);

  const getScannerName = (scanner: Scanner["scanner"]) => {
    if (scanner.firstName || scanner.lastName) {
      return `${scanner.firstName || ""} ${scanner.lastName || ""}`.trim();
    }
    return scanner.email;
  };

  const getAssignerName = (assigner: Scanner["assigner"]) => {
    if (assigner.firstName || assigner.lastName) {
      return `${assigner.firstName || ""} ${assigner.lastName || ""}`.trim();
    }
    return assigner.email;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "ORGANIZER":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "SCANNER":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  const handleAddScanner = async () => {
    if (!newScannerEmail.trim()) {
      setErrors(["El email es requerido"]);
      return;
    }

    setLoading(true);
    setErrors([]);
    setSuccess(null);

    try {
      const response = await fetch(`/api/events/${eventId}/scanners`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scannerEmail: newScannerEmail.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          type DetailError = { message: string };
          setErrors(data.details.map((err: DetailError) => err.message));
        } else {
          setErrors([data.error || "Error al asignar scanner"]);
        }
        return;
      }

      setScanners([data.assignment, ...scanners]);
      setSuccess("Scanner asignado exitosamente");
      setNewScannerEmail("");
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Error adding scanner:", error);
      setErrors(["Error de conexión"]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (
    scannerId: string,
    currentStatus: boolean
  ) => {
    setLoading(true);

    try {
      const response = await fetch(
        `/api/events/${eventId}/scanners/${scannerId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            isActive: !currentStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrors([data.error || "Error al cambiar estado del scanner"]);
        return;
      }

      setScanners(
        scanners.map((scanner) =>
          scanner.scannerId === scannerId
            ? { ...scanner, isActive: !currentStatus }
            : scanner
        )
      );
      setSuccess(
        `Scanner ${!currentStatus ? "activado" : "desactivado"} exitosamente`
      );
    } catch (error) {
      console.error("Error toggling scanner status:", error);
      setErrors(["Error de conexión"]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveScanner = async (scannerId: string) => {
    if (
      !confirm("¿Estás seguro de que quieres remover este scanner del evento?")
    ) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/events/${eventId}/scanners/${scannerId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErrors([data.error || "Error al remover scanner"]);
        return;
      }

      setScanners(
        scanners.filter((scanner) => scanner.scannerId !== scannerId)
      );
      setSuccess("Scanner removido exitosamente");
    } catch (error) {
      console.error("Error removing scanner:", error);
      setErrors(["Error de conexión"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Scanners del Evento
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Usuarios autorizados para validar tickets de este evento
            </p>
          </div>

          {canManage && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Asignar Scanner
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Asignar Nuevo Scanner</DialogTitle>
                  <DialogDescription>
                    Ingresa el email de la persona que podrá validar tickets
                    para este evento. El usuario debe tener rol de Scanner,
                    Organizador o Administrador.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {errors.length > 0 && (
                    <div className="bg-red-50 dark:bg-red-950 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-red-800 dark:text-red-200 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Errores:</span>
                      </div>
                      <ul className="mt-1 text-sm text-red-700 dark:text-red-300">
                        {errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="scannerEmail">Email del Scanner</Label>
                    <Input
                      id="scannerEmail"
                      type="email"
                      value={newScannerEmail}
                      onChange={(e) => setNewScannerEmail(e.target.value)}
                      placeholder="scanner@ejemplo.com"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddScanner();
                        }
                      }}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleAddScanner} disabled={loading}>
                    {loading && (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    Asignar Scanner
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {success && (
          <div className="mb-4 bg-green-50 dark:bg-green-950 border border-green-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-200 text-sm">
              <CheckCircle className="h-4 w-4" />
              <span>{success}</span>
            </div>
          </div>
        )}

        {scanners.length > 0 ? (
          <div className="space-y-4">
            {scanners.map((scanner) => (
              <div
                key={scanner.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="font-medium">
                      {getScannerName(scanner.scanner)}
                    </div>
                    <Badge className={getRoleBadgeColor(scanner.scanner.role)}>
                      {scanner.scanner.role}
                    </Badge>
                    <Badge variant={scanner.isActive ? "default" : "secondary"}>
                      {scanner.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>📧 {scanner.scanner.email}</p>
                    <p>👤 Asignado por: {getAssignerName(scanner.assigner)}</p>
                    <p>
                      📅 Asignado:{" "}
                      {new Date(scanner.assignedAt).toLocaleDateString("es-CL")}
                    </p>
                  </div>
                </div>

                {canManage && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleToggleActive(scanner.scannerId, scanner.isActive)
                      }
                      disabled={loading}
                    >
                      {scanner.isActive ? (
                        <>
                          <EyeOff className="h-4 w-4 mr-1" />
                          Desactivar
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-1" />
                          Activar
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveScanner(scanner.scannerId)}
                      disabled={loading}
                      className="text-destructive hover:text-destructive"
                    >
                      <UserMinus className="h-4 w-4 mr-1" />
                      Remover
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No hay scanners asignados
            </h3>
            <p className="text-muted-foreground mb-4">
              Asigna scanners para que puedan validar tickets en este evento
            </p>
            {canManage && (
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Asignar Primer Scanner
              </Button>
            )}
          </div>
        )}

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-medium mb-2">ℹ️ Información sobre Scanners</h4>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              • Los <strong>Scanners</strong> solo pueden validar tickets de
              eventos asignados
            </p>
            <p>
              • Los <strong>Organizadores</strong> pueden validar tickets de sus
              propios eventos
            </p>
            <p>
              • Los <strong>Administradores</strong> pueden validar cualquier
              ticket
            </p>
            <p>• Solo usuarios activos pueden escanear tickets</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
