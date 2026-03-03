import { redirect } from "next/navigation";

// Los QRs están disponibles exclusivamente a través de la app móvil SoryckPass.
export const dynamic = 'force-dynamic';

export default function MisQRsPage() {
  redirect("/");
}
