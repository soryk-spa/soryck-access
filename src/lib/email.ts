import * as React from "react";
import { Resend } from "resend";
import { TicketEmail } from "@/app/api/_emails/ticket-email";
import { CourtesyEmail } from "@/app/api/_emails/courtesy-email";
import { render } from "@react-email/render";
import { generateTicketQR } from "@/lib/qr";
import { saveMultipleQRs } from "@/lib/qr-storage";
import { User, Event, Order, Ticket, CourtesyRequest } from "@prisma/client";
import { formatFullDateTime } from "@/lib/date-utils";

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
  const qrDataList = order.tickets.map((ticket) => ({
    ticketId: ticket.id,
    qrCode: ticket.qrCode,
    eventId: event.id,
  }));

  console.log("[EMAIL] 🔧 Generando QRs...");
  const qrResults = await generateTicketQR(qrDataList);

  // Guardar QRs en el storage
  const validQRs = qrResults.filter((qr) => qr.success && qr.buffer);
  if (validQRs.length > 0) {
    console.log(`[EMAIL] 💾 Guardando ${validQRs.length} QRs...`);
    await saveMultipleQRs(validQRs);
  }

  // Combinar tickets con QRs
  const ticketsWithQR = order.tickets.map((ticket) => {
    const qrResult = qrResults.find((qr) => qr.ticketId === ticket.id);
    return {
      ...ticket,
      qrCodeImage: qrResult?.success
        ? `data:image/png;base64,${qrResult.buffer?.toString("base64")}`
        : "",
    };
  });

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

// Nueva función para enviar correos de cortesía
export async function sendCourtesyEmail({
  user,
  event,
  courtesyRequest,
}: {
  user: FullUser;
  event: FullEvent;
  courtesyRequest: CourtesyRequest;
}) {
  if (!resend || !process.env.EMAIL_FROM) {
    console.log(
      "Envío de correo de cortesía omitido por falta de configuración de Resend."
    );
    return;
  }

  console.log(`[COURTESY EMAIL] 🚀 Iniciando proceso para cortesía: ${courtesyRequest.id}`);
  console.log(`[COURTESY EMAIL] 👤 Usuario: ${user.email}`);
  console.log(`[COURTESY EMAIL] 🎪 Evento: ${event.title}`);
  console.log(`[COURTESY EMAIL] 🎫 Código: ${courtesyRequest.code}`);
  console.log(`[COURTESY EMAIL] 💰 Tipo: ${courtesyRequest.codeType}`);

  const userName = user.firstName || user.email.split("@")[0];
  const eventDate = formatFullDateTime(event.startDate);
  const expiresAt = formatFullDateTime(courtesyRequest.expiresAt!);

  const emailHtml = await render(
    <CourtesyEmail
      userName={userName}
      eventName={event.title}
      eventDate={eventDate}
      eventLocation={event.location}
      courtesyCode={courtesyRequest.code!}
      codeType={courtesyRequest.codeType!}
      discountValue={courtesyRequest.discountValue}
      expiresAt={expiresAt}
    />
  );

  try {
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: `🎉 Cortesía aprobada para ${event.title}`,
      html: emailHtml,
    };

    console.log("[COURTESY EMAIL] 📤 Enviando email...");
    console.log(`[COURTESY EMAIL]    - Para: ${user.email}`);
    console.log(`[COURTESY EMAIL]    - Asunto: ${emailData.subject}`);
    console.log(`[COURTESY EMAIL]    - Código: ${courtesyRequest.code}`);

    await resend.emails.send(emailData);

    console.log(`[COURTESY EMAIL] ✅ Correo de cortesía enviado exitosamente`);
    console.log(`[COURTESY EMAIL] 📋 Código: ${courtesyRequest.code}`);
    console.log(`[COURTESY EMAIL] 🎫 Tipo: ${courtesyRequest.codeType}`);
  } catch (error) {
    console.error("[COURTESY EMAIL] ❌ Error al enviar correo de cortesía:", error);
    throw error;
  }
}
