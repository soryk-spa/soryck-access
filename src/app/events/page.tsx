import { redirect } from "next/navigation";

// Los eventos ahora se gestionan exclusivamente a través de la app móvil SoryckPass.
export const dynamic = 'force-dynamic';

export default function EventsPage() {
  redirect("/");
}
