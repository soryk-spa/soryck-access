/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { User, Event, CourtesyRequest } from "@prisma/client";

// Importación dinámica del template de cortesía
async function loadCourtesyEmailComponent() {
  const { CourtesyEmail } = await import("@/app/api/_emails/courtesy-email");
  return CourtesyEmail;
}

// Importación dinámica de date-utils
async function loadDateUtils() {
  const { formatFullDateTime } = await import("@/lib/date-utils");
  return { formatFullDateTime };
}

if (!process.env.RESEND_API_KEY) {
  console.warn(
    "RESEND_API_KEY no está definida. El envío de correos está deshabilitado."
  );
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

type FullEvent = Event;
type FullUser = User;

// TODO: Esta función fue movida/refactorizada. Necesita re-implementación si se usa.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function sendTicketEmail(..._args: any[]) {
  console.warn("sendTicketEmail function needs to be re-implemented");
  // Implementación temporal vacía para evitar errores de compilación
}

// Función para enviar correos de cortesía
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

  try {
    // Cargar dependencias dinámicamente
    const CourtesyEmail = await loadCourtesyEmailComponent();
    const { formatFullDateTime } = await loadDateUtils();

    const userName = user.firstName || user.email.split("@")[0];
    const eventDate = formatFullDateTime(event.startDate);
    const expiresAt = formatFullDateTime(courtesyRequest.expiresAt!);

    const emailHtml = await render(
      React.createElement(CourtesyEmail, {
        userName,
        eventName: event.title,
        eventDate,
        eventLocation: event.location,
        courtesyCode: courtesyRequest.code!,
        codeType: courtesyRequest.codeType!,
        discountValue: courtesyRequest.discountValue,
        expiresAt,
      })
    );

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
