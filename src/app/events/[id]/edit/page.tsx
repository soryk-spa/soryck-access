// src/app/events/[id]/edit/page.tsx
import { redirect } from "next/navigation";

export default async function EditEventPageRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Redirect to the new location under organizer layout
  redirect(`/organizer/events/${id}/edit`);
}
