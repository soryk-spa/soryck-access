import { cache } from '@/lib/redis';

export class CacheInvalidation {
  /**
   * Invalida caché relacionado con eventos cuando se crean, actualizan o eliminan
   */
  static async invalidateEventsCache() {
    try {
      await cache.invalidateEventsCache();
      console.log('✅ Events cache invalidated');
    } catch (error) {
      console.error('❌ Error invalidating events cache:', error);
    }
  }

  /**
   * Invalida caché de usuario específico
   */
  static async invalidateUserCache(clerkId: string) {
    try {
      await cache.invalidateUserCache(clerkId);
      console.log(`✅ User cache invalidated for ${clerkId}`);
    } catch (error) {
      console.error(`❌ Error invalidating user cache for ${clerkId}:`, error);
    }
  }

  /**
   * Invalida estadísticas del dashboard cuando cambian datos
   */
  static async invalidateDashboardStats(userId?: string) {
    try {
      await cache.invalidateDashboardStats(userId);
      console.log(`✅ Dashboard stats cache invalidated${userId ? ` for ${userId}` : ' for all users'}`);
    } catch (error) {
      console.error('❌ Error invalidating dashboard stats cache:', error);
    }
  }

  /**
   * Invalida caché cuando un usuario cambia de rol
   */
  static async invalidateUserRole(clerkId: string) {
    try {
      await cache.del(`user:role:${clerkId}`);
      console.log(`✅ User role cache invalidated for ${clerkId}`);
    } catch (error) {
      console.error(`❌ Error invalidating user role cache for ${clerkId}:`, error);
    }
  }

  /**
   * Invalida caché de perfil de usuario
   */
  static async invalidateUserProfile(clerkId: string) {
    try {
      await cache.del(`user:profile:${clerkId}`);
      console.log(`✅ User profile cache invalidated for ${clerkId}`);
    } catch (error) {
      console.error(`❌ Error invalidating user profile cache for ${clerkId}:`, error);
    }
  }

  /**
   * Invalida todo el caché relacionado con un evento específico
   */
  static async invalidateEventSpecificCache(eventId: string, organizerId?: string) {
    try {
      // Invalidar eventos públicos
      await this.invalidateEventsCache();
      
      // Invalidar estadísticas del organizador si se proporciona
      if (organizerId) {
        await this.invalidateDashboardStats(organizerId);
      }
      
      console.log(`✅ Event-specific cache invalidated for event ${eventId}`);
    } catch (error) {
      console.error(`❌ Error invalidating event-specific cache for ${eventId}:`, error);
    }
  }

  /**
   * Invalida caché cuando se procesa un pago
   */
  static async invalidatePaymentRelatedCache(eventId: string, organizerId: string) {
    try {
      // Invalidar estadísticas del organizador
      await this.invalidateDashboardStats(organizerId);
      
      // Invalidar eventos (para actualizar tickets disponibles)
      await this.invalidateEventsCache();
      
      console.log(`✅ Payment-related cache invalidated for event ${eventId}`);
    } catch (error) {
      console.error(`❌ Error invalidating payment-related cache:`, error);
    }
  }

  /**
   * Invalida todo el caché (usar con precaución)
   */
  static async invalidateAllCache() {
    try {
      await cache.invalidatePattern('*');
      console.log('✅ All cache invalidated');
    } catch (error) {
      console.error('❌ Error invalidating all cache:', error);
    }
  }
}

export default CacheInvalidation;
