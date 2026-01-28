
import * as React from "react";

interface Ticket {
  qrCode: string;
  qrCodeImage: string; 
  qrCodeUrl?: string; 
  backupCode?: string;
  seatInfo?: {
    sectionName: string;
    row: string;
    number: string;
    sectionColor?: string;
  };
}

interface TicketEmailProps {
  userName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  orderNumber: string;
  tickets: Ticket[];
  ticketTypeName?: string;
  freeUntil?: string;
  afterPrice?: string;
  attachmentMode?: boolean; // Si es true, los QR están en PDF adjunto
}

export const TicketEmail: React.FC<Readonly<TicketEmailProps>> = ({
  userName,
  eventName,
  eventDate,
  eventLocation,
  orderNumber,
  tickets,
  ticketTypeName,
  freeUntil,
  afterPrice,
  attachmentMode = false,
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
              {}
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

              {}
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

                  <div
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "8px",
                      padding: "12px 16px",
                      margin: "20px 0",
                      color: "#333",
                      textAlign: "left",
                      fontSize: "15px",
                      lineHeight: "1.4",
                    }}
                  >
                    <strong>Instrucciones de Uso —</strong> ⏰ Gratis hasta: {freeUntil || '—'}. A partir de esa hora, el precio será {afterPrice || '—'}. Llega al evento con este email en tu teléfono; muestra el código QR al personal de entrada; si hay problemas, usa el código de respaldo; ten tu identificación lista para verificar.
                  </div>

                  {}
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
                      {}
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

                      {}
                      <div style={{ padding: "24px", textAlign: "center" }}>
                        {}
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
                          {ticketTypeName && (
                            <p
                              style={{
                                margin: "4px 0",
                                color: "#333",
                                fontSize: "14px",
                              }}
                            >
                              <strong>🎫 Tipo de ticket:</strong> {ticketTypeName}
                            </p>
                          )}
                          <p
                            style={{
                              margin: "4px 0",
                              color: "#333",
                              fontSize: "14px",
                            }}
                          >
                            <strong>📍 Lugar:</strong> {eventLocation}
                          </p>
                          {ticket.seatInfo && (
                            <>
                              <hr style={{ 
                                border: "none", 
                                borderTop: "1px solid #dee2e6", 
                                margin: "12px 0" 
                              }} />
                              <div style={{
                                backgroundColor: ticket.seatInfo.sectionColor || "#e7f3ff",
                                padding: "12px",
                                borderRadius: "6px",
                                marginTop: "8px"
                              }}>
                                <p style={{
                                  margin: "0",
                                  color: "#0056b3",
                                  fontSize: "15px",
                                  fontWeight: "bold"
                                }}>
                                  🪑 Información de Asiento
                                </p>
                                <p style={{
                                  margin: "8px 0 0 0",
                                  color: "#333",
                                  fontSize: "14px"
                                }}>
                                  <strong>Sección:</strong> {ticket.seatInfo.sectionName}<br />
                                  <strong>Fila:</strong> {ticket.seatInfo.row} | <strong>Asiento:</strong> {ticket.seatInfo.number}
                                </p>
                              </div>
                            </>
                          )}
                        </div>

                        {}
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

                          {}
                          {attachmentMode ? (
                            <div style={{ margin: "20px 0", textAlign: "center" }}>
                              {}
                              <div
                                style={{
                                  marginBottom: "15px",
                                  padding: "20px",
                                  backgroundColor: "#e8f5e9",
                                  borderRadius: "8px",
                                  fontSize: "16px",
                                  color: "#2e7d32",
                                  border: "2px solid #81c784",
                                }}
                              >
                                📎 <strong>Tus tickets están adjuntos en PDF</strong><br />
                                <div style={{ marginTop: "10px", fontSize: "14px", color: "#558b2f" }}>
                                  Descarga los archivos PDF adjuntos a este correo.<br />
                                  Cada PDF contiene un código QR único para acceder al evento.
                                </div>
                              </div>
                              
                              {}
                              <div
                                style={{
                                  backgroundColor: "#fff3e0",
                                  padding: "15px",
                                  borderRadius: "6px",
                                  fontSize: "13px",
                                  color: "#ef6c00",
                                  border: "1px solid #ffcc80",
                                  textAlign: "left",
                                }}
                              >
                                <strong>📱 Cómo usar tus tickets:</strong>
                                <ol style={{ margin: "10px 0 0 20px", paddingLeft: "0" }}>
                                  <li>Descarga los PDFs adjuntos a tu dispositivo</li>
                                  <li>Guárdalos en tu teléfono o imprímelos</li>
                                  <li>Presenta el código QR en la entrada del evento</li>
                                </ol>
                              </div>
                            </div>
                          ) : ticket.qrCodeImage ? (
                            <div style={{ margin: "20px 0", textAlign: "center" }}>
                              {}
                              <div
                                style={{
                                  marginBottom: "15px",
                                  padding: "10px",
                                  backgroundColor: "#e3f2fd",
                                  borderRadius: "6px",
                                  fontSize: "14px",
                                  color: "#1565c0",
                                  border: "1px solid #bbdefb",
                                }}
                              >
                                📱 <strong>Tu código QR está listo</strong><br />
                                Usa este código para acceder al evento
                              </div>
                              
                              {}
                              <div
                                style={{
                                  backgroundColor: "#ffffff",
                                  padding: "15px",
                                  borderRadius: "12px",
                                  border: "3px solid #e0e0e0",
                                  display: "inline-block",
                                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                                }}
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={ticket.qrCodeImage}
                                  alt={`Código QR para acceder a ${eventName}`}
                                  title={`Tu ticket para ${eventName}`}
                                  style={{
                                    display: "block",
                                    margin: "0 auto",
                                    width: "200px",
                                    height: "200px",
                                    maxWidth: "200px",
                                    maxHeight: "200px",
                                    border: "none",
                                    borderRadius: "4px",
                                    backgroundColor: "#ffffff",
                                    outline: "none",
                                  }}
                                  width="200"
                                  height="200"
                                />
                              </div>
                              
                              {}
                              <div
                                style={{
                                  marginTop: "15px",
                                  padding: "10px",
                                  backgroundColor: "#fff3e0",
                                  borderRadius: "6px",
                                  fontSize: "12px",
                                  color: "#ef6c00",
                                  border: "1px solid #ffcc02",
                                }}
                              >
                                💡 <strong>¿No ves el código QR?</strong><br />
                                Habilita la visualización de imágenes en tu email o usa el código de respaldo abajo
                              </div>
                            </div>
                          ) : (
                            <div
                              style={{
                                width: "220px",
                                height: "220px",
                                margin: "20px auto",
                                backgroundColor: "#f8f9fa",
                                border: "2px dashed #ccc",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: "#666",
                                fontSize: "14px",
                                textAlign: "center",
                                padding: "20px",
                                boxSizing: "border-box",
                              }}
                            >
                              <div>
                                ⚠️ <strong>QR no disponible</strong><br />
                                <div style={{ fontSize: "12px", marginTop: "8px" }}>
                                  Usa el código de respaldo abajo
                                </div>
                              </div>
                            </div>
                          )}

                          {}
                          <div
                            style={{
                              margin: "20px 0",
                              padding: "16px",
                              backgroundColor: "#f8f9fa",
                              borderRadius: "8px",
                              border: "1px solid #dee2e6",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "14px",
                                color: "#495057",
                                marginBottom: "8px",
                                fontWeight: "bold",
                              }}
                            >
                              🔢 Código de Respaldo
                            </div>
                            <div
                              style={{
                                fontSize: "16px",
                                color: "#212529",
                                fontFamily: "'Courier New', Courier, monospace",
                                padding: "12px",
                                backgroundColor: "#ffffff",
                                borderRadius: "6px",
                                wordBreak: "break-all",
                                border: "2px solid #e9ecef",
                                letterSpacing: "1px",
                                fontWeight: "bold",
                                textAlign: "center",
                              }}
                            >
                              {ticket.backupCode || ticket.qrCode}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#6c757d",
                                marginTop: "8px",
                                textAlign: "center",
                              }}
                            >
                              💡 Muestra este código al personal si el QR no funciona
                            </div>
                          </div>

                          {}
                          <div
                            style={{
                              marginTop: "20px",
                              padding: "15px",
                              backgroundColor: "#e8f5e8",
                              borderRadius: "8px",
                              border: "1px solid #c3e6c3",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "14px",
                                color: "#155724",
                                fontWeight: "bold",
                                marginBottom: "8px",
                              }}
                            >
                              ✅ Instrucciones de Uso
                            </div>
                            {freeUntil && (
                              <div
                                style={{
                                  backgroundColor: '#fffef6',
                                  border: '1px solid #fff0b3',
                                  padding: '10px',
                                  borderRadius: '6px',
                                  marginBottom: '12px',
                                  color: '#856404'
                                }}
                              >
                                ⏰ <strong>Gratis hasta:</strong> {freeUntil}
                                {afterPrice && (
                                  <div style={{ marginTop: '6px' }}>A partir de esa hora, el precio será {afterPrice}</div>
                                )}
                              </div>
                            )}
                            <ul
                              style={{
                                fontSize: "13px",
                                color: "#155724",
                                margin: "0",
                                paddingLeft: "20px",
                                lineHeight: "1.5",
                              }}
                            >
                              <li>Llega al evento con este email en tu teléfono</li>
                              <li>Muestra el código QR al personal de entrada</li>
                              <li>Si hay problemas, usa el código de respaldo</li>
                              <li>Ten tu identificación lista para verificar</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {}
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

              {}
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
