import { Resend } from "resend";
import { TicketEmail } from "@/app/api/_emails/ticket-email";
import { render } from "@react-email/render";
import { saveMultipleQRs } from "@/lib/qr-storage";
import { User, Event, Order, Ticket } from "@prisma/client";

if (!process.env.RESEND_API_KEY) {
  console.warn(
    "RESEND_API_KEY no está definida. El envío de correos está deshabilitado."
  );
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

interface OrderWithTickets extends Order {
  tickets: Ticket[];
}
type FullEvent = Event;
type FullUser = User;

export async function sendTicketEmail({
  user,
  event,
  order,
}: {
  user: FullUser;
  event: FullEvent;
  order: OrderWithTickets;
}) {
  if (!resend || !process.env.EMAIL_FROM) {
    console.log(
      "Envío de correo omitido por falta de configuración de Resend."
    );
    return;
  }

  console.log(`[EMAIL] Iniciando proceso para orden: ${order.orderNumber}`);
  console.log(`[EMAIL] Usuario: ${user.email}`);
  console.log(`[EMAIL] Evento: ${event.title}`);
  console.log(`[EMAIL] Tickets: ${order.tickets.length}`);

  const userName = user.firstName || user.email.split("@")[0];
  const eventDate = new Date(event.startDate).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Preparar datos para generar QRs
  const ticketsData = order.tickets.map((ticket) => ({
    ticketId: ticket.id,
    qrCode: ticket.qrCode,
    eventTitle: event.title,
    attendeeName: userName,
    attendeeEmail: user.email,
    eventDate: event.startDate.toISOString(),
    eventLocation: event.location,
    eventId: event.id,
    userId: user.id,
    timestamp: order.createdAt.toISOString(),
  }));

  console.log(`[EMAIL] 🎨 Generando y guardando ${ticketsData.length} QRs...`);

  // Generar y guardar QRs como archivos
  const qrResults = await saveMultipleQRs(ticketsData);

  // Crear tickets con URLs de archivos guardados
  const ticketsWithQR = qrResults.map((result, index) => {
    console.log(`[EMAIL] Ticket ${index + 1}:`);
    console.log(`  - QR Code: ${result.qrCode}`);
    console.log(`  - QR URL: ${result.qrImageUrl}`);

    return {
      qrCode: result.qrCode,
      qrCodeImage: result.qrImageUrl,
    };
  });

  // Verificar que todos los QRs se generaron correctamente
  const successfulQRs = ticketsWithQR.filter((t) => t.qrCodeImage).length;
  console.log(
    `[EMAIL] ✅ QRs generados exitosamente: ${successfulQRs}/${ticketsWithQR.length}`
  );

  const emailHtml = await render(
    <TicketEmail
      userName={userName}
      eventName={event.title}
      eventDate={eventDate}
      eventLocation={event.location}
      orderNumber={order.orderNumber}
      tickets={ticketsWithQR}
    />
  );

  try {
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `🎫 Tus tickets para ${event.title}`,
      html: emailHtml,
      // Sin attachments - usamos archivos públicos
    };

    console.log("[EMAIL] 📧 Enviando email...");
    console.log(`[EMAIL] Para: ${user.email}`);
    console.log(`[EMAIL] Asunto: ${emailData.subject}`);

    await resend.emails.send(emailData);

    console.log(`[EMAIL] ✅ Correo enviado exitosamente a ${user.email}`);
    console.log(`[EMAIL] 📋 Orden: ${order.orderNumber}`);
    console.log(
      `[EMAIL] 🎫 Tickets con QR: ${successfulQRs}/${ticketsWithQR.length}`
    );
  } catch (error) {
    console.error("[EMAIL] ❌ Error al enviar correo:", error);
    throw error;
  }
}
