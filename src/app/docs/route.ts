import { ApiReference } from "@scalar/nextjs-api-reference";

const handler = ApiReference({
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

// Bloquear solo en producción real (main branch en Vercel)
// VERCEL_ENV=production → main | VERCEL_ENV=preview → develop/preview | undefined → local
const isProductionDeploy = process.env.VERCEL_ENV === "production";

export const GET = isProductionDeploy
  ? () =>
      new Response("API docs are not available in production.", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      })
  : handler;
