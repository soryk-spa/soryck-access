"use client";

import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css";

// swagger-ui-react no es compatible con SSR — importar sólo en cliente
const SwaggerUI = dynamic(() => import("swagger-ui-react"), { ssr: false });

export default function ApiDocsPage() {
  const isDev = process.env.NODE_ENV !== "production";

  if (!isDev) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Documentación no disponible</h1>
          <p className="text-gray-400">La documentación de la API solo está disponible en desarrollo.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-950 text-white px-6 py-4 flex items-center gap-3">
        <span className="text-xl font-bold tracking-tight">Soryck Access</span>
        <span className="text-gray-400">·</span>
        <span className="text-gray-300 text-sm">API Documentation</span>
        <span className="ml-auto text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
          OpenAPI 3.0 · Solo desarrollo
        </span>
      </div>
      <SwaggerUI
        url="/api/docs"
        docExpansion="list"
        defaultModelsExpandDepth={1}
        tryItOutEnabled={true}
        requestInterceptor={(request) => {
          // Agregar el token de Clerk si está en localStorage
          if (typeof window !== "undefined") {
            const token = localStorage.getItem("__clerk_client_jwt");
            if (token && !request.headers["Authorization"]) {
              request.headers["Authorization"] = `Bearer ${token}`;
            }
          }
          return request;
        }}
      />
    </div>
  );
}
