import { notFound } from "next/navigation";
import { validateQRCode } from "@/lib/qr";
import TicketVerification from "@/components/ticket-verification";

interface VerifyPageProps {
  params: { qrCode: string };
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { qrCode } = await params;

  if (!validateQRCode(qrCode)) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <TicketVerification qrCode={qrCode} />
    </div>
  );
}
