import { Resend } from "resend";
import { TicketEmail } from "@/app/api/_emails/ticket-email";
import { render } from "@react-email/render";
import { generateTicketQR } from "@/lib/qr";
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

  const userName = user.firstName || user.email.split("@")[0];
  const eventDate = new Date(event.startDate).toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const ticketsWithQR = await Promise.all(
    order.tickets.map(async (ticket) => {
      const qrCodeImage = await generateTicketQR({
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
      });
      return { qrCode: ticket.qrCode, qrCodeImage };
    })
  );

  // ✨ CAMBIO: Agregar 'await' a la función render ✨
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
    await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `Tus tickets para ${event.title}`,
      html: emailHtml,
    });
    console.log(
      `Correo de tickets enviado exitosamente a ${user.email} para la orden ${order.orderNumber}`
    );
  } catch (error) {
    console.error("Error al enviar correo con Resend:", error);
  }
}
