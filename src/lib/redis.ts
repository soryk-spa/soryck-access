import { Redis } from 'ioredis';
import { logger } from './logger';

// Types
export interface UserProfile {
  id: string;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  producerName?: string;
  websiteUrl?: string;
  twitterUrl?: string;
  instagramUrl?: string;
  role: string;
}

export interface MonthlyStats {
  name: string;
  ingresos: number;
  eventos: number;
  tickets: number;
}

export type DashboardStats = MonthlyStats[];

export interface EventData {
  id: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  categoryId: string;
  organizerId: string;
}

// Redis configuration - supports both REDIS_URL (Vercel/Upstash) and individual env vars
const getRedisConfig = () => {
  // If REDIS_URL is provided (Vercel/Upstash format)
  if (process.env.REDIS_URL) {
    return {
      connectionName: 'vercel-redis',
      lazyConnect: true,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: null,
    };
  }
  
  // Fallback to individual environment variables
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
    lazyConnect: true,
  };
};

// Configuración de Redis
const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL, getRedisConfig())
  : new Redis(getRedisConfig());

// Event listeners para logging
redis.on('connect', () => {
  logger.info('✅ Redis connected successfully');
});

redis.on('error', (error) => {
  logger.error('❌ Redis connection error', error);
});

redis.on('close', () => {
  logger.info('🔌 Redis connection closed');
});

// Cache utilities
export class CacheService {
  private static instance: CacheService;
  private redis: Redis;

  private constructor() {
    this.redis = redis;
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Métodos básicos de caché
  async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await this.redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
  logger.error(`Error getting cache key ${key}`, error as Error);
      return null;
    }
  }

  async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds) {
        await this.redis.setex(key, ttlSeconds, serialized);
      } else {
        await this.redis.set(key, serialized);
      }
    } catch (error) {
  logger.error(`Error setting cache key ${key}`, error as Error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
  logger.error(`Error deleting cache key ${key}`, error as Error);
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
  logger.error(`Error invalidating pattern ${pattern}`, error as Error);
    }
  }

  // Métodos específicos para la aplicación
  async getUserRole(clerkId: string): Promise<string | null> {
    return this.get(`user:role:${clerkId}`);
  }

  async setUserRole(clerkId: string, role: string, ttl = 3600): Promise<void> {
    await this.set(`user:role:${clerkId}`, role, ttl);
  }

  async getUserProfile(clerkId: string): Promise<UserProfile | null> {
    return this.get(`user:profile:${clerkId}`);
  }

  async setUserProfile(clerkId: string, profile: UserProfile, ttl = 1800): Promise<void> {
    await this.set(`user:profile:${clerkId}`, profile, ttl);
  }

  async invalidateUserCache(clerkId: string): Promise<void> {
    await this.invalidatePattern(`user:*:${clerkId}`);
  }

  async getEvents(query: string): Promise<EventData[] | null> {
    return this.get(`events:${query}`);
  }

  async setEvents(query: string, events: EventData[], ttl = 600): Promise<void> {
    await this.set(`events:${query}`, events, ttl);
  }

  async invalidateEventsCache(): Promise<void> {
    await this.invalidatePattern('events:*');
  }

  async getDashboardStats(userId: string): Promise<DashboardStats | null> {
    return this.get(`dashboard:stats:${userId}`);
  }

  async setDashboardStats(userId: string, stats: DashboardStats, ttl = 300): Promise<void> {
    await this.set(`dashboard:stats:${userId}`, stats, ttl);
  }

  async invalidateDashboardStats(userId?: string): Promise<void> {
    if (userId) {
      await this.del(`dashboard:stats:${userId}`);
    } else {
      await this.invalidatePattern('dashboard:stats:*');
    }
  }

  // Contador de rate limiting
  async incrementRateLimit(key: string, windowSeconds: number, limit: number): Promise<{ allowed: boolean; remaining: number }> {
    try {
      const current = await this.redis.incr(key);
      if (current === 1) {
        await this.redis.expire(key, windowSeconds);
      }
      
      return {
        allowed: current <= limit,
        remaining: Math.max(0, limit - current)
      };
    } catch (error) {
  logger.error(`Error checking rate limit for ${key}`, error as Error);
      return { allowed: true, remaining: limit };
    }
  }

  // Session cache (para datos temporales de sesión)
  async setSession(sessionId: string, data: Record<string, unknown>, ttl = 86400): Promise<void> {
    await this.set(`session:${sessionId}`, data, ttl);
  }

  async getSession(sessionId: string): Promise<Record<string, unknown> | null> {
    return this.get(`session:${sessionId}`);
  }

  async deleteSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`);
  }

  // Health check
  async ping(): Promise<boolean> {
    try {
      const response = await this.redis.ping();
      return response === 'PONG';
    } catch (error) {
  logger.error('Redis ping failed', error as Error);
      return false;
    }
  }

  // Graceful shutdown
  async disconnect(): Promise<void> {
    try {
      await this.redis.quit();
    } catch (error) {
  logger.error('Error disconnecting from Redis:', error as Error);
    }
  }
}

// Export singleton instance
export const cache = CacheService.getInstance();
export default redis;
