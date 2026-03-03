import { redirect } from "next/navigation";

// Los tickets están disponibles a través de la app móvil SoryckPass.
export const dynamic = 'force-dynamic';

export default function TicketsPage() {
  redirect("/dashboard");
}
