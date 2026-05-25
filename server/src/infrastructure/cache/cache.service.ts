import redis from './redis.client';

export class CacheService {
    /**
     * Get a cached value by key. Returns null if not found or expired.
     */
    async get<T>(key: string): Promise<T | null> {
        try {
            const data = await redis.get(key);
            if (!data) return null;
            try {
                return JSON.parse(data) as T;
            } catch {
                return data as unknown as T;
            }
        } catch (err) {
            console.error('[Cache] get failed:', (err as Error).message);
            return null;
        }
    }

    /**
     * Set a value in cache with optional TTL (in seconds). Default TTL = 600s (10 min).
     */
    async set(key: string, value: unknown, ttl: number = 600): Promise<void> {
        try {
            const serialized = typeof value === 'string' ? value : JSON.stringify(value);
            await redis.set(key, serialized, 'EX', ttl);
        } catch (err) {
            console.error('[Cache] set failed:', (err as Error).message);
        }
    }

    /**
     * Delete a specific key from cache.
     */
    async del(key: string): Promise<void> {
        try {
            await redis.del(key);
        } catch (err) {
            console.error('[Cache] del failed:', (err as Error).message);
        }
    }

    /**
     * Delete all keys matching a glob pattern (e.g., "user:*").
     * Uses SCAN to avoid blocking Redis.
     */
    async invalidatePattern(pattern: string): Promise<void> {
        try {
            let cursor = '0';
            do {
                const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
                cursor = nextCursor;
                if (keys.length > 0) {
                    await redis.del(...keys);
                }
            } while (cursor !== '0');
        } catch (err) {
            console.error('[Cache] invalidatePattern failed:', (err as Error).message);
        }
    }

    /**
     * Increment a rate-limit key. On first use sets TTL. Returns true if count <= limit, false if over limit.
     */
    async rateLimitIncr(key: string, windowSeconds: number, limit: number): Promise<boolean> {
        try {
            const count = await redis.incr(key);
            if (count === 1) {
                await redis.expire(key, windowSeconds);
            }
            return count <= limit;
        } catch (err) {
            console.error('[Cache] rateLimitIncr failed:', (err as Error).message);
            return true;
        }
    }
}

// Singleton export
export const cacheService = new CacheService();
