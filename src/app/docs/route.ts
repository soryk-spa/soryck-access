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

export const GET =
  process.env.NODE_ENV === "production"
    ? () =>
        new Response("API docs are not available in production.", {
          status: 404,
          headers: { "Content-Type": "text/plain" },
        })
    : handler;
