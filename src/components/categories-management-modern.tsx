"use client";

import { useState, useRef } from "react";
import { DashboardPageLayout } from "@/components/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Edit,
  Trash2,
  Loader2,
  AlertTriangle,
  Building,
  Calendar,
  TrendingUp,
  BarChart3,
} from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  _count: {
    events: number;
  };
}

interface CategoriesManagementProps {
  initialCategories: Category[];
}

// Tarjeta de estadística moderna
const StatCard = ({
  icon: Icon,
  title,
  value,
  description,
  color = "blue",
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  description: string;
  color?: "blue" | "green" | "purple" | "orange";
}) => {
  const colorClasses = {
    blue: "from-blue-50 to-blue-100 border-blue-200 dark:from-blue-950 dark:to-blue-900 dark:border-blue-800 bg-gradient-to-r from-blue-500 to-blue-600 text-blue-700 dark:text-blue-300",
    green: "from-emerald-50 to-green-100 border-green-200 dark:from-emerald-950 dark:to-green-900 dark:border-green-800 bg-gradient-to-r from-emerald-500 to-green-600 text-emerald-700 dark:text-emerald-300",
    purple: "from-purple-50 to-purple-100 border-purple-200 dark:from-purple-950 dark:to-purple-900 dark:border-purple-800 bg-gradient-to-r from-purple-500 to-purple-600 text-purple-700 dark:text-purple-300",
    orange: "from-orange-50 to-orange-100 border-orange-200 dark:from-orange-950 dark:to-orange-900 dark:border-orange-800 bg-gradient-to-r from-orange-500 to-orange-600 text-orange-700 dark:text-orange-300",
  };

  const bgClass = colorClasses[color].split(" ").slice(0, 6).join(" ");
  const iconBgClass = colorClasses[color].split(" ").slice(6, 10).join(" ");
  const textClass = colorClasses[color].split(" ").slice(10).join(" ");

  return (
    <Card className={`shadow-xl bg-gradient-to-br ${bgClass} border-2 hover:shadow-2xl transition-all duration-300 hover:scale-105`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 ${iconBgClass} text-white rounded-2xl shadow-lg`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">{title}</p>
            <p className={`text-3xl font-bold ${textClass} mb-1`}>{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function CategoriesManagement({ initialCategories }: CategoriesManagementProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState<string[]>([]);

  const nameInputRef = useRef<HTMLInputElement>(null);

  // Estadísticas calculadas
  const totalCategories = categories.length;
  const totalEvents = categories.reduce((sum, cat) => sum + cat._count.events, 0);
  const avgEventsPerCategory = totalCategories > 0 ? Math.round(totalEvents / totalCategories) : 0;
  const mostUsedCategory = categories.reduce((max, cat) => 
    cat._count.events > max._count.events ? cat : max, 
    categories[0] || { _count: { events: 0 }, name: "N/A" }
  );

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setFormErrors([]);
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      setFormErrors(["El nombre es requerido"]);
      return;
    }

    setLoading(true);
    setFormErrors([]);

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al crear la categoría");
      }

      const newCategory = await response.json();
      setCategories([...categories, newCategory]);
      setIsCreateOpen(false);
      resetForm();
    } catch (error) {
      setFormErrors([error instanceof Error ? error.message : "Error desconocido"]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (!editingCategory || !formData.name.trim()) {
      setFormErrors(["El nombre es requerido"]);
      return;
    }

    setLoading(true);
    setFormErrors([]);

    try {
      const response = await fetch(`/api/admin/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al actualizar la categoría");
      }

      const updatedCategory = await response.json();
      setCategories(
        categories.map((cat) => 
          cat.id === editingCategory.id ? updatedCategory : cat
        )
      );
      setEditingCategory(null);
      resetForm();
    } catch (error) {
      setFormErrors([error instanceof Error ? error.message : "Error desconocido"]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Error al eliminar la categoría");
      }

      setCategories(categories.filter((cat) => cat.id !== id));
    } catch (error) {
      alert(error instanceof Error ? error.message : "Error desconocido");
    } finally {
      setDeletingId(null);
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
    });
    setFormErrors([]);
  };

  const closeEditDialog = () => {
    setEditingCategory(null);
    resetForm();
  };

  const openCreateDialog = () => {
    setIsCreateOpen(true);
    resetForm();
    setTimeout(() => nameInputRef.current?.focus(), 100);
  };

  const closeCreateDialog = () => {
    setIsCreateOpen(false);
    resetForm();
  };

  // Configuración del header
  const headerConfig = {
    title: "Gestión de Categorías",
    description: "Administra las categorías de eventos de la plataforma",
    backgroundIcon: Building,
    gradient: "from-emerald-600 to-green-600",
    badge: {
      label: "Admin",
      variant: "secondary" as const,
    },
    actions: [
      {
        label: "Nueva Categoría",
        href: "#",
        icon: Plus,
        variant: "default" as const,
      },
    ],
  };

  return (
    <DashboardPageLayout header={headerConfig}>
      <div className="space-y-8">
        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            icon={Building}
            title="Total Categorías"
            value={totalCategories}
            description="Categorías activas"
            color="blue"
          />
          <StatCard
            icon={Calendar}
            title="Total Eventos"
            value={totalEvents}
            description="En todas las categorías"
            color="green"
          />
          <StatCard
            icon={BarChart3}
            title="Promedio"
            value={avgEventsPerCategory}
            description="Eventos por categoría"
            color="purple"
          />
          <StatCard
            icon={TrendingUp}
            title="Más Popular"
            value={mostUsedCategory.name}
            description={`${mostUsedCategory._count.events} eventos`}
            color="orange"
          />
        </div>

        {/* Botón de crear nueva categoría */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Categorías ({totalCategories})
          </h2>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button 
                onClick={openCreateDialog}
                className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nueva Categoría
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5 text-emerald-600" />
                  Crear Nueva Categoría
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {formErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      {formErrors.map((error, index) => (
                        <div key={index}>{error}</div>
                      ))}
                    </AlertDescription>
                  </Alert>
                )}
                <div>
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    ref={nameInputRef}
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Música, Deportes, Tecnología"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción opcional de la categoría"
                    className="mt-1"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button variant="outline" onClick={closeCreateDialog}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleCreate} 
                    disabled={loading}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      "Crear Categoría"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de categorías */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-600 rounded-lg">
                      <Building className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {category._count.events} eventos
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {category.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {category.description}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Creada: {new Date(category.createdAt).toLocaleDateString()}
                </p>
                <div className="flex gap-2">
                  <Dialog 
                    open={editingCategory?.id === category.id} 
                    onOpenChange={(open) => !open && closeEditDialog()}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(category)}
                        className="flex-1"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Editar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Edit className="h-5 w-5 text-blue-600" />
                          Editar Categoría
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {formErrors.length > 0 && (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              {formErrors.map((error, index) => (
                                <div key={index}>{error}</div>
                              ))}
                            </AlertDescription>
                          </Alert>
                        )}
                        <div>
                          <Label htmlFor="edit-name">Nombre *</Label>
                          <Input
                            id="edit-name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="edit-description">Descripción</Label>
                          <Textarea
                            id="edit-description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                          <Button variant="outline" onClick={closeEditDialog}>
                            Cancelar
                          </Button>
                          <Button 
                            onClick={handleEdit} 
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Guardando...
                              </>
                            ) : (
                              "Guardar Cambios"
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(category.id)}
                    disabled={deletingId === category.id || category._count.events > 0}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {deletingId === category.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                {category._count.events > 0 && (
                  <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded">
                    No se puede eliminar: tiene eventos asociados
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {categories.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Building className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                No hay categorías
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Crea la primera categoría para organizar los eventos
              </p>
              <Button onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Categoría
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardPageLayout>
  );
}
