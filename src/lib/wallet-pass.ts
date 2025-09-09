import { TicketQRData } from "./qr";

export interface WalletPassData extends TicketQRData {
  organizerName: string;
  organizerEmail: string;
  venue: string;
  price: number;
  currency: string;
  orderNumber: string;
}

export function generateAppleWalletPass(passData: WalletPassData) {
  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: "pass.com.sorykpass.event",
    serialNumber: passData.ticketId,
    teamIdentifier: process.env.APPLE_TEAM_ID || "YOUR_TEAM_ID",
    organizationName: "SorykPass",
    description: `Ticket para ${passData.eventTitle}`,

    logoText: "SorykPass",
    foregroundColor: "rgb(255, 255, 255)",
    backgroundColor: "rgb(0, 83, 204)",
    labelColor: "rgb(255, 255, 255)",

    eventTicket: {
      primaryFields: [
        {
          key: "event",
          label: "EVENTO",
          value: passData.eventTitle,
        },
      ],

      secondaryFields: [
        {
          key: "date",
          label: "FECHA",
          value: new Date(passData.eventDate).toLocaleDateString("es-ES", {
            weekday: "short",
            month: "short",
            day: "numeric",
          }),
        },
        {
          key: "time",
          label: "HORA",
          value: new Date(passData.eventDate).toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],

      auxiliaryFields: [
        {
          key: "location",
          label: "UBICACIÓN",
          value: passData.eventLocation,
        },
        {
          key: "attendee",
          label: "ASISTENTE",
          value: passData.attendeeName,
        },
      ],

      backFields: [
        {
          key: "organizer",
          label: "Organizador",
          value: passData.organizerName,
        },
        {
          key: "email",
          label: "Email de contacto",
          value: passData.organizerEmail,
        },
        {
          key: "order",
          label: "Número de orden",
          value: passData.orderNumber,
        },
        {
          key: "price",
          label: "Precio",
          value:
            passData.price > 0
              ? `$${passData.price.toLocaleString("es-CL")} ${
                  passData.currency
                }`
              : "Gratis",
        },
        {
          key: "terms",
          label: "Términos y Condiciones",
          value:
            "Presente este ticket en el evento. No transferible. Válido solo para la fecha especificada.",
        },
      ],
    },

    barcode: {
      message: `${process.env.NEXT_PUBLIC_APP_URL}/verify/${passData.qrCode}`,
      format: "PKBarcodeFormatQR",
      messageEncoding: "iso-8859-1",
    },

    relevantDate: passData.eventDate,
    expirationDate: new Date(
      new Date(passData.eventDate).getTime() + 24 * 60 * 60 * 1000
    ).toISOString(), 

    locations: [
      {
        latitude: -39.8142,
        longitude: -73.2459,
        relevantText: `Estás cerca de: ${passData.eventLocation}`,
      },
    ],

    webServiceURL: `${process.env.NEXT_PUBLIC_APP_URL}/api/wallet/passes`,
    authenticationToken: generatePassAuthToken(passData.ticketId),
  };

  return passJson;
}

export function generateGooglePayPass(passData: WalletPassData) {
  const classId = `${
    process.env.GOOGLE_PAY_ISSUER_ID || "YOUR_ISSUER_ID"
  }.sorykpass_event_class`;
  const objectId = `${process.env.GOOGLE_PAY_ISSUER_ID || "YOUR_ISSUER_ID"}.${
    passData.ticketId
  }`;

  const eventTicketObject = {
    id: objectId,
    classId: classId,
    state: "ACTIVE",
    heroImage: {
      sourceUri: {
        uri: passData.eventLocation.includes("http")
          ? passData.eventLocation
          : `${process.env.NEXT_PUBLIC_APP_URL}/default-event.jpg`,
      },
    },
    textModulesData: [
      {
        id: "attendee",
        header: "Asistente",
        body: passData.attendeeName,
      },
      {
        id: "organizer",
        header: "Organizador",
        body: passData.organizerName,
      },
      {
        id: "order",
        header: "Orden",
        body: passData.orderNumber,
      },
    ],
    linksModuleData: {
      uris: [
        {
          uri: `${process.env.NEXT_PUBLIC_APP_URL}/events/${passData.eventId}`,
          description: "Ver detalles del evento",
        },
        {
          uri: `${process.env.NEXT_PUBLIC_APP_URL}/tickets`,
          description: "Mis tickets",
        },
      ],
    },
    imageModulesData: [
      {
        id: "event_image",
        mainImage: {
          sourceUri: {
            uri: `${process.env.NEXT_PUBLIC_APP_URL}/qr/${passData.qrCode}.png`,
          },
          contentDescription: {
            defaultValue: {
              language: "es",
              value: "Código QR del ticket",
            },
          },
        },
      },
    ],
    barcode: {
      type: "QR_CODE",
      value: `${process.env.NEXT_PUBLIC_APP_URL}/verify/${passData.qrCode}`,
      alternateText: passData.qrCode,
    },
    ticketHolderName: passData.attendeeName,
    seatInfo: {
      seat: {
        defaultValue: {
          language: "es",
          value: "Admisión General",
        },
      },
    },
  };

  return {
    iss: process.env.GOOGLE_PAY_SERVICE_ACCOUNT_EMAIL,
    aud: "google",
    typ: "savetowallet",
    payload: {
      eventTicketObjects: [eventTicketObject],
    },
  };
}

function generatePassAuthToken(ticketId: string): string {
  return Buffer.from(`${ticketId}-${Date.now()}`)
    .toString("base64")
    .substring(0, 20);
}

export function generateAppleWalletURL(passData: WalletPassData): string {
  const baseUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/wallet/apple-pass`;
  const params = new URLSearchParams({
    ticketId: passData.ticketId,
    t: Date.now().toString(),
  });
  return `${baseUrl}?${params.toString()}`;
}

export function generateGooglePayURL(passData: WalletPassData): string {
  try {
    const googlePayData = generateGooglePayPass(passData);
    const jwt = generateJWT(googlePayData);
    return `https://pay.google.com/gp/v/save/${jwt}`;
  } catch (error) {
    console.error("Error generating Google Pay URL:", error);
    return "#";
  }
}

function generateJWT(payload: object): string {
  const header = Buffer.from(
    JSON.stringify({ alg: "RS256", typ: "JWT" })
  ).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");

  return `${header}.${body}.SIGNATURE_REQUIRED`;
}

export function getWalletSupport() {
  if (typeof window === "undefined") {
    return { apple: false, google: false };
  }

  const userAgent = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);

  return {
    apple: isIOS || isSafari,
    google: isAndroid || !isIOS,
    native: isIOS || isAndroid,
  };
}
