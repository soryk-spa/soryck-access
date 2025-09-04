import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { role: true }
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Permisos insuficientes" }, { status: 403 });
    }

    
    const getRedisConfig = () => {
      if (process.env.REDIS_URL) {
        try {
          const redisUrl = new URL(process.env.REDIS_URL);
          return {
            host: redisUrl.hostname,
            port: redisUrl.port || '6379',
            database: '0', 
            hasPassword: !!redisUrl.password,
            passwordLength: redisUrl.password?.length || 0,
            maskedPassword: redisUrl.password 
              ? `${redisUrl.password.substring(0, 3)}****${redisUrl.password.slice(-3)}`
              : 'Sin contraseña',
            environment: process.env.NODE_ENV || 'development',
            connectionType: 'REDIS_URL (Vercel/Upstash)',
            provider: redisUrl.hostname.includes('redns.redis-cloud.com') ? 'Redis Cloud' : 
                     redisUrl.hostname.includes('upstash.io') ? 'Upstash' : 'Otro',
          };
        } catch (error) {
          console.error('Error parsing REDIS_URL:', error);
          return {
            host: 'Error parsing URL',
            port: 'N/A',
            database: 'N/A',
            hasPassword: false,
            passwordLength: 0,
            maskedPassword: 'Error en URL',
            environment: process.env.NODE_ENV || 'development',
            connectionType: 'REDIS_URL (Error)',
            provider: 'Error',
          };
        }
      } else {
        return {
          host: process.env.REDIS_HOST || 'localhost',
          port: process.env.REDIS_PORT || '6379',
          database: process.env.REDIS_DB || '0',
          hasPassword: !!process.env.REDIS_PASSWORD,
          passwordLength: process.env.REDIS_PASSWORD?.length || 0,
          maskedPassword: process.env.REDIS_PASSWORD 
            ? `${process.env.REDIS_PASSWORD.substring(0, 3)}****${process.env.REDIS_PASSWORD.slice(-3)}`
            : 'Sin contraseña',
          environment: process.env.NODE_ENV || 'development',
          connectionType: 'Variables individuales',
          provider: 'Local/Manual',
        };
      }
    };

    const redisConfig = getRedisConfig();

    return NextResponse.json(redisConfig);

  } catch (error) {
    console.error("Error getting Redis config:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
