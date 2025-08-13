import { requireOrganizer } from "@/lib/auth";
import OrganizerProfileForm from "@/components/organizer-profile-form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export default async function OrganizerProfilePage() {
  const user = await requireOrganizer();

  const initialData = {
    producerName: user.producerName,
    bio: user.bio,
    websiteUrl: user.websiteUrl,
    twitterUrl: user.twitterUrl,
    instagramUrl: user.instagramUrl,
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Perfil de Organizador</h1>
          <p className="text-muted-foreground">
            Completa y actualiza la información que se mostrará en tus eventos.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
                <Image
                  src={user.imageUrl ?? "/default-avatar.png"}
                  alt="Avatar"
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full"
                />
              <div>
                <CardTitle className="text-xl">
                  {user.firstName} {user.lastName}
                </CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        <OrganizerProfileForm initialData={initialData} userId={user.id} />

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            La información de tu perfil de organizador será visible públicamente
            en las páginas de tus eventos para dar más confianza a los
            asistentes.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
