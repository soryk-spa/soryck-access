import * as React from "react";
import Image from "next/image";

interface Ticket {
  qrCode: string;
  qrCodeImage: string;
}

interface TicketEmailProps {
  userName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  orderNumber: string;
  tickets: Ticket[];
}

const mainStyle = {
  fontFamily: "Arial, sans-serif",
  backgroundColor: "#f4f4f4",
  padding: "20px",
};

const containerStyle = {
  backgroundColor: "#ffffff",
  maxWidth: "600px",
  margin: "0 auto",
  padding: "30px",
  borderRadius: "8px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
};

const h1Style = {
  color: "#0053CC",
  fontSize: "24px",
};

const pStyle = {
  color: "#555555",
  lineHeight: "1.6",
};

const ticketBoxStyle = {
  border: "1px solid #dddddd",
  padding: "20px",
  margin: "20px 0",
  borderRadius: "8px",
  textAlign: "center" as const,
};

const footerStyle = {
  textAlign: "center" as const,
  marginTop: "20px",
  fontSize: "12px",
  color: "#888888",
};

export const TicketEmail: React.FC<Readonly<TicketEmailProps>> = ({
  userName,
  eventName,
  eventDate,
  eventLocation,
  orderNumber,
  tickets,
}) => (
  <div style={mainStyle}>
    <div style={containerStyle}>
      <h1 style={h1Style}>¡Tu compra ha sido exitosa!</h1>
      <p style={pStyle}>Hola {userName},</p>
      <p style={pStyle}>
        ¡Gracias por tu compra! Aquí están tus tickets para{" "}
        <strong>{eventName}</strong>. Presenta el código QR en la entrada del
        evento.
      </p>

      {tickets.map((ticket, index) => (
        <div key={ticket.qrCode} style={ticketBoxStyle}>
          <h2 style={{ color: "#333" }}>
            Ticket {index + 1} de {tickets.length}
          </h2>
          <p style={pStyle}>
            <strong>Evento:</strong> {eventName}
            <br />
            <strong>Fecha:</strong> {eventDate}
            <br />
            <strong>Lugar:</strong> {eventLocation}
            <Image
              src={ticket.qrCodeImage}
              alt="Código QR del Ticket"
              width={200}
              height={200}
              style={{ margin: "10px auto" }}
            />
          </p>
          <p
            style={{ fontSize: "12px", color: "#666", fontFamily: "monospace" }}
          >
            Código: {ticket.qrCode}
          </p>
        </div>
      ))}

      <p style={pStyle}>
        <strong>Número de Orden:</strong> {orderNumber}
        <br />
        Si tienes alguna pregunta, no dudes en contactarnos.
      </p>
      <p style={pStyle}>¡Nos vemos en el evento!</p>
      <p style={pStyle}>El equipo de SorykPass</p>
    </div>
    <div style={footerStyle}>
      <p>
        &copy; {new Date().getFullYear()} SorykPass. Todos los derechos
        reservados.
      </p>
    </div>
  </div>
);
