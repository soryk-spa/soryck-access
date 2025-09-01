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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  UserPlus,
  UserMinus,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle,
  QrCode,
  Calendar,
  User,
  Mail,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

import { UserRole } from "@prisma/client";

interface Scanner {
  id: string;
  eventId: string;
  scannerId: string;
  assignedBy: string;
  assignedAt: string;
  isActive: boolean;
  event: {
    id: string;
    title: string;
    startDate: string;
    isPublished: boolean;
  };
  scanner: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    role: UserRole;
  };
  assigner: {
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

interface Event {
  id: string;
  title: string;
  startDate: string;
  isPublished: boolean;
}

interface AvailableScanner {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

interface OrganizersScannersManagementProps {
  organizerScanners: Scanner[];
  organizerEvents: Event[];
  availableScanners: AvailableScanner[];
}

export default function OrganizersScannersManagement({
  organizerScanners,
  organizerEvents,
  availableScanners,
}: OrganizersScannersManagementProps) {
  const [scanners, setScanners] = useState<Scanner[]>(organizerScanners);
  const [loading, setLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  // Estados para el formulario de asignación
  const [selectedEventId, setSelectedEventId] = useState("");
  const [selectedScannerId, setSelectedScannerId] = useState("");
  const [emailInput, setEmailInput] = useState("");

  // Función para obtener el nombre completo de un usuario
  const getFullName = (firstName: string | null, lastName: string | null) => {
    const name = [firstName, lastName].filter(Boolean).join(" ");
    return name || "Sin nombre";
  };

  // Función para agregar scanner a un evento
  const handleAssignScanner = async () => {
    if (!selectedEventId || (!selectedScannerId && !emailInput.trim())) {
      toast.error("Por favor selecciona un evento y un validador");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/organizer/scanners/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: selectedEventId,
          scannerId: selectedScannerId || undefined,
          scannerEmail: emailInput.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setScanners([data.scanner, ...scanners]);
        toast.success("Validador asignado exitosamente");
        setAddDialogOpen(false);
        setSelectedEventId("");
        setSelectedScannerId("");
        setEmailInput("");
      } else {
        toast.error(data.error || "Error al asignar validador");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al asignar validador");
    } finally {
      setLoading(false);
    }
  };

  // Función para activar/desactivar scanner
  const handleToggleScanner = async (scannerId: string, currentStatus: boolean) => {
    setLoading(true);
    try {
      const response = await fetch("/api/organizer/scanners/toggle", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scannerId,
          isActive: !currentStatus,
        }),
      });

      if (response.ok) {
        setScanners(scanners.map(scanner => 
          scanner.id === scannerId 
            ? { ...scanner, isActive: !currentStatus }
            : scanner
        ));
        toast.success(
          !currentStatus ? "Validador activado" : "Validador desactivado"
        );
      } else {
        const data = await response.json();
        toast.error(data.error || "Error al cambiar estado del validador");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al cambiar estado del validador");
    } finally {
      setLoading(false);
    }
  };

  // Función para remover scanner
  const handleRemoveScanner = async (scannerId: string) => {
    if (!confirm("¿Estás seguro de que quieres remover este validador?")) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/organizer/scanners/remove", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ scannerId }),
      });

      if (response.ok) {
        setScanners(scanners.filter(scanner => scanner.id !== scannerId));
        toast.success("Validador removido exitosamente");
      } else {
        const data = await response.json();
        toast.error(data.error || "Error al remover validador");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al remover validador");
    } finally {
      setLoading(false);
    }
  };

  // Agrupar scanners por evento
  const scannersByEvent = scanners.reduce((acc, scanner) => {
    const eventId = scanner.eventId;
    if (!acc[eventId]) {
      acc[eventId] = [];
    }
    acc[eventId].push(scanner);
    return acc;
  }, {} as Record<string, Scanner[]>);

  return (
    <div className="space-y-8">
      {/* Stats Cards with Modern Design */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Validadores</CardTitle>
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{scanners.length}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Validadores asignados a tus eventos
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Validadores Activos</CardTitle>
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              {scanners.filter(s => s.isActive).length}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Listos para validar tickets
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Eventos Cubiertos</CardTitle>
            <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
              <Calendar className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {Object.keys(scannersByEvent).length}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Con validadores asignados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section Header with Action Button */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Validadores Asignados</h2>
          <p className="text-muted-foreground">
            Gestiona los validadores que pueden verificar tickets en tus eventos
          </p>
        </div>
        
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
              <UserPlus className="h-4 w-4 mr-2" />
              Asignar Validador
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Asignar Validador a Evento</DialogTitle>
              <DialogDescription>
                Selecciona un evento y un validador para crear una nueva asignación. Puedes usar un validador existente o invitar uno nuevo por email.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="event-select">Evento</Label>
                <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un evento" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizerEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        <div className="flex items-center gap-2">
                          <span>{event.title}</span>
                          {!event.isPublished && (
                            <Badge variant="outline" className="text-xs">
                              No publicado
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Validador</Label>
                <div className="space-y-2">
                  <Select value={selectedScannerId} onValueChange={setSelectedScannerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un validador registrado" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableScanners.map((scanner) => (
                        <SelectItem key={scanner.id} value={scanner.id}>
                          <div className="flex items-center gap-2">
                            <span>{getFullName(scanner.firstName, scanner.lastName)}</span>
                            <span className="text-xs text-muted-foreground">
                              ({scanner.email})
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        O invita por email
                      </span>
                    </div>
                  </div>
                  
                  <Input
                    placeholder="Email del validador"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    type="email"
                    disabled={!!selectedScannerId}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="submit"
                onClick={handleAssignScanner}
                disabled={loading || !selectedEventId || (!selectedScannerId && !emailInput.trim())}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                Asignar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Scanners by Event */}
      {Object.keys(scannersByEvent).length === 0 ? (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-6">
              <QrCode className="h-12 w-12 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold mb-2">No hay validadores asignados</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Comienza asignando validadores a tus eventos para que puedan verificar tickets. 
              Puedes usar validadores existentes o invitar nuevos por email.
            </p>
            <Button 
              onClick={() => setAddDialogOpen(true)}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Asignar Primer Validador
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(scannersByEvent).map(([eventId, eventScanners]) => {
            const event = eventScanners[0]?.event;
            if (!event) return null;

            return (
              <Card key={eventId} className="border-0 shadow-lg">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{event.title}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.startDate).toLocaleDateString("es-CL", {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })} • {eventScanners.length} validador{eventScanners.length !== 1 ? "es" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {event.isPublished ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          ✓ Publicado
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-orange-200 text-orange-700">
                          📝 Borrador
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                          <TableHead className="font-semibold">Validador</TableHead>
                          <TableHead className="font-semibold">Email</TableHead>
                          <TableHead className="font-semibold">Estado</TableHead>
                          <TableHead className="font-semibold">Asignado</TableHead>
                          <TableHead className="text-right font-semibold">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {eventScanners.map((scanner, index) => (
                          <TableRow 
                            key={scanner.id}
                            className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-3">
                                <div className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                  <Shield className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <div className="font-medium">
                                    {getFullName(scanner.scanner.firstName, scanner.scanner.lastName)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Validador #{index + 1}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm">{scanner.scanner.email}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {scanner.isActive ? (
                                <Badge className="bg-green-100 text-green-800 border-green-200">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Activo
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="border-red-200 text-red-700">
                                  <EyeOff className="h-3 w-3 mr-1" />
                                  Inactivo
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="text-sm text-muted-foreground">
                                {new Date(scanner.assignedAt).toLocaleDateString("es-CL", {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleToggleScanner(scanner.id, scanner.isActive)}
                                  disabled={loading}
                                  className={scanner.isActive ? 
                                    "text-orange-600 hover:text-orange-700 hover:bg-orange-50" : 
                                    "text-green-600 hover:text-green-700 hover:bg-green-50"
                                  }
                                >
                                  {scanner.isActive ? (
                                    <>
                                      <EyeOff className="h-3 w-3 mr-1" />
                                      Desactivar
                                    </>
                                  ) : (
                                    <>
                                      <Eye className="h-3 w-3 mr-1" />
                                      Activar
                                    </>
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleRemoveScanner(scanner.id)}
                                  disabled={loading}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <UserMinus className="h-3 w-3 mr-1" />
                                  Remover
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
