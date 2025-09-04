
import { redirect } from "next/navigation";

export default async function EditEventPageRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  
  redirect(`/organizer/events/${id}/edit`);
}
