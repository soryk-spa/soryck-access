import { requireOrganizer } from "@/lib/auth";
import OrganizerProfileForm from "@/components/organizer-profile-form";

export default async function OrganizerProfilePage() {
  const user = await requireOrganizer();

  return (
    <OrganizerProfileForm 
      initialData={{
        producerName: user.producerName,
        bio: user.bio,
        websiteUrl: user.websiteUrl,
        twitterUrl: user.twitterUrl,
        instagramUrl: user.instagramUrl,
      }}
      userId={user.id}
    />
  );
}
