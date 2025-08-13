/* eslint-disable @next/next/no-img-element */
import * as React from "react";

interface Ticket {
  qrCode: string;
  qrCodeImage: string; // Data URL: data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...
}

interface TicketEmailProps {
  userName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  orderNumber: string;
  tickets: Ticket[];
}

export const TicketEmail: React.FC<Readonly<TicketEmailProps>> = ({
  userName,
  eventName,
  eventDate,
  eventLocation,
  orderNumber,
  tickets,
}) => (
  <html>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{`Tus tickets para ${eventName}`}</title>
    </head>
    <body
      style={{
        margin: "0",
        padding: "0",
        backgroundColor: "#f8f9fa",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <table
        width="100%"
        cellPadding="0"
        cellSpacing="0"
        style={{
          backgroundColor: "#f8f9fa",
          padding: "20px 0",
        }}
      >
        <tr>
          <td align="center">
            <table
              width="600"
              cellPadding="0"
              cellSpacing="0"
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              }}
            >
              {/* Header */}
              <tr>
                <td
                  style={{
                    backgroundColor: "#0053CC",
                    color: "#ffffff",
                    padding: "30px",
                    textAlign: "center",
                  }}
                >
                  <h1
                    style={{
                      margin: "0",
                      fontSize: "28px",
                      fontWeight: "bold",
                    }}
                  >
                    🎫 ¡Tu compra ha sido exitosa!
                  </h1>
                </td>
              </tr>

              {/* Content */}
              <tr>
                <td style={{ padding: "30px" }}>
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
                    <strong>📱 Importante:</strong> Presenta el código QR en la
                    entrada del evento.
                    <br />
                    Puedes mostrar este email directamente desde tu teléfono.
                  </div>

                  {/* Tickets */}
                  {tickets.map((ticket, index) => (
                    <div
                      key={ticket.qrCode}
                      style={{
                        border: "2px solid #e9ecef",
                        borderRadius: "8px",
                        margin: "20px 0",
                        backgroundColor: "#ffffff",
                        overflow: "hidden",
                      }}
                    >
                      {/* Ticket Header */}
                      <div
                        style={{
                          backgroundColor: "#f8f9fa",
                          padding: "20px",
                          textAlign: "center",
                          borderBottom: "1px solid #e9ecef",
                        }}
                      >
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
                      <div style={{ padding: "24px", textAlign: "center" }}>
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
                            style={{
                              margin: "4px 0",
                              color: "#333",
                              fontSize: "14px",
                            }}
                          >
                            <strong>📅 Evento:</strong> {eventName}
                          </p>
                          <p
                            style={{
                              margin: "4px 0",
                              color: "#333",
                              fontSize: "14px",
                            }}
                          >
                            <strong>🗓️ Fecha:</strong> {eventDate}
                          </p>
                          <p
                            style={{
                              margin: "4px 0",
                              color: "#333",
                              fontSize: "14px",
                            }}
                          >
                            <strong>📍 Lugar:</strong> {eventLocation}
                          </p>
                        </div>

                        {/* QR Code Container */}
                        <div
                          style={{
                            backgroundColor: "#ffffff",
                            border: "3px solid #0053CC",
                            borderRadius: "12px",
                            padding: "24px",
                            margin: "20px 0",
                            textAlign: "center",
                          }}
                        >
                          <p
                            style={{
                              margin: "0 0 16px 0",
                              color: "#0053CC",
                              fontWeight: "bold",
                              fontSize: "18px",
                            }}
                          >
                            🔍 Tu Código QR de Acceso
                          </p>

                          <div
                            style={{
                              backgroundColor: "#e7f3ff",
                              border: "1px solid #b3d9ff",
                              borderRadius: "6px",
                              padding: "10px",
                              margin: "10px 0",
                              fontSize: "14px",
                              color: "#0056b3",
                            }}
                          >
                            📲 <strong>Instrucciones:</strong> Muestra este
                            código al personal del evento
                          </div>

                          {/* QR Code Image con Data URL */}
                          {ticket.qrCodeImage ? (
                            <div style={{ margin: "20px 0" }}>
                              <img
                                src={ticket.qrCodeImage}
                                alt={`Código QR para ${eventName}`}
                                style={{
                                  display: "block",
                                  margin: "0 auto",
                                  width: "200px",
                                  height: "200px",
                                  border: "2px solid #ddd",
                                  borderRadius: "8px",
                                  backgroundColor: "#fff",
                                  padding: "8px",
                                }}
                                width="200"
                                height="200"
                              />
                            </div>
                          ) : (
                            <div
                              style={{
                                width: "200px",
                                height: "200px",
                                margin: "20px auto",
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
                              fontFamily: "Courier, monospace",
                              padding: "12px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "6px",
                              wordBreak: "break-all",
                              border: "1px solid #e9ecef",
                              margin: "16px 0",
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
                              fontStyle: "italic",
                            }}
                          >
                            💡 Si el QR no se ve, muestra el código de respaldo
                            al personal
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Order Info */}
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
                    <p
                      style={{
                        color: "#0056b3",
                        margin: "0",
                        fontSize: "14px",
                      }}
                    >
                      Si tienes preguntas, contáctanos mencionando tu número de
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
                    &copy; {new Date().getFullYear()} SorykPass. Todos los
                    derechos reservados.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
);
