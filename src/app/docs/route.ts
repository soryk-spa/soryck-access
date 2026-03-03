import { ApiReference } from "@scalar/nextjs-api-reference";

export const dynamic = "force-dynamic";

const docsHandler = ApiReference({
  url: "/api/docs",
  title: "Soryck Access API",
  theme: "default",
  layout: "modern",
  defaultHttpClient: {
    targetKey: "node",
    clientKey: "fetch",
  },
  authentication: {
    preferredSecurityScheme: "ClerkAuth",
    securitySchemes: {
      ClerkAuth: {
        token: "",
      },
    },
  },
  metaData: {
    title: "Soryck Access — API Docs",
  },
});

export function GET() {
  // Bloquear solo en producción real (rama main en Vercel)
  if (process.env.VERCEL_ENV === "production") {
    return new Response("Not found.", {
      status: 404,
      headers: { "Content-Type": "text/plain" },
    });
  }
  return docsHandler();
}
