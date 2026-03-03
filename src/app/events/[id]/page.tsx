import { redirect } from "next/navigation";

// Las páginas de detalle de eventos ya no son accesibles desde la web.
// Los usuarios deben usar la app móvil SoryckPass para comprar tickets.
export const dynamic = 'force-dynamic';

export default function EventPage() {
  redirect("/");
}
