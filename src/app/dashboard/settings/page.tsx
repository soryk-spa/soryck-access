import { requireAuth } from "@/lib/auth";
import { SettingsClient } from "@/components/settings-client";
import { ROLE_LABELS } from "@/lib/roles";


export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const user = await requireAuth();

  const initialUserData = {
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email,
    bio: user.bio || "",
    producerName: user.producerName || "",
    websiteUrl: user.websiteUrl || "",
    twitterUrl: user.twitterUrl || "",
    instagramUrl: user.instagramUrl || "",
    avatar: user.imageUrl || undefined,
  };

  return (
    <SettingsClient
      initialUserData={initialUserData}
      userRole={ROLE_LABELS[user.role]}
    />
  );
}
