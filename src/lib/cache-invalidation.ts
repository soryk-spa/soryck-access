import { cache } from '@/lib/redis';

export class CacheInvalidation {
  
  static async invalidateEventsCache() {
    try {
      await cache.invalidateEventsCache();
      console.log('✅ Events cache invalidated');
    } catch (error) {
      console.error('❌ Error invalidating events cache:', error);
    }
  }

  
  static async invalidateUserCache(clerkId: string) {
    try {
      await cache.invalidateUserCache(clerkId);
      console.log(`✅ User cache invalidated for ${clerkId}`);
    } catch (error) {
      console.error(`❌ Error invalidating user cache for ${clerkId}:`, error);
    }
  }

  
  static async invalidateDashboardStats(userId?: string) {
    try {
      await cache.invalidateDashboardStats(userId);
      console.log(`✅ Dashboard stats cache invalidated${userId ? ` for ${userId}` : ' for all users'}`);
    } catch (error) {
      console.error('❌ Error invalidating dashboard stats cache:', error);
    }
  }

  
  static async invalidateUserRole(clerkId: string) {
    try {
      await cache.del(`user:role:${clerkId}`);
      console.log(`✅ User role cache invalidated for ${clerkId}`);
    } catch (error) {
      console.error(`❌ Error invalidating user role cache for ${clerkId}:`, error);
    }
  }

  
  static async invalidateUserProfile(clerkId: string) {
    try {
      await cache.del(`user:profile:${clerkId}`);
      console.log(`✅ User profile cache invalidated for ${clerkId}`);
    } catch (error) {
      console.error(`❌ Error invalidating user profile cache for ${clerkId}:`, error);
    }
  }

  
  static async invalidateEventSpecificCache(eventId: string, organizerId?: string) {
    try {
      
      await this.invalidateEventsCache();
      
      
      if (organizerId) {
        await this.invalidateDashboardStats(organizerId);
      }
      
      console.log(`✅ Event-specific cache invalidated for event ${eventId}`);
    } catch (error) {
      console.error(`❌ Error invalidating event-specific cache for ${eventId}:`, error);
    }
  }

  
  static async invalidatePaymentRelatedCache(eventId: string, organizerId: string) {
    try {
      
      await this.invalidateDashboardStats(organizerId);
      
      
      await this.invalidateEventsCache();
      
      console.log(`✅ Payment-related cache invalidated for event ${eventId}`);
    } catch (error) {
      console.error(`❌ Error invalidating payment-related cache:`, error);
    }
  }

  
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
