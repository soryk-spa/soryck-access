"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Shield, AlertTriangle } from "lucide-react";

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
}

interface ChangeRoleModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onRoleChanged: () => void;
}

const roleLabels = {
  CLIENT: "Cliente",
  ORGANIZER: "Organizador",
  SCANNER: "Escáner",
  ADMIN: "Administrador",
};

const roleDescriptions = {
  CLIENT: "Puede comprar tickets y ver eventos",
  ORGANIZER: "Puede crear y gestionar eventos",
  SCANNER: "Puede escanear tickets en eventos",
  ADMIN: "Acceso completo a la administración",
};

const roleColors = {
  CLIENT: "bg-blue-100 text-blue-800",
  ORGANIZER: "bg-green-100 text-green-800",
  SCANNER: "bg-yellow-100 text-yellow-800",
  ADMIN: "bg-red-100 text-red-800",
};

export default function ChangeRoleModal({
  user,
  isOpen,
  onClose,
  onRoleChanged,
}: ChangeRoleModalProps) {
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleChange = async () => {
    if (!user || !selectedRole) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (!response.ok) {
        throw new Error("Error al cambiar rol");
      }

      onRoleChanged();
      onClose();
    } catch (error) {
      console.error("Error changing role:", error);
      alert("Error al cambiar el rol del usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedRole("");
    onClose();
  };

  if (!user) return null;

  const userName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.email;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Cambiar Rol de Usuario
          </DialogTitle>
          <DialogDescription>
            Cambia el rol de acceso para {userName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Usuario</Label>
            <div className="flex items-center gap-2">
              <span className="font-medium">{userName}</span>
              <Badge 
                variant="secondary"
                className={roleColors[user.role as keyof typeof roleColors]}
              >
                {roleLabels[user.role as keyof typeof roleLabels]}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Nuevo Rol</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    <div className="flex items-center justify-between w-full min-w-0">
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant="secondary"
                          className={roleColors[value as keyof typeof roleColors]}
                        >
                          {label}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {roleDescriptions[value as keyof typeof roleDescriptions]}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedRole === "ADMIN" && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">¡Atención!</p>
                <p className="text-yellow-700">
                  Este usuario tendrá acceso completo al panel de administración.
                </p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleRoleChange}
            disabled={!selectedRole || selectedRole === user.role || loading}
          >
            {loading ? "Guardando..." : "Cambiar Rol"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
