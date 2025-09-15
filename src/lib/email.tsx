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

if (!process.env.RESEND_API_KEY) {
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
  tickets: { qrCode: string; qrCodeImage: string }[];
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
    
    const formattedDate = formatFullDateTime(new Date(eventDate));

    const emailHtml = await render(
      React.createElement(TicketEmail, {
        userName,
        eventName: eventTitle,
        eventDate: formattedDate,
        eventLocation,
        orderNumber,
        tickets,
      })
    );

    const emailData = {
      from: process.env.EMAIL_FROM,
      to: userEmail,
      subject: `🎫 ${tickets.length > 1 ? 'Tus tickets' : 'Tu ticket'} para ${eventTitle}`,
      html: emailHtml,
    };

    await resend.emails.send(emailData);

    logger.email.sent("ticket", userEmail, emailData.subject, {
      eventTitle,
      orderNumber,
      ticketCount: tickets.length
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
    
    // Helper function to treat UTC date as Chile local time
    const formatDateAsChileLocal = (date: Date) => {
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const day = date.getUTCDate();
      const hour = date.getUTCHours();
      const minute = date.getUTCMinutes();
      const chileLocalDate = new Date(year, month, day, hour, minute);
      return chileLocalDate.toLocaleString('es-CL', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
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
    
    
    const { generateQRCodeBase64 } = await import('@/lib/qr-generator');

    const userName = invitation.invitedName || invitation.invitedEmail.split("@")[0];
    const eventDate = formatFullDateTime(event.startDate);
    
    // Helper function to treat UTC date as Chile local time
    const formatDateAsChileLocal = (date: Date) => {
      const year = date.getUTCFullYear();
      const month = date.getUTCMonth();
      const day = date.getUTCDate();
      const hour = date.getUTCHours();
      const minute = date.getUTCMinutes();
      const chileLocalDate = new Date(year, month, day, hour, minute);
      return chileLocalDate.toLocaleString('es-CL', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit'
      });
    };
    
    const freeUntil = invitation.expiresAt ? formatDateAsChileLocal(invitation.expiresAt) : undefined;
    let afterPrice: string | undefined = undefined;
    // Prefer price from invitation.priceTier when available, otherwise fall back to ticket.ticketType
    const { formatCurrency } = await import('@/lib/utils');
    // invitation may include priceTier when updatedInvitation was returned from the API
    if (invitation.priceTier && typeof invitation.priceTier.price === 'number') {
      afterPrice = formatCurrency(invitation.priceTier.price, invitation.priceTier.currency || event.currency || 'CLP');
    } else if (ticket.ticketType && typeof ticket.ticketType.price === 'number') {
      afterPrice = formatCurrency(ticket.ticketType.price, ticket.ticketType.currency || event.currency || 'CLP');
    }
    
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify/${ticket.qrCode}`;
    const qrCodeImage = await generateQRCodeBase64(ticket.qrCode, verificationUrl);

    logger.email.processing("courtesy_invitation_qr", invitation.invitedEmail, {
      qrSize: Math.ceil(qrCodeImage.length / 1024), 
      verificationUrl
    });

    
    const qrBase64Data = qrCodeImage.replace(/^data:image\/png;base64,/, '');
    const qrBuffer = Buffer.from(qrBase64Data, 'base64');

    const emailHtml = await render(
      React.createElement(TicketEmail, {
        userName,
        eventName: event.title,
        eventDate,
        eventLocation: event.location,
        orderNumber: `CORTESÍA-${invitation.id.slice(-8).toUpperCase()}`,
        ticketTypeName: ticket.ticketType?.name || undefined,
        tickets: [{
          qrCode: ticket.qrCode,
          qrCodeImage: qrCodeImage, 
          backupCode: ticket.qrCode
        }],
        freeUntil,
        afterPrice,
      })
    );

    const emailData = {
      from: process.env.EMAIL_FROM,
      to: invitation.invitedEmail,
      subject: `🎉 Invitación gratuita para ${event.title}`,
      html: emailHtml,
      
      attachments: [
        {
          filename: `sorykpass-ticket-${ticket.qrCode.slice(-8)}.png`,
          content: qrBuffer,
          contentType: 'image/png',
          contentDisposition: 'attachment'
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
