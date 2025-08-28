import { NextResponse } from "next/server";
import { cache } from "@/lib/redis";

export async function GET() {
  try {
    const isRedisHealthy = await cache.ping();
    
    if (isRedisHealthy) {
      return NextResponse.json({ 
        status: "healthy", 
        redis: "connected",
        timestamp: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ 
        status: "unhealthy", 
        redis: "disconnected",
        timestamp: new Date().toISOString()
      }, { status: 503 });
    }
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json({ 
      status: "unhealthy", 
      redis: "error",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}
