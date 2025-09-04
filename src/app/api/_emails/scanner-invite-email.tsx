import * as React from "react";

interface ScannerInviteEmailProps {
  scannerName: string;
  organizerName: string;
  eventName: string;
  eventDate: string;
  eventLocation: string;
  loginUrl: string;
  eventUrl: string;
  isNewUser: boolean;
}

export const ScannerInviteEmail: React.FC<Readonly<ScannerInviteEmailProps>> = ({
  scannerName,
  organizerName,
  eventName,
  eventDate,
  eventLocation,
  loginUrl,
  eventUrl,
  isNewUser,
}) => (
  <html>
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>
        {isNewUser 
          ? `Invitación como validador - ${eventName}`
          : `Nueva asignación de validación - ${eventName}`
        }
      </title>
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
                borderRadius: "8px",
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
              }}
            >
              {}
              <tr>
                <td
                  style={{
                    backgroundColor: "#2563eb",
                    padding: "32px 40px",
                    textAlign: "center",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https:
                    alt="SorykPass"
                    width="150"
                    height="40"
                    style={{
                      display: "block",
                      margin: "0 auto 16px",
                    }}
                  />
                  <h1
                    style={{
                      color: "#ffffff",
                      fontSize: "24px",
                      fontWeight: "bold",
                      margin: "0",
                      lineHeight: "1.2",
                    }}
                  >
                    {isNewUser ? "🎉 ¡Bienvenido como Validador!" : "📋 Nueva Asignación de Validación"}
                  </h1>
                </td>
              </tr>

              {}
              <tr>
                <td style={{ padding: "40px" }}>
                  <p
                    style={{
                      color: "#374151",
                      fontSize: "16px",
                      lineHeight: "1.6",
                      margin: "0 0 20px",
                    }}
                  >
                    Hola <strong>{scannerName}</strong>,
                  </p>

                  {isNewUser ? (
                    <>
                      <p
                        style={{
                          color: "#374151",
                          fontSize: "16px",
                          lineHeight: "1.6",
                          margin: "0 0 20px",
                        }}
                      >
                        <strong>{organizerName}</strong> te ha invitado a ser validador de tickets en SorykPass.
                        Como validador, podrás escanear y verificar tickets para eventos asignados.
                      </p>
                      <p
                        style={{
                          color: "#374151",
                          fontSize: "16px",
                          lineHeight: "1.6",
                          margin: "0 0 20px",
                        }}
                      >
                        Hemos creado una cuenta para ti con tu dirección de email. Para activarla y comenzar:
                      </p>
                    </>
                  ) : (
                    <>
                      <p
                        style={{
                          color: "#374151",
                          fontSize: "16px",
                          lineHeight: "1.6",
                          margin: "0 0 20px",
                        }}
                      >
                        <strong>{organizerName}</strong> te ha asignado como validador para un nuevo evento.
                      </p>
                      <p
                        style={{
                          color: "#374151",
                          fontSize: "16px",
                          lineHeight: "1.6",
                          margin: "0 0 20px",
                        }}
                      >
                        Ya puedes acceder a la plataforma para validar tickets del siguiente evento:
                      </p>
                    </>
                  )}

                  {}
                  <table
                    width="100%"
                    cellPadding="0"
                    cellSpacing="0"
                    style={{
                      backgroundColor: "#f8f9fa",
                      border: "1px solid #e9ecef",
                      borderRadius: "8px",
                      margin: "24px 0",
                      padding: "20px",
                    }}
                  >
                    <tr>
                      <td>
                        <h2
                          style={{
                            color: "#2563eb",
                            fontSize: "20px",
                            fontWeight: "bold",
                            margin: "0 0 12px",
                          }}
                        >
                          🎪 {eventName}
                        </h2>
                        <p
                          style={{
                            color: "#4b5563",
                            fontSize: "14px",
                            lineHeight: "1.5",
                            margin: "0 0 8px",
                          }}
                        >
                          📅 <strong>Fecha:</strong> {eventDate}
                        </p>
                        <p
                          style={{
                            color: "#4b5563",
                            fontSize: "14px",
                            lineHeight: "1.5",
                            margin: "0",
                          }}
                        >
                          📍 <strong>Ubicación:</strong> {eventLocation}
                        </p>
                      </td>
                    </tr>
                  </table>

                  {}
                  <h3
                    style={{
                      color: "#374151",
                      fontSize: "18px",
                      fontWeight: "bold",
                      margin: "32px 0 16px",
                    }}
                  >
                    📋 Instrucciones
                  </h3>

                  {isNewUser ? (
                    <div>
                      <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.5", margin: "0 0 8px" }}>
                        <strong>1.</strong> Haz clic en el botón de abajo para acceder a la plataforma
                      </p>
                      <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.5", margin: "0 0 8px" }}>
                        <strong>2.</strong> Inicia sesión con tu email
                      </p>
                      <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.5", margin: "0 0 8px" }}>
                        <strong>3.</strong> Configura tu contraseña en el primer acceso
                      </p>
                      <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.5", margin: "0 0 8px" }}>
                        <strong>4.</strong> Desde tu dashboard, podrás ver los eventos asignados
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.5", margin: "0 0 8px" }}>
                        <strong>1.</strong> Accede a tu cuenta en SorykPass
                      </p>
                      <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.5", margin: "0 0 8px" }}>
                        <strong>2.</strong> Ve a tu dashboard de validador
                      </p>
                      <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.5", margin: "0 0 8px" }}>
                        <strong>3.</strong> Encontrarás este evento en tu lista de asignaciones
                      </p>
                      <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.5", margin: "0 0 8px" }}>
                        <strong>4.</strong> Podrás validar tickets 2 horas antes del evento
                      </p>
                    </div>
                  )}

                  {}
                  <table width="100%" cellPadding="0" cellSpacing="0" style={{ margin: "32px 0 16px" }}>
                    <tr>
                      <td align="center">
                        <a
                          href={loginUrl}
                          style={{
                            backgroundColor: "#2563eb",
                            borderRadius: "8px",
                            color: "#ffffff",
                            display: "inline-block",
                            fontSize: "16px",
                            fontWeight: "bold",
                            lineHeight: "1.5",
                            padding: "12px 32px",
                            textDecoration: "none",
                            textAlign: "center",
                          }}
                        >
                          {isNewUser ? "🚀 Activar mi cuenta" : "🔍 Ir a mi dashboard"}
                        </a>
                      </td>
                    </tr>
                  </table>

                  <table width="100%" cellPadding="0" cellSpacing="0" style={{ margin: "16px 0" }}>
                    <tr>
                      <td align="center">
                        <a
                          href={eventUrl}
                          style={{
                            backgroundColor: "#f8f9fa",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            color: "#374151",
                            display: "inline-block",
                            fontSize: "14px",
                            fontWeight: "500",
                            lineHeight: "1.5",
                            padding: "10px 24px",
                            textDecoration: "none",
                            textAlign: "center",
                          }}
                        >
                          👀 Ver detalles del evento
                        </a>
                      </td>
                    </tr>
                  </table>

                  {}
                  <table
                    width="100%"
                    cellPadding="0"
                    cellSpacing="0"
                    style={{
                      backgroundColor: "#fef3c7",
                      border: "1px solid #fcd34d",
                      borderRadius: "8px",
                      margin: "24px 0",
                      padding: "16px",
                    }}
                  >
                    <tr>
                      <td>
                        <h4
                          style={{
                            color: "#92400e",
                            fontSize: "16px",
                            fontWeight: "bold",
                            margin: "0 0 12px",
                          }}
                        >
                          💡 Información importante
                        </h4>
                        <p style={{ color: "#92400e", fontSize: "13px", lineHeight: "1.4", margin: "0 0 6px" }}>
                          • Como validador, solo podrás acceder a eventos asignados por tus organizadores
                        </p>
                        <p style={{ color: "#92400e", fontSize: "13px", lineHeight: "1.4", margin: "0 0 6px" }}>
                          • La validación estará disponible 2 horas antes del inicio del evento
                        </p>
                        <p style={{ color: "#92400e", fontSize: "13px", lineHeight: "1.4", margin: "0 0 6px" }}>
                          • Asegúrate de tener buena conexión a internet durante la validación
                        </p>
                        <p style={{ color: "#92400e", fontSize: "13px", lineHeight: "1.4", margin: "0" }}>
                          • Si tienes problemas, contacta directamente con el organizador
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              {}
              <tr>
                <td
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderTop: "1px solid #e9ecef",
                    padding: "24px 40px",
                    textAlign: "center",
                  }}
                >
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      margin: "0 0 8px",
                    }}
                  >
                    Este email fue enviado por{" "}
                    <a
                      href="https:
                      style={{
                        color: "#2563eb",
                        textDecoration: "underline",
                      }}
                    >
                      SorykPass
                    </a>
                  </p>
                  <p
                    style={{
                      color: "#6b7280",
                      fontSize: "14px",
                      lineHeight: "1.5",
                      margin: "0 0 12px",
                    }}
                  >
                    Organizador: <strong>{organizerName}</strong>
                  </p>
                  <p
                    style={{
                      color: "#9ca3af",
                      fontSize: "12px",
                      lineHeight: "1.4",
                      margin: "0",
                    }}
                  >
                    Si no esperabas este email, puedes ignorarlo. Tu cuenta solo será activada si accedes voluntariamente.
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

export default ScannerInviteEmail;
