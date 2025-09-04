"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardPageLayout } from "@/components/dashboard-page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  User,
  Building,
  Save,
  Loader2,
  Target,
  Award,
  TrendingUp,
  Globe,
  Twitter,
  Instagram,
  Mail,
  Calendar,
  Users,
  Eye,
} from "lucide-react";
import Image from "next/image";

interface UserProfile {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  imageUrl: string | null;
  producerName?: string | null;
  bio?: string | null;
  websiteUrl?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
  createdAt: string;
  _count?: {
    events: number;
    orders: number;
  };
}

interface OrganizerProfileFormProps {
  user: UserProfile;
}


const ModernStatCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendDirection = "up",
  accentColor = "blue",
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  description: string;
  trend?: string;
  trendDirection?: "up" | "down" | "neutral";
  accentColor?: "blue" | "green" | "purple" | "orange";
}) => {
  const colorVariants = {
    blue: {
      bg: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900",
      icon: "bg-blue-500 text-white",
      accent: "text-blue-600 dark:text-blue-400",
      trend: "text-blue-500",
    },
    green: {
      bg: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900",
      icon: "bg-green-500 text-white",
      accent: "text-green-600 dark:text-green-400",
      trend: "text-green-500",
    },
    purple: {
      bg: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900",
      icon: "bg-purple-500 text-white",
      accent: "text-purple-600 dark:text-purple-400",
      trend: "text-purple-500",
    },
    orange: {
      bg: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900",
      icon: "bg-orange-500 text-white",
      accent: "text-orange-600 dark:text-orange-400",
      trend: "text-orange-500",
    },
  };

  const colors = colorVariants[accentColor];

  return (
    <Card className={`group hover:shadow-lg transition-all duration-300 border-0 ${colors.bg}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2.5 rounded-xl ${colors.icon} shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{title}</p>
                <p className={`text-2xl font-bold ${colors.accent}`}>{value}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{description}</p>
            {trend && (
              <div className={`flex items-center gap-1 text-xs font-medium ${colors.trend}`}>
                <TrendingUp className={`h-3 w-3 ${trendDirection === "down" ? "rotate-180" : ""}`} />
                {trend}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function OrganizerProfileForm({ user }: OrganizerProfileFormProps) {
  const [formData, setFormData] = useState({
    producerName: user.producerName || "",
    bio: user.bio || "",
    websiteUrl: user.websiteUrl || "",
    twitterUrl: user.twitterUrl || "",
    instagramUrl: user.instagramUrl || "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/user/organizer-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar el perfil");
      }

      toast.success("Perfil actualizado exitosamente");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  
  const headerConfig = {
    title: "Mi Perfil",
    description: "gestiona tu información pública como organizador",
    greeting: `${user.firstName} ${user.lastName}`,
    backgroundIcon: User,
    stats: [
      { icon: Target, label: "eventos creados", value: user._count?.events || 0 },
      { icon: Award, label: "órdenes recibidas", value: user._count?.orders || 0 },
    ],
    actions: [
      {
        label: "Ver Perfil Público",
        href: `/organizer/${user.id}`,
        icon: Eye,
        variant: "outline" as const,
      },
    ],
  };

  const memberSince = new Date(user.createdAt).getFullYear();

  return (
    <DashboardPageLayout header={headerConfig}>
      {}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ModernStatCard
          title="Eventos Publicados"
          value={user._count?.events || 0}
          icon={Calendar}
          description="Total de eventos"
          trend="+12%"
          trendDirection="up"
          accentColor="blue"
        />
        <ModernStatCard
          title="Órdenes Recibidas"
          value={user._count?.orders || 0}
          icon={Users}
          description="Tickets vendidos"
          trend="+8%"
          trendDirection="up"
          accentColor="green"
        />
        <ModernStatCard
          title="Años Activo"
          value={new Date().getFullYear() - memberSince}
          icon={Award}
          description={`Desde ${memberSince}`}
          accentColor="purple"
        />
        <ModernStatCard
          title="Perfil Completado"
          value={`${Math.round(((formData.producerName ? 1 : 0) + 
                                  (formData.bio ? 1 : 0) + 
                                  (formData.websiteUrl ? 1 : 0) + 
                                  (formData.twitterUrl ? 1 : 0) + 
                                  (formData.instagramUrl ? 1 : 0)) / 5 * 100)}%`}
          icon={Target}
          description="Información completa"
          accentColor="orange"
        />
      </div>

      {}
      <Card className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 dark:from-indigo-950 dark:via-blue-950 dark:to-purple-950 border-0">
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <Image
                src={user.imageUrl ?? "/default-avatar.png"}
                alt="Avatar"
                width={80}
                height={80}
                className="w-20 h-20 rounded-full border-4 border-white shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full p-2">
                <User className="h-4 w-4" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {user.firstName} {user.lastName}
              </h3>
              <div className="flex items-center gap-4 text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{user.email}</span>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  Organizador desde {memberSince}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {}
      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="border-0 bg-white dark:bg-gray-800 shadow-lg">
          <CardContent className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl">
                <Building className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Información del Organizador</h2>
                <p className="text-muted-foreground">Esta información será visible en tus eventos públicos</p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label htmlFor="producerName" className="text-base font-medium">
                  Nombre de Productora/Organizador
                </Label>
                <Input
                  id="producerName"
                  value={formData.producerName}
                  onChange={(e) => handleInputChange("producerName", e.target.value)}
                  placeholder="Ej: Eventos Increíbles SpA"
                  className="mt-2 h-12"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="bio" className="text-base font-medium">
                  Biografía
                </Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Cuéntanos sobre ti y tu experiencia organizando eventos..."
                  rows={4}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="websiteUrl" className="text-base font-medium flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  Sitio Web
                </Label>
                <Input
                  id="websiteUrl"
                  type="url"
                  value={formData.websiteUrl}
                  onChange={(e) => handleInputChange("websiteUrl", e.target.value)}
                  placeholder="https:
                  className="mt-2 h-12"
                />
              </div>

              <div>
                <Label htmlFor="twitterUrl" className="text-base font-medium flex items-center gap-2">
                  <Twitter className="h-4 w-4" />
                  Twitter/X
                </Label>
                <Input
                  id="twitterUrl"
                  type="url"
                  value={formData.twitterUrl}
                  onChange={(e) => handleInputChange("twitterUrl", e.target.value)}
                  placeholder="https:
                  className="mt-2 h-12"
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="instagramUrl" className="text-base font-medium flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Label>
                <Input
                  id="instagramUrl"
                  type="url"
                  value={formData.instagramUrl}
                  onChange={(e) => handleInputChange("instagramUrl", e.target.value)}
                  placeholder="https:
                  className="mt-2 h-12"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 hover:from-blue-700 hover:via-purple-700 hover:to-blue-900 text-white px-8"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Guardar Cambios
              </>
            )}
          </Button>
        </div>
      </form>

      {}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-blue-500 text-white rounded-lg">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                Visibilidad del Perfil
              </h3>
              <p className="text-blue-700 dark:text-blue-200 text-sm mb-4">
                La información de tu perfil de organizador será visible públicamente en las páginas 
                de tus eventos para dar más confianza a los asistentes.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href={`/organizer/${user.id}`} target="_blank" rel="noopener noreferrer">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Perfil Público
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardPageLayout>
  );
}
