 import * as React from "react";
import { Resend } from "resend";
import { TicketEmail } from "@/app/api/_emails/ticket-email";
import { render } from "@react-email/render";
import { generateTicketQR } from "@/lib/qr";
import { saveMultipleQRs } from "@/lib/qr-storage";
import { User, Event, Order, Ticket } from "@prisma/client";
import { formatFullDateTime } from "@/lib/date";

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

  console.log(`[EMAIL] 🚀 Iniciando proceso para orden: ${order.orderNumber}`);
  console.log(`[EMAIL] 👤 Usuario: ${user.email}`);
  console.log(`[EMAIL] 🎪 Evento: ${event.title}`);
  console.log(`[EMAIL] 🎫 Tickets: ${order.tickets.length}`);

  const userName = user.firstName || user.email.split("@")[0];
  const eventDate = formatFullDateTime(event.startDate); // Uso de la función centralizada

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

  console.log(`[EMAIL] 🎨 Generando QRs con estrategia híbrida...`);

  // Estrategia híbrida: Data URLs + archivos de backup
  const ticketsWithQR = [];

  for (let i = 0; i < ticketsData.length; i++) {
    const ticketData = ticketsData[i];

    try {
      // 1. Generar QR como Data URL (para embebido)
      console.log(`[EMAIL] 📱 Generando Data URL para ticket ${i + 1}...`);
      const qrDataUrl = await generateTicketQR(ticketData);

      // 2. También guardar como archivo (backup)
      console.log(
        `[EMAIL] 💾 Guardando archivo backup para ticket ${i + 1}...`
      );
      await saveMultipleQRs([ticketData]);

      ticketsWithQR.push({
        qrCode: ticketData.qrCode,
        qrCodeImage: qrDataUrl, // Usar Data URL para mejor compatibilidad
      });

      console.log(`[EMAIL] ✅ Ticket ${i + 1} procesado exitosamente`);
      console.log(`[EMAIL]    - Data URL: ${qrDataUrl.substring(0, 50)}...`);
    } catch (error) {
      console.error(`[EMAIL] ❌ Error procesando ticket ${i + 1}:`, error);
      // Fallback sin imagen
      ticketsWithQR.push({
        qrCode: ticketData.qrCode,
        qrCodeImage: "", // Sin imagen si falla
      });
    }
  }

  const successfulQRs = ticketsWithQR.filter((t) => t.qrCodeImage).length;
  console.log(
    `[EMAIL] 📊 QRs generados: ${successfulQRs}/${ticketsWithQR.length}`
  );
  console.log(`[EMAIL] 📧 Preparando email con Data URLs embebidos...`);

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
    };

    console.log("[EMAIL] 📤 Enviando email...");
    console.log(`[EMAIL]    - Para: ${user.email}`);
    console.log(`[EMAIL]    - Asunto: ${emailData.subject}`);
    console.log(`[EMAIL]    - Tickets con QR embebido: ${successfulQRs}`);

    await resend.emails.send(emailData);

    console.log(`[EMAIL] ✅ Correo enviado exitosamente`);
    console.log(`[EMAIL] 📋 Orden: ${order.orderNumber}`);
    console.log(
      `[EMAIL] 🎫 QRs embebidos: ${successfulQRs}/${ticketsWithQR.length}`
    );
  } catch (error) {
    console.error("[EMAIL] ❌ Error al enviar correo:", error);
    throw error;
  }
}
