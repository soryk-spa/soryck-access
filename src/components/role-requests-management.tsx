"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  User,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Eye,
  Filter,
  Search,
  UserCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { UserRole } from "@prisma/client";

interface RoleRequest {
  id: string;
  userId: string;
  currentRole: UserRole;
  requestedRole: UserRole;
  message: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
    createdAt: string;
  };
}

interface RoleRequestsManagementProps {
  initialRequests: RoleRequest[];
  currentUserRole: UserRole;
}

const ROLE_LABELS: Record<UserRole, string> = {
  CLIENT: "Cliente",
  ORGANIZER: "Organizador",
  SCANNER: "Scanner",
  ADMIN: "Administrador",
};

const ROLE_COLORS: Record<UserRole, string> = {
  CLIENT: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  ORGANIZER:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  SCANNER:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  ADMIN:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
};

const STATUS_COLORS = {
  PENDING:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  APPROVED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

export default function RoleRequestsManagement({
  initialRequests,
}: RoleRequestsManagementProps) {
  const [requests, setRequests] = useState<RoleRequest[]>(initialRequests);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<
    "ALL" | "PENDING" | "APPROVED" | "REJECTED"
  >("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<RoleRequest | null>(
    null
  );
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<"APPROVE" | "REJECT">(
    "APPROVE"
  );
  const [reviewMessage, setReviewMessage] = useState("");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  const filteredRequests = requests.filter((request) => {
    const matchesFilter = filter === "ALL" || request.status === filter;
    const matchesSearch =
      !searchTerm ||
      request.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.user.firstName &&
        request.user.firstName
          .toLowerCase()
          .includes(searchTerm.toLowerCase())) ||
      (request.user.lastName &&
        request.user.lastName.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const handleReviewRequest = async (
    requestId: string,
    action: "APPROVE" | "REJECT"
  ) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/role-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: action.toLowerCase(),
          message: reviewMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al procesar la solicitud");
      }

      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status: action === "APPROVE" ? "APPROVED" : "REJECTED",
                reviewedAt: new Date().toISOString(),
              }
            : req
        )
      );

      toast.success(
        action === "APPROVE"
          ? "Solicitud aprobada exitosamente"
          : "Solicitud rechazada"
      );

      setReviewDialogOpen(false);
      setSelectedRequest(null);
      setReviewMessage("");
    } catch (error) {
      console.error("Error reviewing request:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al procesar la solicitud"
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleCardExpansion = (requestId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  const getUserDisplayName = (user: RoleRequest["user"]) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user.firstName) {
      return user.firstName;
    }
    return user.email;
  };

  const getUserInitials = (user: RoleRequest["user"]) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`;
    }
    if (user.firstName) {
      return user.firstName[0];
    }
    return user.email[0].toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: RoleRequest["status"]) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4" />;
      case "APPROVED":
        return <CheckCircle2 className="h-4 w-4" />;
      case "REJECTED":
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: RoleRequest["status"]) => {
    switch (status) {
      case "PENDING":
        return "Pendiente";
      case "APPROVED":
        return "Aprobada";
      case "REJECTED":
        return "Rechazada";
    }
  };

  const pendingCount = requests.filter((r) => r.status === "PENDING").length;

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#0053CC]" />
            Filtros y Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar Usuario</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Email o nombre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filter">Estado</Label>
              <Select
                value={filter}
                onValueChange={(value: "ALL" | "PENDING" | "APPROVED" | "REJECTED") => setFilter(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Todas las solicitudes</SelectItem>
                  <SelectItem value="PENDING">Pendientes</SelectItem>
                  <SelectItem value="APPROVED">Aprobadas</SelectItem>
                  <SelectItem value="REJECTED">Rechazadas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Resultados</Label>
              <div className="flex items-center gap-2 pt-2">
                <Badge variant="outline" className="text-sm">
                  {filteredRequests.length} encontradas
                </Badge>
                {pendingCount > 0 && (
                  <Badge variant="destructive" className="text-sm">
                    {pendingCount} pendientes
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white dark:bg-gray-800">
            <CardContent className="py-16 text-center">
              <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <UserCheck className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No se encontraron solicitudes
              </h3>
              <p className="text-muted-foreground">
                {filter === "ALL"
                  ? "No hay solicitudes de cambio de rol en el sistema."
                  : `No hay solicitudes con estado "${getStatusLabel(filter as "PENDING" | "APPROVED" | "REJECTED")}".`}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRequests.map((request) => {
            const isExpanded = expandedCards.has(request.id);

            return (
              <Card
                key={request.id}
                className={`border-0 shadow-lg bg-white dark:bg-gray-800 transition-all duration-200 ${
                  request.status === "PENDING"
                    ? "ring-2 ring-yellow-200 dark:ring-yellow-800"
                    : ""
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    {/* Información del usuario */}
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={request.user.imageUrl || undefined} />
                        <AvatarFallback className="bg-[#0053CC] text-white">
                          {getUserInitials(request.user)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">
                            {getUserDisplayName(request.user)}
                          </h3>
                          <Badge
                            className={`text-xs ${STATUS_COLORS[request.status]}`}
                          >
                            <span className="flex items-center gap-1">
                              {getStatusIcon(request.status)}
                              {getStatusLabel(request.status)}
                            </span>
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            {request.user.email}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(request.createdAt)}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mb-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              De:
                            </span>
                            <Badge
                              className={`text-xs ${ROLE_COLORS[request.currentRole]}`}
                            >
                              {ROLE_LABELS[request.currentRole]}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              A:
                            </span>
                            <Badge
                              className={`text-xs ${ROLE_COLORS[request.requestedRole]}`}
                            >
                              {ROLE_LABELS[request.requestedRole]}
                            </Badge>
                          </div>
                        </div>

                        {/* Mensaje de solicitud */}
                        <div
                          className={`bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 ${!isExpanded ? "cursor-pointer" : ""}`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <MessageSquare className="h-4 w-4 text-[#0053CC]" />
                                <span className="text-sm font-medium">
                                  Justificación
                                </span>
                              </div>
                              <p
                                className={`text-sm text-muted-foreground ${
                                  !isExpanded && request.message.length > 150
                                    ? "line-clamp-3"
                                    : ""
                                }`}
                              >
                                {request.message}
                              </p>
                              {request.message.length > 150 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() =>
                                    toggleCardExpansion(request.id)
                                  }
                                  className="mt-2 h-auto p-1 text-xs"
                                >
                                  {isExpanded ? (
                                    <>
                                      <ChevronUp className="h-3 w-3 mr-1" />
                                      Ver menos
                                    </>
                                  ) : (
                                    <>
                                      <ChevronDown className="h-3 w-3 mr-1" />
                                      Ver más
                                    </>
                                  )}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Información adicional cuando está expandido */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">
                                  Usuario desde:
                                </span>
                                <div className="font-medium">
                                  {formatDate(request.user.createdAt)}
                                </div>
                              </div>
                              {request.reviewedAt && (
                                <div>
                                  <span className="text-muted-foreground">
                                    Revisado:
                                  </span>
                                  <div className="font-medium">
                                    {formatDate(request.reviewedAt)}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-col gap-2">
                      {request.status === "PENDING" && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setReviewAction("APPROVE");
                              setReviewDialogOpen(true);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={loading}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedRequest(request);
                              setReviewAction("REJECT");
                              setReviewDialogOpen(true);
                            }}
                            disabled={loading}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Rechazar
                          </Button>
                        </>
                      )}

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleCardExpansion(request.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {isExpanded ? "Contraer" : "Ver detalles"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Dialog de revisión */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {reviewAction === "APPROVE" ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              {reviewAction === "APPROVE"
                ? "Aprobar Solicitud"
                : "Rechazar Solicitud"}
            </DialogTitle>
            <DialogDescription>
              {selectedRequest && (
                <>
                  {reviewAction === "APPROVE"
                    ? `¿Estás seguro de que quieres aprobar la solicitud de ${getUserDisplayName(selectedRequest.user)} para convertirse en ${ROLE_LABELS[selectedRequest.requestedRole]}?`
                    : `¿Estás seguro de que quieres rechazar la solicitud de ${getUserDisplayName(selectedRequest.user)}?`}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">
                    {getUserDisplayName(selectedRequest.user)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>De: {ROLE_LABELS[selectedRequest.currentRole]}</span>
                  <span>→</span>
                  <span>A: {ROLE_LABELS[selectedRequest.requestedRole]}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-message">
                  {reviewAction === "APPROVE"
                    ? "Mensaje de aprobación (opcional)"
                    : "Razón del rechazo"}
                </Label>
                <Textarea
                  id="review-message"
                  placeholder={
                    reviewAction === "APPROVE"
                      ? "Mensaje opcional para el usuario..."
                      : "Explica por qué se rechaza la solicitud..."
                  }
                  value={reviewMessage}
                  onChange={(e) => setReviewMessage(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>

              {reviewAction === "REJECT" && !reviewMessage && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Se recomienda proporcionar una razón para el rechazo.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setReviewDialogOpen(false);
                setSelectedRequest(null);
                setReviewMessage("");
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={() =>
                selectedRequest &&
                handleReviewRequest(selectedRequest.id, reviewAction)
              }
              disabled={loading}
              className={
                reviewAction === "APPROVE"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Procesando...
                </div>
              ) : reviewAction === "APPROVE" ? (
                "Aprobar"
              ) : (
                "Rechazar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
