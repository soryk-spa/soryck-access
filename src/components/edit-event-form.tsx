"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import ImageUpload from "@/components/image-upload-simple";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Calendar,
  MapPin,
  Users,
  DollarSign,
  Loader2,
  AlertTriangle,
  Save,
  ArrowLeft,
  Eye,
  EyeOff,
  Trash2,
  Info,
  Clock,
  CheckCircle,
  ImageIcon,
} from "lucide-react";
import { UserRole } from "@prisma/client";

interface Category {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: UserRole;
}

interface Event {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  location: string;
  startDate: string;
  endDate: string | null;
  price: number;
  currency: string;
  capacity: number;
  isPublished: boolean;
  isFree: boolean;
  createdAt: string;
  updatedAt: string;
  category: {
    id: string;
    name: string;
  };
  organizer: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  _count: {
    tickets: number;
    orders: number;
  };
}

interface EditEventFormProps {
  event: Event;
  categories: Category[];
  user: User;
}

export default function EditEventForm({
  event,
  categories,
}: EditEventFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getDateTimeValues = (dateString: string | null) => {
    if (!dateString) return { date: "", time: "" };
    const date = new Date(dateString);
    const dateStr = date.toISOString().split("T")[0];
    const timeStr = date.toTimeString().slice(0, 5);
    return { date: dateStr, time: timeStr };
  };

  const startDateTime = getDateTimeValues(event.startDate);
  const endDateTime = getDateTimeValues(event.endDate);

  const [formData, setFormData] = useState({
    title: event.title,
    description: event.description || "",
    location: event.location,
    startDate: startDateTime.date,
    startTime: startDateTime.time,
    endDate: endDateTime.date,
    endTime: endDateTime.time,
    categoryId: event.category.id,
    capacity: event.capacity,
    price: event.price,
    isFree: event.isFree,
    imageUrl: event.imageUrl || "",
  });

  const combineDateTime = (date: string, time: string) => {
    if (!date) return "";
    if (!time) return `${date}T00:00:00`;
    return `${date}T${time}:00`;
  };

  const hasTicketsSold = event._count.tickets > 0;

  const handleSubmit = async () => {
    setLoading(true);
    setFormErrors([]);

    try {
      const startDateTime = combineDateTime(
        formData.startDate,
        formData.startTime
      );
      const endDateTime = formData.endDate
        ? combineDateTime(formData.endDate, formData.endTime)
        : undefined;

      const eventData = {
        title: formData.title,
        description: formData.description || undefined,
        location: formData.location,
        startDate: startDateTime,
        endDate: endDateTime,
        categoryId: formData.categoryId,
        capacity: formData.capacity,
        price: formData.price,
        isFree: formData.isFree,
        imageUrl: formData.imageUrl || undefined,
      };

      const response = await fetch(`/api/events/${event.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(eventData),
      });

      const result = await response.json();

      interface ErrorDetail {
        message: string;
        [key: string]: unknown;
      }

      if (!response.ok) {
        if (result.details) {
          setFormErrors(result.details.map((err: ErrorDetail) => err.message));
        } else {
          setFormErrors([result.error || "Error al actualizar el evento"]);
        }
        return;
      }

      router.push(`/events/${event.id}`);
    } catch (error) {
      console.error("Error updating event:", error);
      setFormErrors(["Error de conexión"]);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishToggle = async () => {
    setPublishLoading(true);

    try {
      const response = await fetch(`/api/events/${event.id}/publish`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isPublished: !event.isPublished,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setFormErrors([
          result.error || "Error al cambiar estado de publicación",
        ]);
        return;
      }

      router.refresh();
    } catch (error) {
      console.error("Error toggling publish status:", error);
      setFormErrors(["Error de conexión"]);
    } finally {
      setPublishLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        setFormErrors([result.error || "Error al eliminar el evento"]);
        setDeleteLoading(false);
        return;
      }
      router.push("/dashboard/events");
    } catch (error) {
      console.error("Error deleting event:", error);
      setFormErrors(["Error de conexión"]);
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    if (formData.price === 0) {
      setFormData((prev) => ({ ...prev, isFree: true }));
    } else if (formData.price > 0) {
      setFormData((prev) => ({ ...prev, isFree: false }));
    }
  }, [formData.price]);

  function handleImageChange(imageUrl: string): void {
    setFormData((prev) => ({ ...prev, imageUrl }));
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/events/${event.id}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Evento
            </Link>
          </Button>

          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Editar Evento
            </h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4" />
              Creado: {new Date(event.createdAt).toLocaleDateString()}
              <Clock className="h-4 w-4 ml-2" />
              Actualizado: {new Date(event.updatedAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Badge variant={event.isPublished ? "default" : "secondary"}>
            {event.isPublished ? (
              <>
                <Eye className="w-3 h-3 mr-1" />
                Publicado
              </>
            ) : (
              <>
                <EyeOff className="w-3 h-3 mr-1" />
                Borrador
              </>
            )}
          </Badge>

          <Button
            variant={event.isPublished ? "outline" : "default"}
            onClick={handlePublishToggle}
            disabled={publishLoading}
            className={
              event.isPublished
                ? ""
                : "bg-gradient-to-r from-[#0053CC] to-[#01CBFE]"
            }
          >
            {publishLoading && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            {event.isPublished ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                Despublicar
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Publicar
              </>
            )}
          </Button>
        </div>
      </div>

      {hasTicketsSold && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="h-4 w-4" />
              <div>
                <p className="font-medium">Evento con tickets vendidos</p>
                <p className="text-sm">
                  Este evento tiene {event._count.tickets} ticket(s) vendidos.
                  Ten cuidado al hacer cambios importantes como fecha, ubicación
                  o capacidad.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {formErrors.length > 0 && (
        <Card className="border-destructive/20 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive text-sm mb-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Por favor corrige los siguientes errores:</span>
            </div>
            <ul className="text-sm text-destructive space-y-1">
              {formErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Información Básica
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título del evento *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Ej: Concierto de Rock en Vivo"
                  maxLength={100}
                />
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Describe tu evento, qué pueden esperar los asistentes..."
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.description.length}/500 caracteres
                </p>
              </div>

              <div>
                <Label htmlFor="category">Categoría *</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label htmlFor="imageUrl">Imagen del evento (opcional)</Label>
                <ImageUpload
                  currentImageUrl={formData.imageUrl}
                  onImageChange={handleImageChange}
                />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Los eventos con imágenes obtienen 40% más clicks</p>
                  <p>• Formatos permitidos: PNG, JPG, WebP (máx 4MB)</p>
                  <p>• Se recomienda una proporción 16:9 o 3:2</p>
                </div>

                {formData.imageUrl ? (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Imagen cargada y lista para usar
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ImageIcon className="h-4 w-4" />
                    Sin imagen - se usará una imagen por defecto
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación y Fechas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="location">Ubicación *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Ej: Teatro Municipal, Valdivia"
                  maxLength={200}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Fecha de inicio *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    min={
                      hasTicketsSold
                        ? undefined
                        : new Date().toISOString().split("T")[0]
                    }
                  />
                  {hasTicketsSold && (
                    <p className="text-xs text-yellow-600 mt-1">
                      ⚠️ Cuidado: hay tickets vendidos
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="startTime">Hora de inicio</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData({ ...formData, startTime: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endDate">Fecha de fin (opcional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    min={
                      formData.startDate ||
                      new Date().toISOString().split("T")[0]
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">Hora de fin</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData({ ...formData, endTime: e.target.value })
                    }
                    disabled={!formData.endDate}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Capacidad
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="capacity">Capacidad máxima *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    min={hasTicketsSold ? event._count.tickets : 1}
                    max="100000"
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacity: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {hasTicketsSold ? (
                      <span className="text-yellow-600">
                        ⚠️ Mínimo {event._count.tickets} (tickets vendidos)
                      </span>
                    ) : (
                      "Número máximo de asistentes"
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Precio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="price">Precio por ticket (CLP) *</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    max="1000000"
                    step="1"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.isFree
                      ? "✅ Evento gratuito"
                      : `💰 Precio: ${formData.price.toLocaleString(
                          "es-CL"
                        )} CLP`}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar con acciones */}
        <div className="space-y-6">
          {/* Vista previa del evento */}
          <Card>
            <CardHeader>
              <CardTitle>Vista Previa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <h3 className="font-bold text-lg">
                  {formData.title || "Título del evento"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {formData.location || "Ubicación"}
                </p>
                <p className="text-lg font-bold text-[#0053CC] mt-2">
                  {formData.isFree
                    ? "Gratis"
                    : `${formData.price.toLocaleString("es-CL")} CLP`}
                </p>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  📅 {formData.startDate || "Sin fecha"}{" "}
                  {formData.startTime || "00:00"}
                </p>
                <p>👥 {formData.capacity} personas máximo</p>
                <p>🎫 {event._count.tickets} tickets vendidos</p>
              </div>

              <Button asChild size="sm" className="w-full" variant="outline">
                <Link href={`/events/${event.id}`}>
                  <Eye className="w-4 h-4 mr-2" />
                  Ver Evento Completo
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Tickets vendidos:
                </span>
                <span className="font-medium">{event._count.tickets}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Órdenes:</span>
                <span className="font-medium">{event._count.orders}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Disponibles:
                </span>
                <span className="font-medium">
                  {event.capacity - event._count.tickets}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Ocupación:
                </span>
                <span className="font-medium">
                  {Math.round((event._count.tickets / event.capacity) * 100)}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={handleSubmit}
                disabled={
                  loading ||
                  !formData.title ||
                  !formData.location ||
                  !formData.startDate ||
                  !formData.categoryId
                }
                className="w-full bg-gradient-to-r from-[#0053CC] to-[#01CBFE]"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Save className="w-4 h-4 mr-2" />
                Guardar Cambios
              </Button>

              <Dialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full"
                    disabled={hasTicketsSold}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar Evento
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>¿Eliminar evento?</DialogTitle>
                    <DialogDescription>
                      Esta acción no se puede deshacer. El evento &quot;
                      {event.title}&quot; será eliminado permanentemente.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setShowDeleteDialog(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={deleteLoading}
                    >
                      {deleteLoading && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      Eliminar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {hasTicketsSold && (
                <div className="p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <Info className="h-3 w-3" />
                    <span>No se puede eliminar: hay tickets vendidos</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
