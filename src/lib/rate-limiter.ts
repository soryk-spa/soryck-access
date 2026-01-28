import { Redis } from 'ioredis';

/**
 * Rate limiter mejorado que puede usar Redis o memoria
 */

// Simple in-memory store para desarrollo
const memoryStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimiterOptions {
  windowMs?: number;
  max?: number;
  keyGenerator?: (identifier: string) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export class RateLimiter {
  private redis: Redis | null = null;
  private useRedis: boolean = false;

  constructor(private options: RateLimiterOptions = {}) {
    // Intentar conectar con Redis si está disponible
    if (process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL);
        this.useRedis = true;
        console.log('Rate limiter usando Redis');
      } catch (error) {
        console.warn('No se pudo conectar a Redis, usando memoria:', error);
        this.useRedis = false;
      }
    }
  }

  /**
   * Verifica si una request está dentro del límite
   */
  async isAllowed(identifier: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    total: number;
  }> {
    const key = this.options.keyGenerator 
      ? this.options.keyGenerator(identifier) 
      : `rate_limit:${identifier}`;
    
    const windowMs = this.options.windowMs || 15 * 60 * 1000; // 15 minutos por defecto
    const max = this.options.max || 100; // 100 requests por defecto
    const now = Date.now();

    if (this.useRedis && this.redis) {
      return this.checkRedisLimit(key, max, windowMs, now);
    } else {
      return this.checkMemoryLimit(key, max, windowMs, now);
    }
  }

  private async checkRedisLimit(
    key: string, 
    max: number, 
    windowMs: number, 
    now: number
  ): Promise<{ allowed: boolean; remaining: number; resetTime: number; total: number }> {
    if (!this.redis) throw new Error('Redis not available');

    const pipeline = this.redis.pipeline();
    pipeline.zremrangebyscore(key, 0, now - windowMs);
    pipeline.zadd(key, now, now);
    pipeline.zcard(key);
    pipeline.expire(key, Math.ceil(windowMs / 1000));

    const results = await pipeline.exec();
    const count = results?.[2]?.[1] as number || 0;

    const remaining = Math.max(0, max - count);
    const resetTime = now + windowMs;

    return {
      allowed: count <= max,
      remaining,
      resetTime,
      total: count,
    };
  }

  private checkMemoryLimit(
    key: string, 
    max: number, 
    windowMs: number, 
    now: number
  ): { allowed: boolean; remaining: number; resetTime: number; total: number } {
    const windowStart = now - windowMs;
    
    const record = memoryStore.get(key);
    
    if (!record || record.resetTime <= now) {
      memoryStore.set(key, { count: 1, resetTime: now + windowMs });
      return {
        allowed: true,
        remaining: max - 1,
        resetTime: now + windowMs,
        total: 1,
      };
    }

    if (record.count >= max) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        total: record.count,
      };
    }

    record.count++;
    const remaining = Math.max(0, max - record.count);

    return {
      allowed: true,
      remaining,
      resetTime: record.resetTime,
      total: record.count,
    };
  }

  /**
   * Limpia registros antiguos (solo para memoria)
   */
  cleanup(): void {
    if (this.useRedis) return;

    const now = Date.now();
    for (const [key, record] of memoryStore.entries()) {
      if (record.resetTime <= now) {
        memoryStore.delete(key);
      }
    }
  }
}

// Instancia global del rate limiter
export const rateLimiter = new RateLimiter();

/**
 * Configuraciones predefinidas
 */
export const RateLimitPresets = {
  // API general - 100 requests por 15 minutos
  api: new RateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 100,
    keyGenerator: (ip) => `api:${ip}`,
  }),

  // Autenticación - 10 intentos por 5 minutos
  auth: new RateLimiter({
    windowMs: 5 * 60 * 1000,
    max: 10,
    keyGenerator: (ip) => `auth:${ip}`,
  }),

  // Registro - 5 intentos por hora
  registration: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 5,
    keyGenerator: (ip) => `register:${ip}`,
  }),

  // Emails - 10 por hora
  email: new RateLimiter({
    windowMs: 60 * 60 * 1000,
    max: 10,
    keyGenerator: (ip) => `email:${ip}`,
  }),

  // Pagos - 3 intentos por minuto
  payment: new RateLimiter({
    windowMs: 60 * 1000,
    max: 3,
    keyGenerator: (ip) => `payment:${ip}`,
  }),
};

/**
 * Middleware helper para Next.js
 */
export async function applyRateLimit(
  identifier: string,
  limiter: RateLimiter = rateLimiter
): Promise<{
  success: boolean;
  remaining: number;
  resetTime: number;
  headers: Record<string, string>;
}> {
  const result = await limiter.isAllowed(identifier);
  
  const headers = {
    'X-RateLimit-Limit': String(result.total + result.remaining),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
  };

  return {
    success: result.allowed,
    remaining: result.remaining,
    resetTime: result.resetTime,
    headers,
  };
}