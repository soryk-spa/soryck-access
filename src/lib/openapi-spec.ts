import type { OpenAPIV3 } from "openapi-types";

export const openapiSpec: OpenAPIV3.Document = {
  openapi: "3.0.3",
  info: {
    title: "Soryck Access API",
    version: "1.0.0",
    description:
      "API pública y privada de la plataforma Soryck Access para gestión de eventos, tickets, pagos y control de acceso.",
    contact: {
      name: "Soryck",
      url: "https://sorykpass.com",
    },
  },
  servers: [
    {
      url: "/api",
      description: "Servidor actual",
    },
  ],
  security: [{ ClerkAuth: [] }],
  components: {
    securitySchemes: {
      ClerkAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Token JWT emitido por Clerk. Incluir en el header Authorization: Bearer <token>",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          error: { type: "string", example: "Mensaje de error" },
        },
      },
      Event: {
        type: "object",
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          description: { type: "string", nullable: true },
          location: { type: "string" },
          startDate: { type: "string", format: "date-time" },
          endDate: { type: "string", format: "date-time", nullable: true },
          imageUrl: { type: "string", nullable: true },
          isPublished: { type: "boolean" },
          hasSeatingPlan: { type: "boolean" },
          allowCourtesy: { type: "boolean" },
          categoryId: { type: "string" },
          venueId: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      TicketType: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string", nullable: true },
          price: { type: "number" },
          capacity: { type: "number" },
          ticketsGenerated: { type: "number" },
          eventId: { type: "string" },
        },
      },
      Order: {
        type: "object",
        properties: {
          id: { type: "string" },
          status: {
            type: "string",
            enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED"],
          },
          totalAmount: { type: "number" },
          userId: { type: "string" },
          eventId: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Ticket: {
        type: "object",
        properties: {
          id: { type: "string" },
          qrCode: { type: "string" },
          isUsed: { type: "boolean" },
          usedAt: { type: "string", format: "date-time", nullable: true },
          orderId: { type: "string" },
          ticketTypeId: { type: "string" },
        },
      },
      PromoCode: {
        type: "object",
        properties: {
          id: { type: "string" },
          code: { type: "string" },
          discountType: { type: "string", enum: ["PERCENTAGE", "FIXED"] },
          discountValue: { type: "number" },
          isActive: { type: "boolean" },
          maxUses: { type: "number", nullable: true },
          currentUses: { type: "number" },
          expiresAt: { type: "string", format: "date-time", nullable: true },
          eventId: { type: "string" },
        },
      },
      MPCard: {
        type: "object",
        properties: {
          id: { type: "string" },
          last_four_digits: { type: "string" },
          payment_method_id: { type: "string" },
          payment_type_id: { type: "string" },
          expiration_month: { type: "number" },
          expiration_year: { type: "number" },
          cardholder: {
            type: "object",
            properties: {
              name: { type: "string" },
            },
          },
        },
      },
      UserProfile: {
        type: "object",
        properties: {
          id: { type: "string" },
          clerkId: { type: "string" },
          email: { type: "string" },
          role: { type: "string", enum: ["USER", "ORGANIZER", "SCANNER", "ADMIN"] },
          firstName: { type: "string", nullable: true },
          lastName: { type: "string", nullable: true },
          phone: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Venue: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          address: { type: "string", nullable: true },
          city: { type: "string", nullable: true },
          capacity: { type: "number", nullable: true },
        },
      },
    },
  },
  tags: [
    { name: "Events", description: "Gestión de eventos" },
    { name: "Tickets", description: "Tickets y QR de acceso" },
    { name: "Orders", description: "Órdenes de compra" },
    { name: "Payments", description: "Pagos (Transbank)" },
    { name: "Mercado Pago", description: "Pagos y tarjetas guardadas (Mercado Pago)" },
    { name: "Promo Codes", description: "Códigos promocionales" },
    { name: "Discount Codes", description: "Códigos de descuento" },
    { name: "Courtesy", description: "Sistema de cortesías e invitaciones" },
    { name: "User", description: "Perfil y configuración de usuario" },
    { name: "Organizer", description: "Herramientas para organizadores" },
    { name: "Admin", description: "Panel de administración" },
    { name: "Venues", description: "Recintos y salas con plano de asientos" },
    { name: "Seating", description: "Sistema de reserva de asientos" },
    { name: "Verify", description: "Verificación y escaneo de tickets" },
    { name: "Webhooks", description: "Webhooks de proveedores externos" },
    { name: "Health", description: "Estado del sistema" },
  ],
  paths: {
    // ─── EVENTS ──────────────────────────────────────────────────────────────
    "/events": {
      get: {
        tags: ["Events"],
        summary: "Listar eventos del organizador autenticado",
        security: [{ ClerkAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 20 } },
          { name: "search", in: "query", schema: { type: "string" } },
        ],
        responses: {
          "200": {
            description: "Lista de eventos",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    events: { type: "array", items: { $ref: "#/components/schemas/Event" } },
                    total: { type: "integer" },
                    page: { type: "integer" },
                    totalPages: { type: "integer" },
                  },
                },
              },
            },
          },
          "401": { description: "No autenticado", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
          "403": { description: "Rol insuficiente (requiere ORGANIZER o ADMIN)" },
        },
      },
      post: {
        tags: ["Events"],
        summary: "Crear nuevo evento",
        security: [{ ClerkAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["title", "location", "startDate", "categoryId", "ticketTypes"],
                properties: {
                  title: { type: "string", maxLength: 100 },
                  description: { type: "string", nullable: true },
                  location: { type: "string", maxLength: 200 },
                  startDate: { type: "string", format: "date-time" },
                  endDate: { type: "string", format: "date-time", nullable: true },
                  categoryId: { type: "string" },
                  imageUrl: { type: "string", format: "uri", nullable: true },
                  allowCourtesy: { type: "boolean", default: false },
                  hasSeatingPlan: { type: "boolean", default: false },
                  venueId: { type: "string", nullable: true },
                  ticketTypes: {
                    type: "array",
                    minItems: 1,
                    items: { $ref: "#/components/schemas/TicketType" },
                  },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Evento creado", content: { "application/json": { schema: { $ref: "#/components/schemas/Event" } } } },
          "400": { description: "Validación fallida" },
          "401": { description: "No autenticado" },
          "403": { description: "Rol insuficiente" },
        },
      },
    },
    "/events/public": {
      get: {
        tags: ["Events"],
        summary: "Listar eventos públicos publicados",
        security: [],
        parameters: [
          { name: "categoryId", in: "query", schema: { type: "string" } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
        ],
        responses: {
          "200": {
            description: "Lista de eventos públicos",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    events: { type: "array", items: { $ref: "#/components/schemas/Event" } },
                    total: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/events/{id}": {
      get: {
        tags: ["Events"],
        summary: "Obtener evento por ID",
        security: [{ ClerkAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Detalle del evento", content: { "application/json": { schema: { $ref: "#/components/schemas/Event" } } } },
          "404": { description: "Evento no encontrado" },
        },
      },
      put: {
        tags: ["Events"],
        summary: "Actualizar evento",
        security: [{ ClerkAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/Event" } } },
        },
        responses: {
          "200": { description: "Evento actualizado" },
          "403": { description: "No tienes permiso para editar este evento" },
          "404": { description: "Evento no encontrado" },
        },
      },
      delete: {
        tags: ["Events"],
        summary: "Eliminar evento",
        security: [{ ClerkAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Evento eliminado" },
          "403": { description: "No tienes permiso" },
          "404": { description: "Evento no encontrado" },
        },
      },
    },
    "/events/{id}/publish": {
      post: {
        tags: ["Events"],
        summary: "Publicar / despublicar evento",
        security: [{ ClerkAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["isPublished"],
                properties: { isPublished: { type: "boolean" } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Estado de publicación actualizado" },
          "403": { description: "No tienes permiso" },
        },
      },
    },
    "/events/{id}/ticket-types": {
      get: {
        tags: ["Events"],
        summary: "Obtener tipos de ticket del evento",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Lista de tipos de ticket", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/TicketType" } } } } },
        },
      },
    },
    "/events/{id}/purchase/create-payment": {
      post: {
        tags: ["Payments"],
        summary: "Iniciar pago con Transbank para un evento",
        security: [{ ClerkAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["ticketTypeId", "quantity"],
                properties: {
                  ticketTypeId: { type: "string" },
                  quantity: { type: "integer", minimum: 1, maximum: 10 },
                  promoCode: { type: "string", nullable: true },
                  discountCode: { type: "string", nullable: true },
                  selectedSeats: { type: "array", items: { type: "string" }, nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "URL de pago Transbank",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    url: { type: "string", format: "uri" },
                    token: { type: "string" },
                  },
                },
              },
            },
          },
          "400": { description: "Validación fallida o tickets insuficientes" },
        },
      },
    },
    "/events/{id}/purchase/confirm": {
      post: {
        tags: ["Payments"],
        summary: "Confirmar pago Transbank",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token_ws"],
                properties: { token_ws: { type: "string" } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Pago confirmado y tickets generados" },
          "400": { description: "Pago rechazado o token inválido" },
        },
      },
    },
    "/events/{id}/scan": {
      post: {
        tags: ["Verify"],
        summary: "Escanear QR de ticket en un evento",
        security: [{ ClerkAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["qrCode"],
                properties: { qrCode: { type: "string" } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Ticket válido, marcar como usado" },
          "400": { description: "Ticket ya usado o inválido" },
          "403": { description: "Sin permiso para escanear en este evento" },
          "404": { description: "Ticket no encontrado" },
        },
      },
    },
    "/events/{id}/scanners": {
      get: {
        tags: ["Events"],
        summary: "Listar scanners asignados al evento",
        security: [{ ClerkAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Lista de scanners del evento" },
        },
      },
      post: {
        tags: ["Events"],
        summary: "Asignar scanner a evento",
        security: [{ ClerkAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId"],
                properties: { userId: { type: "string" } },
              },
            },
          },
        },
        responses: {
          "201": { description: "Scanner asignado" },
          "409": { description: "Scanner ya asignado" },
        },
      },
    },
    "/events/{id}/sections": {
      get: {
        tags: ["Seating"],
        summary: "Listar secciones del evento (plano de asientos)",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Secciones con asientos disponibles" } },
      },
      post: {
        tags: ["Seating"],
        summary: "Crear sección en el evento",
        security: [{ ClerkAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "201": { description: "Sección creada" } },
      },
    },
    "/events/{id}/seating": {
      get: {
        tags: ["Seating"],
        summary: "Obtener mapa de asientos del evento",
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Estado de todos los asientos" } },
      },
    },
    "/events/{id}/seating/reserve": {
      post: {
        tags: ["Seating"],
        summary: "Reservar asiento temporalmente",
        security: [{ ClerkAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["seatIds"],
                properties: { seatIds: { type: "array", items: { type: "string" } } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Asientos reservados temporalmente" },
          "409": { description: "Asiento(s) ya reservados" },
        },
      },
    },
    "/events/{id}/seating/release": {
      post: {
        tags: ["Seating"],
        summary: "Liberar reserva temporal de asientos",
        security: [{ ClerkAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Reserva liberada" } },
      },
    },
    "/events/{id}/courtesy": {
      get: {
        tags: ["Courtesy"],
        summary: "Listar cortesías del evento",
        security: [{ ClerkAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Lista de cortesías" } },
      },
      post: {
        tags: ["Courtesy"],
        summary: "Crear solicitud de cortesía para el evento",
        security: [{ ClerkAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "201": { description: "Cortesía creada" } },
      },
    },
    "/events/{id}/invitations": {
      get: {
        tags: ["Courtesy"],
        summary: "Listar invitaciones del evento",
        security: [{ ClerkAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Lista de invitaciones" } },
      },
      post: {
        tags: ["Courtesy"],
        summary: "Crear invitación para el evento",
        security: [{ ClerkAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "201": { description: "Invitación creada" } },
      },
    },

    // ─── TICKETS ─────────────────────────────────────────────────────────────
    "/tickets/{id}": {
      get: {
        tags: ["Tickets"],
        summary: "Obtener detalle de un ticket",
        security: [{ ClerkAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Detalle del ticket", content: { "application/json": { schema: { $ref: "#/components/schemas/Ticket" } } } },
          "403": { description: "No es tu ticket" },
          "404": { description: "Ticket no encontrado" },
        },
      },
    },
    "/verify/{qrCode}": {
      get: {
        tags: ["Verify"],
        summary: "Verificar ticket por código QR (solo lectura)",
        security: [{ ClerkAuth: [] }],
        parameters: [{ name: "qrCode", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Información del ticket" },
          "404": { description: "Ticket no encontrado" },
        },
      },
    },
    "/qr/{code}": {
      get: {
        tags: ["Verify"],
        summary: "Obtener imagen QR",
        parameters: [{ name: "code", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Imagen PNG del QR", content: { "image/png": {} } },
          "404": { description: "Código no encontrado" },
        },
      },
    },

    // ─── ORDERS ──────────────────────────────────────────────────────────────
    "/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Obtener detalle de una orden",
        security: [{ ClerkAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Detalle de la orden", content: { "application/json": { schema: { $ref: "#/components/schemas/Order" } } } },
          "403": { description: "No es tu orden" },
          "404": { description: "Orden no encontrada" },
        },
      },
    },

    // ─── MERCADO PAGO ────────────────────────────────────────────────────────
    "/mercadopago/customers": {
      get: {
        tags: ["Mercado Pago"],
        summary: "Obtener o crear cliente MP del usuario autenticado",
        security: [{ ClerkAuth: [] }],
        responses: {
          "200": {
            description: "ID de cliente MP",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { customerId: { type: "string" } },
                },
              },
            },
          },
        },
      },
    },
    "/mercadopago/customers/cards": {
      get: {
        tags: ["Mercado Pago"],
        summary: "Listar tarjetas guardadas del usuario",
        security: [{ ClerkAuth: [] }],
        responses: {
          "200": {
            description: "Lista de tarjetas",
            content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/MPCard" } } } },
          },
        },
      },
      post: {
        tags: ["Mercado Pago"],
        summary: "Agregar tarjeta guardada",
        security: [{ ClerkAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["token"],
                properties: { token: { type: "string", description: "Token one-time del SDK de MP" } },
              },
            },
          },
        },
        responses: {
          "201": { description: "Tarjeta guardada exitosamente" },
          "400": { description: "Token inválido" },
        },
      },
    },
    "/mercadopago/customers/cards/{cardId}": {
      delete: {
        tags: ["Mercado Pago"],
        summary: "Eliminar tarjeta guardada",
        security: [{ ClerkAuth: [] }],
        parameters: [{ name: "cardId", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Tarjeta eliminada" },
          "404": { description: "Tarjeta no encontrada" },
        },
      },
    },
    "/mercadopago/payments/create": {
      post: {
        tags: ["Mercado Pago"],
        summary: "Crear pago con tarjeta MP (token one-time del SDK)",
        description:
          "Flujo: 1) listar tarjetas → 2) SDK crea token con CVV → 3) enviar token aquí.\n\n**Requiere que el usuario tenga cliente MP creado.**",
        security: [{ ClerkAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["ticketTypeId", "quantity", "cardToken", "paymentMethodId"],
                properties: {
                  ticketTypeId: { type: "string" },
                  quantity: { type: "integer", minimum: 1, maximum: 10 },
                  cardToken: { type: "string", description: "Token one-time generado por MP SDK" },
                  paymentMethodId: { type: "string", example: "visa", description: "Ej: visa, master, amex" },
                  installments: { type: "integer", default: 1 },
                  promoCode: { type: "string", nullable: true },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Pago aprobado y tickets generados",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    orderId: { type: "string" },
                    mpPaymentId: { type: "string" },
                    status: { type: "string" },
                    ticketsGenerated: { type: "integer" },
                  },
                },
              },
            },
          },
          "402": {
            description: "Pago rechazado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    error: { type: "string" },
                    status: { type: "string" },
                    statusDetail: { type: "string" },
                  },
                },
              },
            },
          },
          "429": { description: "Demasiadas solicitudes (rate limit)" },
        },
      },
    },

    // ─── PAYMENTS ────────────────────────────────────────────────────────────
    "/payments/create": {
      post: {
        tags: ["Payments"],
        summary: "Crear pago Transbank (flujo genérico)",
        security: [{ ClerkAuth: [] }],
        responses: { "200": { description: "URL de pago" } },
      },
    },
    "/payments/refund": {
      post: {
        tags: ["Payments"],
        summary: "Solicitar reembolso de pago",
        security: [{ ClerkAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["orderId"],
                properties: { orderId: { type: "string" } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Reembolso procesado" },
          "400": { description: "Orden no es reembolsable" },
        },
      },
    },

    // ─── PROMO CODES ─────────────────────────────────────────────────────────
    "/promo-codes": {
      get: {
        tags: ["Promo Codes"],
        summary: "Listar códigos promo del organizador",
        security: [{ ClerkAuth: [] }],
        responses: { "200": { description: "Lista de códigos promo" } },
      },
      post: {
        tags: ["Promo Codes"],
        summary: "Crear código promo",
        security: [{ ClerkAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PromoCode" },
            },
          },
        },
        responses: { "201": { description: "Código creado" } },
      },
    },
    "/promo-codes/validate": {
      post: {
        tags: ["Promo Codes"],
        summary: "Validar código promo",
        security: [{ ClerkAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code", "eventId"],
                properties: {
                  code: { type: "string" },
                  eventId: { type: "string" },
                  ticketTypeId: { type: "string", nullable: true },
                  quantity: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Descuento aplicable",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    valid: { type: "boolean" },
                    discountType: { type: "string" },
                    discountValue: { type: "number" },
                    discountAmount: { type: "number" },
                    finalPrice: { type: "number" },
                  },
                },
              },
            },
          },
          "400": { description: "Código inválido, expirado o sin usos restantes" },
        },
      },
    },
    "/promo-codes/{id}": {
      get: { tags: ["Promo Codes"], summary: "Obtener código promo por ID", security: [{ ClerkAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Detalle del código" } } },
      put: { tags: ["Promo Codes"], summary: "Actualizar código promo", security: [{ ClerkAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/PromoCode" } } } }, responses: { "200": { description: "Actualizado" } } },
      delete: { tags: ["Promo Codes"], summary: "Eliminar código promo", security: [{ ClerkAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Eliminado" } } },
    },
    "/promo-codes/{id}/toggle-status": {
      post: {
        tags: ["Promo Codes"],
        summary: "Activar / desactivar código promo",
        security: [{ ClerkAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "200": { description: "Estado actualizado" } },
      },
    },
    "/promo-codes/{id}/duplicate": {
      post: {
        tags: ["Promo Codes"],
        summary: "Duplicar código promo",
        security: [{ ClerkAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        responses: { "201": { description: "Código duplicado" } },
      },
    },

    // ─── DISCOUNT CODES ──────────────────────────────────────────────────────
    "/discount-codes/validate": {
      post: {
        tags: ["Discount Codes"],
        summary: "Validar código de descuento",
        security: [{ ClerkAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code"],
                properties: {
                  code: { type: "string" },
                  eventId: { type: "string" },
                  ticketTypeId: { type: "string" },
                  quantity: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          "200": { description: "Código válido con descuento calculado" },
          "400": { description: "Código inválido" },
        },
      },
    },

    // ─── COURTESY ────────────────────────────────────────────────────────────
    "/courtesy/{code}": {
      get: {
        tags: ["Courtesy"],
        summary: "Verificar invitación de cortesía por código",
        security: [],
        parameters: [{ name: "code", in: "path", required: true, schema: { type: "string" } }],
        responses: {
          "200": { description: "Detalle de la invitación" },
          "404": { description: "Código no encontrado" },
        },
      },
    },
    "/courtesy/validate": {
      post: {
        tags: ["Courtesy"],
        summary: "Canjear invitación de cortesía",
        security: [{ ClerkAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["code"],
                properties: { code: { type: "string" } },
              },
            },
          },
        },
        responses: {
          "200": { description: "Cortesía canjeada y ticket generado" },
          "400": { description: "Código ya usado, expirado o inválido" },
        },
      },
    },

    // ─── USER ────────────────────────────────────────────────────────────────
    "/user/profile": {
      get: {
        tags: ["User"],
        summary: "Obtener perfil del usuario autenticado",
        security: [{ ClerkAuth: [] }],
        responses: {
          "200": { description: "Perfil del usuario", content: { "application/json": { schema: { $ref: "#/components/schemas/UserProfile" } } } },
        },
      },
      put: {
        tags: ["User"],
        summary: "Actualizar perfil",
        security: [{ ClerkAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  firstName: { type: "string" },
                  lastName: { type: "string" },
                  phone: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Perfil actualizado" } },
      },
    },
    "/user/role": {
      get: {
        tags: ["User"],
        summary: "Obtener rol del usuario",
        security: [{ ClerkAuth: [] }],
        responses: {
          "200": {
            description: "Rol actual",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { role: { type: "string", enum: ["USER", "ORGANIZER", "SCANNER", "ADMIN"] } },
                },
              },
            },
          },
        },
      },
    },
    "/user/request-role": {
      post: {
        tags: ["User"],
        summary: "Solicitar cambio de rol (ej. USER → ORGANIZER)",
        security: [{ ClerkAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["requestedRole"],
                properties: {
                  requestedRole: { type: "string", enum: ["ORGANIZER"] },
                  reason: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Solicitud enviada" },
          "409": { description: "Ya tienes una solicitud pendiente" },
        },
      },
    },
    "/user/tickets": {
      get: {
        tags: ["User"],
        summary: "Listar tickets del usuario autenticado",
        security: [{ ClerkAuth: [] }],
        responses: {
          "200": { description: "Tickets del usuario", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Ticket" } } } } },
        },
      },
    },
    "/user/settings": {
      get: { tags: ["User"], summary: "Obtener configuración del usuario", security: [{ ClerkAuth: [] }], responses: { "200": { description: "Configuración" } } },
      put: { tags: ["User"], summary: "Actualizar configuración del usuario", security: [{ ClerkAuth: [] }], responses: { "200": { description: "Configuración actualizada" } } },
    },
    "/user/organizer-profile": {
      get: { tags: ["Organizer"], summary: "Obtener perfil del organizador", security: [{ ClerkAuth: [] }], responses: { "200": { description: "Perfil organizador" } } },
      put: { tags: ["Organizer"], summary: "Actualizar perfil del organizador", security: [{ ClerkAuth: [] }], responses: { "200": { description: "Perfil actualizado" } } },
    },

    // ─── ORGANIZER ───────────────────────────────────────────────────────────
    "/organizer/scanners/assign": {
      post: {
        tags: ["Organizer"],
        summary: "Asignar scanner a un evento",
        security: [{ ClerkAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId", "eventId"],
                properties: {
                  userId: { type: "string" },
                  eventId: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Scanner asignado" } },
      },
    },
    "/organizer/scanners/remove": {
      post: {
        tags: ["Organizer"],
        summary: "Quitar scanner de un evento",
        security: [{ ClerkAuth: [] }],
        responses: { "200": { description: "Scanner removido" } },
      },
    },
    "/organizer/scanners/toggle": {
      post: {
        tags: ["Organizer"],
        summary: "Activar / desactivar scanner",
        security: [{ ClerkAuth: [] }],
        responses: { "200": { description: "Estado actualizado" } },
      },
    },

    // ─── DASHBOARD ───────────────────────────────────────────────────────────
    "/dashboard/stats": {
      get: {
        tags: ["Organizer"],
        summary: "Obtener estadísticas del dashboard del organizador",
        security: [{ ClerkAuth: [] }],
        responses: {
          "200": {
            description: "Stats",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    totalEvents: { type: "integer" },
                    totalTicketsSold: { type: "integer" },
                    totalRevenue: { type: "number" },
                    activeEvents: { type: "integer" },
                  },
                },
              },
            },
          },
        },
      },
    },

    // ─── VENUES ──────────────────────────────────────────────────────────────
    "/venues": {
      get: {
        tags: ["Venues"],
        summary: "Listar recintos disponibles",
        security: [{ ClerkAuth: [] }],
        responses: { "200": { description: "Lista de venues", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Venue" } } } } } },
      },
      post: {
        tags: ["Venues"],
        summary: "Crear recinto",
        security: [{ ClerkAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { $ref: "#/components/schemas/Venue" } } } },
        responses: { "201": { description: "Venue creado" } },
      },
    },
    "/venues/{id}": {
      get: { tags: ["Venues"], summary: "Obtener venue por ID", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Detalle del venue" } } },
      put: { tags: ["Venues"], summary: "Actualizar venue", security: [{ ClerkAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Actualizado" } } },
      delete: { tags: ["Venues"], summary: "Eliminar venue", security: [{ ClerkAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Eliminado" } } },
    },
    "/venues/{id}/layout": {
      get: { tags: ["Venues"], summary: "Obtener layout SVG del venue", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Layout del venue" } } },
      put: { tags: ["Venues"], summary: "Actualizar layout del venue", security: [{ ClerkAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Layout actualizado" } } },
    },

    // ─── ADMIN ───────────────────────────────────────────────────────────────
    "/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "Listar todos los usuarios (solo ADMIN)",
        security: [{ ClerkAuth: [] }],
        parameters: [
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "role", in: "query", schema: { type: "string" } },
        ],
        responses: { "200": { description: "Lista paginada de usuarios" } },
      },
    },
    "/admin/users/{userId}": {
      get: { tags: ["Admin"], summary: "Obtener usuario por ID", security: [{ ClerkAuth: [] }], parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Detalle usuario" } } },
      put: { tags: ["Admin"], summary: "Actualizar usuario", security: [{ ClerkAuth: [] }], parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Actualizado" } } },
      delete: { tags: ["Admin"], summary: "Eliminar usuario", security: [{ ClerkAuth: [] }], parameters: [{ name: "userId", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Eliminado" } } },
    },
    "/admin/users/role": {
      put: {
        tags: ["Admin"],
        summary: "Cambiar rol de usuario",
        security: [{ ClerkAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["userId", "role"],
                properties: {
                  userId: { type: "string" },
                  role: { type: "string", enum: ["USER", "ORGANIZER", "SCANNER", "ADMIN"] },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Rol actualizado" } },
      },
    },
    "/admin/role-requests": {
      get: { tags: ["Admin"], summary: "Listar solicitudes de cambio de rol", security: [{ ClerkAuth: [] }], responses: { "200": { description: "Solicitudes pendientes" } } },
    },
    "/admin/role-requests/{id}": {
      put: {
        tags: ["Admin"],
        summary: "Aprobar o rechazar solicitud de rol",
        security: [{ ClerkAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["action"],
                properties: { action: { type: "string", enum: ["approve", "reject"] } },
              },
            },
          },
        },
        responses: { "200": { description: "Solicitud procesada" } },
      },
    },
    "/admin/categories": {
      get: { tags: ["Admin"], summary: "Listar categorías de eventos", security: [{ ClerkAuth: [] }], responses: { "200": { description: "Categorías" } } },
      post: { tags: ["Admin"], summary: "Crear categoría", security: [{ ClerkAuth: [] }], responses: { "201": { description: "Categoría creada" } } },
    },
    "/admin/categories/{id}": {
      put: { tags: ["Admin"], summary: "Actualizar categoría", security: [{ ClerkAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Actualizada" } } },
      delete: { tags: ["Admin"], summary: "Eliminar categoría", security: [{ ClerkAuth: [] }], parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { "200": { description: "Eliminada" } } },
    },
    "/admin/dashboard/stats": {
      get: {
        tags: ["Admin"],
        summary: "Estadísticas globales de la plataforma",
        security: [{ ClerkAuth: [] }],
        responses: {
          "200": {
            description: "Stats globales",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    totalUsers: { type: "integer" },
                    totalEvents: { type: "integer" },
                    totalOrders: { type: "integer" },
                    totalRevenue: { type: "number" },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/admin/commission-stats": {
      get: { tags: ["Admin"], summary: "Estadísticas de comisiones", security: [{ ClerkAuth: [] }], responses: { "200": { description: "Comisiones por organizador" } } },
    },
    "/admin/cache/invalidate": {
      post: { tags: ["Admin"], summary: "Invalidar cache del sistema", security: [{ ClerkAuth: [] }], responses: { "200": { description: "Cache invalidado" } } },
    },

    // ─── WEBHOOKS ────────────────────────────────────────────────────────────
    "/webhooks/clerk": {
      post: {
        tags: ["Webhooks"],
        summary: "Webhook de eventos de Clerk (sync de usuarios)",
        security: [],
        description: "Recibe eventos de Clerk: user.created, user.updated, user.deleted. Verificado con signature Svix.",
        responses: {
          "200": { description: "Procesado correctamente" },
          "400": { description: "Signature inválida" },
        },
      },
    },
    "/webhooks/mercadopago": {
      post: {
        tags: ["Webhooks"],
        summary: "Webhook de notificaciones de Mercado Pago",
        security: [],
        description: "Recibe notificaciones IPN de MP para confirmar pagos. Verificado con signature HMAC.",
        responses: {
          "200": { description: "Procesado correctamente" },
          "400": { description: "Signature inválida" },
        },
      },
    },

    // ─── HEALTH / MISC ───────────────────────────────────────────────────────
    "/health/redis": {
      get: {
        tags: ["Health"],
        summary: "Estado de conexión Redis",
        security: [],
        responses: {
          "200": {
            description: "Redis conectado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    latencyMs: { type: "number" },
                  },
                },
              },
            },
          },
          "503": { description: "Redis no disponible" },
        },
      },
    },
    "/regions": {
      get: {
        tags: ["Health"],
        summary: "Listar regiones de Chile",
        security: [],
        responses: { "200": { description: "Lista de regiones" } },
      },
    },
    "/comunas": {
      get: {
        tags: ["Health"],
        summary: "Listar comunas de Chile",
        security: [],
        parameters: [{ name: "regionId", in: "query", schema: { type: "string" } }],
        responses: { "200": { description: "Lista de comunas" } },
      },
    },
  },
};
