import * as React from "react";

interface CourtesyEmailProps {
  userName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  courtesyCode: string;
  codeType: 'FREE' | 'DISCOUNT';
  discountValue?: number | null;
  expiresAt: string;
}

export const CourtesyEmail: React.FC<Readonly<CourtesyEmailProps>> = ({
  userName,
  eventName,
  eventDate,
  eventLocation,
  courtesyCode,
  codeType,
  discountValue,
  expiresAt,
}) => (
  <html>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>{`Cortesía aprobada para ${eventName}`}</title>
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
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <tr>
                <td
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    padding: "40px 30px",
                    textAlign: "center",
                  }}
                >
                  <h1
                    style={{
                      color: "#ffffff",
                      fontSize: "28px",
                      fontWeight: "bold",
                      margin: "0 0 10px 0",
                    }}
                  >
                    🎉 ¡Cortesía Aprobada!
                  </h1>
                  <p
                    style={{
                      color: "#ffffff",
                      fontSize: "16px",
                      margin: "0",
                      opacity: "0.9",
                    }}
                  >
                    Tu solicitud de cortesía ha sido aprobada
                  </p>
                </td>
              </tr>

              {/* Main Content */}
              <tr>
                <td style={{ padding: "40px 30px" }}>
                  <p
                    style={{
                      fontSize: "16px",
                      color: "#374151",
                      margin: "0 0 20px 0",
                      lineHeight: "1.6",
                    }}
                  >
                    Hola <strong>{userName}</strong>,
                  </p>
                  
                  <p
                    style={{
                      fontSize: "16px",
                      color: "#374151",
                      margin: "0 0 30px 0",
                      lineHeight: "1.6",
                    }}
                  >
                    ¡Excelentes noticias! Tu solicitud de cortesía para el evento <strong>{eventName}</strong> ha sido aprobada.
                  </p>

                  {/* Event Details */}
                  <div
                    style={{
                      backgroundColor: "#f9fafb",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      padding: "20px",
                      margin: "0 0 30px 0",
                    }}
                  >
                    <h3
                      style={{
                        color: "#1f2937",
                        fontSize: "18px",
                        fontWeight: "bold",
                        margin: "0 0 15px 0",
                      }}
                    >
                      📅 Detalles del Evento
                    </h3>
                    <p style={{ margin: "5px 0", color: "#6b7280", fontSize: "14px" }}>
                      <strong>Evento:</strong> {eventName}
                    </p>
                    <p style={{ margin: "5px 0", color: "#6b7280", fontSize: "14px" }}>
                      <strong>Fecha:</strong> {eventDate}
                    </p>
                    <p style={{ margin: "5px 0", color: "#6b7280", fontSize: "14px" }}>
                      <strong>Ubicación:</strong> {eventLocation}
                    </p>
                  </div>

                  {/* Courtesy Code */}
                  <div
                    style={{
                      backgroundColor: codeType === 'FREE' ? "#dcfce7" : "#fef3c7",
                      border: `2px solid ${codeType === 'FREE' ? "#10b981" : "#f59e0b"}`,
                      borderRadius: "12px",
                      padding: "25px",
                      textAlign: "center",
                      margin: "0 0 30px 0",
                    }}
                  >
                    <h3
                      style={{
                        color: codeType === 'FREE' ? "#047857" : "#d97706",
                        fontSize: "20px",
                        fontWeight: "bold",
                        margin: "0 0 15px 0",
                      }}
                    >
                      {codeType === 'FREE' ? '🎫 Código de Entrada Gratuita' : `💸 Código de Descuento (${discountValue}%)`}
                    </h3>
                    
                    <div
                      style={{
                        backgroundColor: "#ffffff",
                        border: "2px dashed #9ca3af",
                        borderRadius: "8px",
                        padding: "15px",
                        margin: "15px 0",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "24px",
                          fontWeight: "bold",
                          color: "#1f2937",
                          letterSpacing: "2px",
                          fontFamily: "monospace",
                        }}
                      >
                        {courtesyCode}
                      </span>
                    </div>

                    <p
                      style={{
                        fontSize: "14px",
                        color: codeType === 'FREE' ? "#047857" : "#d97706",
                        margin: "10px 0 0 0",
                        fontWeight: "500",
                      }}
                    >
                      {codeType === 'FREE' 
                        ? 'Usa este código para obtener tu entrada gratuita'
                        : `Usa este código para obtener un ${discountValue}% de descuento`
                      }
                    </p>
                  </div>

                  {/* Instructions */}
                  <div
                    style={{
                      backgroundColor: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: "8px",
                      padding: "20px",
                      margin: "0 0 30px 0",
                    }}
                  >
                    <h3
                      style={{
                        color: "#1e40af",
                        fontSize: "16px",
                        fontWeight: "bold",
                        margin: "0 0 10px 0",
                      }}
                    >
                      📋 Instrucciones de Uso
                    </h3>
                    <ol style={{ color: "#374151", fontSize: "14px", margin: "0", paddingLeft: "20px" }}>
                      <li style={{ margin: "5px 0" }}>Ve a la página del evento</li>
                      <li style={{ margin: "5px 0" }}>Selecciona tus tickets</li>
                      <li style={{ margin: "5px 0" }}>Ingresa el código de cortesía: <strong>{courtesyCode}</strong></li>
                      <li style={{ margin: "5px 0" }}>
                        {codeType === 'FREE' 
                          ? 'Completa el proceso sin costo'
                          : 'Obtén tu descuento y completa el pago'
                        }
                      </li>
                    </ol>
                  </div>

                  {/* Expiration Warning */}
                  <div
                    style={{
                      backgroundColor: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: "8px",
                      padding: "15px",
                      margin: "0 0 30px 0",
                    }}
                  >
                    <p
                      style={{
                        color: "#dc2626",
                        fontSize: "14px",
                        margin: "0",
                        fontWeight: "500",
                      }}
                    >
                      ⏰ <strong>Importante:</strong> Este código expira el {expiresAt}. ¡No olvides usarlo antes de esa fecha!
                    </p>
                  </div>

                  <p
                    style={{
                      fontSize: "16px",
                      color: "#374151",
                      margin: "0 0 20px 0",
                      lineHeight: "1.6",
                    }}
                  >
                    ¡Esperamos verte en el evento!
                  </p>

                  <p
                    style={{
                      fontSize: "14px",
                      color: "#6b7280",
                      margin: "0",
                      lineHeight: "1.6",
                    }}
                  >
                    Saludos,<br />
                    <strong>El equipo de SoryPass</strong>
                  </p>
                </td>
              </tr>

              {/* Footer */}
              <tr>
                <td
                  style={{
                    backgroundColor: "#f3f4f6",
                    padding: "20px 30px",
                    textAlign: "center",
                    borderTop: "1px solid #e5e7eb",
                  }}
                >
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#6b7280",
                      margin: "0 0 5px 0",
                    }}
                  >
                    © 2025 SoryPass. Todos los derechos reservados.
                  </p>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#9ca3af",
                      margin: "0",
                    }}
                  >
                    Este correo fue enviado porque solicitaste una cortesía para el evento.
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
