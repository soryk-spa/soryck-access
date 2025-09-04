"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  Building,
  Link as LinkIcon,
} from "lucide-react";

interface UserProfile {
  producerName?: string | null;
  bio?: string | null;
  websiteUrl?: string | null;
  twitterUrl?: string | null;
  instagramUrl?: string | null;
}

interface OrganizerProfileFormProps {
  initialData: UserProfile;
  userId: string;
}

export default function OrganizerProfileForm({
  initialData,
  userId,
}: OrganizerProfileFormProps) {
  const [formData, setFormData] = useState({
    producerName: initialData.producerName || "",
    bio: initialData.bio || "",
    websiteUrl: initialData.websiteUrl || "",
    twitterUrl: initialData.twitterUrl || "",
    instagramUrl: initialData.instagramUrl || "",
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
      router.push(`/organizer/${userId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Información del Organizador
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="producerName">
              Nombre de Productora/Organizador
            </Label>
            <Input
              id="producerName"
              value={formData.producerName}
              onChange={(e) =>
                handleInputChange("producerName", e.target.value)
              }
              placeholder="Ej: Eventos Increíbles SpA"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              placeholder="Cuéntale a los asistentes sobre ti o tu productora..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.bio.length}/500 caracteres
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Redes Sociales y Sitio Web
            </h3>
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Sitio Web</Label>
              <Input
                id="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={(e) =>
                  handleInputChange("websiteUrl", e.target.value)
                }
                placeholder="https:
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagramUrl">Instagram</Label>
              <Input
                id="instagramUrl"
                type="url"
                value={formData.instagramUrl}
                onChange={(e) =>
                  handleInputChange("instagramUrl", e.target.value)
                }
                placeholder="https:
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="twitterUrl">Twitter / X</Label>
              <Input
                id="twitterUrl"
                type="url"
                value={formData.twitterUrl}
                onChange={(e) =>
                  handleInputChange("twitterUrl", e.target.value)
                }
                placeholder="https:
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Guardar Cambios
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
