import { requireAuth } from "@/lib/auth";
import { SettingsClient } from "@/components/settings-client";
import { ROLE_LABELS } from "@/lib/roles";

export default async function SettingsPage() {
  const user = await requireAuth();

  const initialUserData = {
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email,
    phone: "", // Por ahora vacío hasta que se agregue al modelo
    bio: user.bio || "",
    avatar: user.imageUrl || undefined,
  };

  return (
    <SettingsClient
      initialUserData={initialUserData}
      userRole={ROLE_LABELS[user.role]}
    />
  );
}
