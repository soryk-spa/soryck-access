/* eslint-disable @next/next/no-img-element */
import * as React from "react";

interface Ticket {
  qrCode: string;
  qrCodeImage: string; // URL estática: https://tudominio.com/qr/ABC123...png
}

interface TicketEmailProps {
  userName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  orderNumber: string;
  tickets: Ticket[];
}

// Estilos optimizados para máxima compatibilidad con archivos estáticos
const tableStyle = {
  width: "100%",
  maxWidth: "600px",
  margin: "0 auto",
  borderCollapse: "collapse" as const,
  fontFamily: "Arial, sans-serif",
  backgroundColor: "#ffffff",
};

const headerCellStyle = {
  backgroundColor: "#0053CC",
  color: "#ffffff",
  padding: "30px",
  textAlign: "center" as const,
};

const contentCellStyle = {
  backgroundColor: "#ffffff",
  padding: "30px",
  textAlign: "left" as const,
};

const ticketContainerStyle = {
  border: "2px solid #e9ecef",
  borderRadius: "8px",
  margin: "20px 0",
  backgroundColor: "#ffffff",
  overflow: "hidden",
};

const ticketHeaderStyle = {
  backgroundColor: "#f8f9fa",
  padding: "20px",
  textAlign: "center" as const,
  borderBottom: "1px solid #e9ecef",
};

const ticketContentStyle = {
  padding: "24px",
  textAlign: "center" as const,
};

export const TicketEmail: React.FC<Readonly<TicketEmailProps>> = ({
  userName,
  eventName,
  eventDate,
  eventLocation,
  orderNumber,
  tickets,
}) => (
  <div style={{ backgroundColor: "#f8f9fa", padding: "20px" }}>
    <table style={tableStyle}>
      {/* Header */}
      <tr>
        <td style={headerCellStyle}>
          <h1
            style={{
              margin: "0",
              fontSize: "28px",
              fontWeight: "bold",
              color: "#ffffff",
            }}
          >
            🎫 ¡Tu compra ha sido exitosa!
          </h1>
        </td>
      </tr>

      {/* Main Content */}
      <tr>
        <td style={contentCellStyle}>
          <p
            style={{
              color: "#333",
              fontSize: "16px",
              lineHeight: "1.6",
              margin: "0 0 16px 0",
            }}
          >
            <strong>Hola {userName},</strong>
          </p>

          <p
            style={{
              color: "#333",
              fontSize: "16px",
              lineHeight: "1.6",
              margin: "0 0 20px 0",
            }}
          >
            ¡Gracias por tu compra! Aquí están tus tickets para{" "}
            <strong>{eventName}</strong>.
          </p>

          <div
            style={{
              backgroundColor: "#fff3cd",
              border: "1px solid #ffeaa7",
              borderRadius: "8px",
              padding: "16px",
              margin: "20px 0",
              color: "#856404",
              textAlign: "center",
            }}
          >
            <strong>📱 Importante:</strong> Presenta el código QR en la entrada
            del evento.
            <br />
            Puedes mostrar este email directamente desde tu teléfono.
          </div>

          {/* Tickets */}
          {tickets.map((ticket, index) => (
            <div key={ticket.qrCode} style={ticketContainerStyle}>
              {/* Ticket Header */}
              <div style={ticketHeaderStyle}>
                <h2
                  style={{
                    color: "#0053CC",
                    fontSize: "20px",
                    fontWeight: "bold",
                    margin: "0",
                  }}
                >
                  🎟️ Ticket {index + 1} de {tickets.length}
                </h2>
              </div>

              {/* Ticket Content */}
              <div style={ticketContentStyle}>
                {/* Event Details */}
                <div
                  style={{
                    backgroundColor: "#f8f9fa",
                    padding: "16px",
                    borderRadius: "8px",
                    margin: "16px 0",
                    textAlign: "left",
                  }}
                >
                  <p
                    style={{ margin: "4px 0", color: "#333", fontSize: "14px" }}
                  >
                    <strong>📅 Evento:</strong> {eventName}
                  </p>
                  <p
                    style={{ margin: "4px 0", color: "#333", fontSize: "14px" }}
                  >
                    <strong>🗓️ Fecha:</strong> {eventDate}
                  </p>
                  <p
                    style={{ margin: "4px 0", color: "#333", fontSize: "14px" }}
                  >
                    <strong>📍 Lugar:</strong> {eventLocation}
                  </p>
                </div>

                {/* QR Code */}
                <div
                  style={{
                    backgroundColor: "#ffffff",
                    border: "2px solid #0053CC",
                    borderRadius: "12px",
                    padding: "20px",
                    margin: "20px 0",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 16px 0",
                      color: "#0053CC",
                      fontWeight: "bold",
                      fontSize: "16px",
                    }}
                  >
                    🔍 Tu Código QR de Acceso
                  </p>

                  {/* QR Image - usando archivo estático */}
                  {ticket.qrCodeImage ? (
                    <img
                      src={ticket.qrCodeImage}
                      alt={`Código QR para ${eventName}`}
                      style={{
                        display: "block",
                        margin: "0 auto 16px auto",
                        width: "200px",
                        height: "200px",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        backgroundColor: "#fff",
                      }}
                      width="200"
                      height="200"
                    />
                  ) : (
                    <div
                      style={{
                        width: "200px",
                        height: "200px",
                        margin: "0 auto 16px auto",
                        backgroundColor: "#f8f9fa",
                        border: "2px dashed #ccc",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#666",
                        fontSize: "14px",
                      }}
                    >
                      ⚠️ QR no disponible
                    </div>
                  )}

                  {/* Backup Code */}
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      fontFamily: "monospace",
                      padding: "12px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "6px",
                      wordBreak: "break-all",
                      border: "1px solid #e9ecef",
                    }}
                  >
                    <strong>Código de respaldo:</strong>
                    <br />
                    {ticket.qrCode}
                  </div>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      marginTop: "12px",
                      fontStyle: "italic",
                    }}
                  >
                    💡 En caso de problemas, muestra el código de respaldo al
                    personal del evento
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Order Information */}
          <div
            style={{
              backgroundColor: "#e7f3ff",
              border: "1px solid #b3d9ff",
              borderRadius: "8px",
              padding: "16px",
              margin: "20px 0",
            }}
          >
            <p
              style={{
                color: "#0056b3",
                margin: "0 0 8px 0",
                fontWeight: "bold",
              }}
            >
              📋 Información de tu compra
            </p>
            <p
              style={{
                color: "#0056b3",
                margin: "0 0 8px 0",
                fontSize: "14px",
              }}
            >
              <strong>Número de Orden:</strong> {orderNumber}
            </p>
            <p style={{ color: "#0056b3", margin: "0", fontSize: "14px" }}>
              Si tienes alguna pregunta, contáctanos mencionando tu número de
              orden.
            </p>
          </div>

          <div
            style={{
              textAlign: "center",
              padding: "20px 0",
              borderTop: "1px solid #e9ecef",
              marginTop: "30px",
            }}
          >
            <p
              style={{
                color: "#333",
                fontSize: "18px",
                fontWeight: "bold",
                margin: "0 0 8px 0",
              }}
            >
              ¡Nos vemos en el evento! 🎉
            </p>
            <p style={{ color: "#666", fontSize: "14px", margin: "0" }}>
              El equipo de SorykPass
            </p>
          </div>
        </td>
      </tr>

      {/* Footer */}
      <tr>
        <td
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            textAlign: "center",
            fontSize: "12px",
            color: "#6c757d",
            borderTop: "1px solid #e9ecef",
          }}
        >
          <p style={{ margin: "0 0 8px 0" }}>
            &copy; {new Date().getFullYear()} SorykPass. Todos los derechos
            reservados.
          </p>
          <p style={{ margin: "0" }}>
            🌐 Gestiona tus tickets en:{" "}
            <a
              href={`${process.env.NEXT_PUBLIC_APP_URL}/tickets`}
              style={{ color: "#0053CC" }}
            >
              SorykPass
            </a>
          </p>
        </td>
      </tr>
    </table>
  </div>
);
