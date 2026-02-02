import * as React from "react";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { User, Event, CourtesyRequest } from "@prisma/client";
import { logger } from "@/lib/logger";


async function loadTicketEmailComponent() {
  const { TicketEmail } = await import("@/app/api/_emails/ticket-email");
  return TicketEmail;
}


async function loadCourtesyEmailComponent() {
  const { CourtesyEmail } = await import("@/app/api/_emails/courtesy-email");
  return CourtesyEmail;
}


async function loadScannerInviteEmailComponent() {
  const { ScannerInviteEmail } = await import("@/app/api/_emails/scanner-invite-email");
  return ScannerInviteEmail;
}


async function loadDateUtils() {
  const { formatFullDateTime } = await import("@/lib/date-utils");
  return { formatFullDateTime };
}

// Modo de desarrollo: permite testing sin enviar emails reales
const isDevelopmentMode = process.env.EMAIL_DEBUG === 'true' || 
  (process.env.NODE_ENV === 'development' && !process.env.RESEND_API_KEY);

if (isDevelopmentMode) {
  logger.info("📧 Modo de desarrollo de emails activado - Los emails se loguearán en consola");
}

if (!process.env.RESEND_API_KEY && !isDevelopmentMode) {
  logger.warn("RESEND_API_KEY no está definida. El envío de correos está deshabilitado.");
}

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

type FullEvent = Event;
type FullUser = User;


export async function sendTicketEmail({
  userEmail,
  userName,
  eventTitle,
  eventDate,
  eventLocation,
  orderNumber,
  tickets,
}: {
  userEmail: string;
  userName: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  orderNumber: string;
  tickets: { 
    qrCode: string; 
    qrCodeImage: string;
    seatInfo?: {
      sectionName: string;
      row: string;
      number: string;
      sectionColor?: string;
    };
  }[];
}) {
  if (!resend || !process.env.EMAIL_FROM) {
    logger.warn("Envío de ticket por email omitido por falta de configuración de Resend.");
    return;
  }

  logger.email.processing("ticket", userEmail, {
    eventTitle,
    orderNumber,
    ticketCount: tickets.length
  });

  try {
    
    const TicketEmail = await loadTicketEmailComponent();
    const { formatFullDateTime } = await loadDateUtils();
    const { generateMultipleSimpleTicketPDFs } = await import('./ticket-pdf-simple');
    
    const formattedDate = formatFullDateTime(new Date(eventDate));

    // Generar PDFs para cada ticket usando pdf-lib (funciona en serverless)
    const ticketPDFs = await generateMultipleSimpleTicketPDFs(
      tickets.map((ticket, index) => ({
        qrCode: ticket.qrCode,
        seatInfo: ticket.seatInfo,
        eventName: eventTitle,
        eventDate: formattedDate,
        eventLocation,
        orderNumber,
        userName,
        ticketNumber: index + 1,
      }))
    );

    // Renderizar email HTML (sin QR, solo información)
    const emailHtml = await render(
      React.createElement(TicketEmail, {
        userName,
        eventName: eventTitle,
        eventDate: formattedDate,
        eventLocation,
        orderNumber,
        tickets,
        attachmentMode: true, // Indicar que los QR van en PDF adjunto
      })
    );

    // Preparar adjuntos (PDFs)
    const attachments = ticketPDFs.map((pdfBuffer, index) => ({
      filename: `ticket-${orderNumber}-${index + 1}.pdf`,
      content: pdfBuffer,
      type: 'application/pdf',
    }));

    const emailData = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: `🎫 ${tickets.length > 1 ? 'Tus tickets' : 'Tu ticket'} para ${eventTitle}`,
      html: emailHtml,
      attachments,
    };

    // Modo de desarrollo: loguear en consola en lugar de enviar
    if (isDevelopmentMode) {
      logger.info("📧 [DEV MODE] Email de ticket generado:", {
        to: userEmail,
        subject: emailData.subject,
        attachments: attachments.length,
        htmlLength: emailHtml.length,
        eventTitle,
        orderNumber,
        ticketCount: tickets.length,
      });
      console.log("\n=== EMAIL PREVIEW ===");
      console.log("Para:", userEmail);
      console.log("Asunto:", emailData.subject);
      console.log("Adjuntos:", attachments.map(a => a.filename).join(", "));
      console.log("===================\n");
      return;
    }

    if (!resend) {
      throw new Error("Resend no está configurado pero se intentó enviar un email");
    }

    const result = await resend.emails.send(emailData);
    
    console.log('📧 Respuesta de Resend:', result);

    logger.email.sent("ticket", userEmail, emailData.subject, {
      eventTitle,
      orderNumber,
      ticketCount: tickets.length,
      pdfCount: ticketPDFs.length
    });
  } catch (error) {
    logger.email.failed("ticket", userEmail, error as Error, {
      eventTitle,
      orderNumber
    });
    throw error;
  }
}


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
    logger.warn("Envío de correo de cortesía omitido por falta de configuración de Resend.");
    return;
  }

  logger.email.processing("courtesy", user.email, {
    eventTitle: event.title,
    courtesyCode: courtesyRequest.code,
    codeType: courtesyRequest.codeType
  });

  try {
    
    const CourtesyEmail = await loadCourtesyEmailComponent();
    const { formatFullDateTime } = await loadDateUtils();

    const userName = user.firstName || user.email.split("@")[0];
    const eventDate = formatFullDateTime(event.startDate);
    
    // Función corregida para formatear fecha en zona horaria de Chile
    const formatDateAsChileLocal = (date: Date) => {
      return date.toLocaleString('es-CL', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'America/Santiago'
      });
    };
    
    const expiresAt = formatDateAsChileLocal(courtesyRequest.expiresAt!);

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

    await resend.emails.send(emailData);

    logger.email.sent("courtesy", user.email, emailData.subject, {
      eventTitle: event.title,
      courtesyCode: courtesyRequest.code,
      codeType: courtesyRequest.codeType
    });
  } catch (error) {
    logger.email.failed("courtesy", user.email, error as Error, {
      eventTitle: event.title,
      courtesyRequestId: courtesyRequest.id
    });
    throw error;
  }
}


export async function sendCourtesyInvitationEmail({
  invitation,
  event,
  ticket,
}: {
  invitation: {
    id: string;
    eventId: string;
    invitedEmail: string;
    invitedName?: string | null;
    message?: string | null;
    status: string;
    invitationCode?: string | null;
    sentAt?: Date | null;
    acceptedAt?: Date | null;
    expiresAt?: Date | null;
    ticketId?: string | null;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    priceTier?: { price: number; currency?: string } | null;
  };
  event: FullEvent;
  ticket: {
    id: string;
    qrCode: string;
    isUsed: boolean;
    usedAt?: Date | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    eventId: string;
    userId: string;
    orderId: string;
    ticketTypeId?: string | null;
    seatId?: string | null;
    ticketType?: {
      id: string;
      name: string;
      price: number;
      description?: string | null;
      currency: string;
      capacity: number;
      status: string;
      eventId: string;
      ticketsGenerated: number;
      createdAt: Date;
      updatedAt: Date;
      [key: string]: unknown;
    } | null;
  };
}) {
  if (!resend || !process.env.EMAIL_FROM) {
    logger.warn("Envío de invitación de cortesía omitido por falta de configuración de Resend.");
    return;
  }

  logger.email.processing("courtesy_invitation", invitation.invitedEmail, {
    eventTitle: event.title,
    invitationId: invitation.id
  });

  try {
    
    const TicketEmail = await loadTicketEmailComponent();
    const { formatFullDateTime } = await loadDateUtils();
    
    
    const { generateTicketPDF } = await import('./ticket-pdf-generator');

    const userName = invitation.invitedName || invitation.invitedEmail.split("@")[0];
    const eventDate = formatFullDateTime(event.startDate);
    
    // Función corregida para formatear fecha en zona horaria de Chile
    const formatDateAsChileLocal = (date: Date) => {
      return date.toLocaleString('es-CL', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'America/Santiago'
      });
    };
    
    const freeUntil = invitation.expiresAt ? formatDateAsChileLocal(invitation.expiresAt) : undefined;
    let afterPrice: string | undefined = undefined;
    
    const { formatCurrency } = await import('@/lib/utils');
    
    if (invitation.priceTier && typeof invitation.priceTier.price === 'number') {
      afterPrice = formatCurrency(invitation.priceTier.price, invitation.priceTier.currency || event.currency || 'CLP');
    } else if (ticket.ticketType && typeof ticket.ticketType.price === 'number') {
      afterPrice = formatCurrency(ticket.ticketType.price, ticket.ticketType.currency || event.currency || 'CLP');
    }

    // Generar PDF del ticket
    const orderNumber = `CORTESÍA-${invitation.id.slice(-8).toUpperCase()}`;
    const ticketPDF = await generateTicketPDF({
      qrCode: ticket.qrCode,
      eventName: event.title,
      eventDate,
      eventLocation: event.location,
      orderNumber,
      ticketNumber: 1,
      userName,
      ticketTypeName: ticket.ticketType?.name,
    });

    logger.email.processing("courtesy_invitation_pdf", invitation.invitedEmail, {
      pdfSize: Math.ceil(ticketPDF.length / 1024),
      orderNumber
    });

    const emailHtml = await render(
      React.createElement(TicketEmail, {
        userName,
        eventName: event.title,
        eventDate,
        eventLocation: event.location,
        orderNumber,
        ticketTypeName: ticket.ticketType?.name || undefined,
        tickets: [{
          qrCode: ticket.qrCode,
          qrCodeImage: '', // No usado en modo PDF
          backupCode: ticket.qrCode
        }],
        freeUntil,
        afterPrice,
        attachmentMode: true, // PDF adjunto
      })
    );

    const emailData = {
      from: process.env.EMAIL_FROM,
      to: invitation.invitedEmail,
      subject: `🎉 Invitación para ${event.title}`,
      html: emailHtml,
      
      attachments: [
        {
          filename: `ticket-${orderNumber}.pdf`,
          content: ticketPDF,
          type: 'application/pdf',
        }
      ]
    };

    await resend.emails.send(emailData);

    logger.email.sent("courtesy_invitation", invitation.invitedEmail, emailData.subject, {
      eventTitle: event.title,
      invitationId: invitation.id,
      ticketQR: ticket.qrCode,
      qrMethod: 'base64'
    });
  } catch (error) {
    logger.email.failed("courtesy_invitation", invitation.invitedEmail, error as Error, {
      eventTitle: event.title,
      invitationId: invitation.id
    });
    throw error;
  }
}


export async function sendScannerInviteEmail({
  scannerUser,
  event,
  organizer,
  isNewUser = false,
}: {
  scannerUser: FullUser;
  event: FullEvent;
  organizer: FullUser;
  isNewUser?: boolean;
}) {
  if (!resend || !process.env.EMAIL_FROM) {
    logger.warn(
      "Envío de invitación de scanner omitido por falta de configuración de Resend."
    );
    return;
  }
  logger.info('[SCANNER INVITE] 🚀 Iniciando proceso de invitación', { scanner: scannerUser.email, event: event.title, organizer: organizer.email, isNewUser });

  try {
    
    const ScannerInviteEmail = await loadScannerInviteEmailComponent();
    const { formatFullDateTime } = await loadDateUtils();

    const scannerName = scannerUser.firstName || scannerUser.email.split("@")[0];
    const organizerName = organizer.firstName && organizer.lastName 
      ? `${organizer.firstName} ${organizer.lastName}`
      : organizer.producerName || organizer.email.split("@")[0];
    
    const eventDate = formatFullDateTime(event.startDate);
    const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL}/sign-in`;
    const eventUrl = `${process.env.NEXT_PUBLIC_APP_URL}/events/${event.id}`;

    const emailHtml = await render(
      React.createElement(ScannerInviteEmail, {
        scannerName,
        organizerName,
        eventName: event.title,
        eventDate,
        eventLocation: event.location,
        loginUrl,
        eventUrl,
        isNewUser,
      })
    );

    const subjectPrefix = isNewUser ? "🎉 Invitación como validador" : "📋 Nueva asignación de validación";
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: scannerUser.email,
      subject: `${subjectPrefix} - ${event.title}`,
      html: emailHtml,
    };

  logger.info('[SCANNER INVITE] 📤 Enviando email de invitación...', { to: scannerUser.email, subject: emailData.subject });

    await resend.emails.send(emailData);

  logger.info('[SCANNER INVITE] ✅ Invitación enviada exitosamente', { to: scannerUser.email, event: event.title });
  } catch (error) {
  logger.error("[SCANNER INVITE] ❌ Error al enviar invitación de scanner:", error as Error);
    throw error;
  }
}
