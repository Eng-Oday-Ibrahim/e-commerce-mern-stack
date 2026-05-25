import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(REDIS_URL, {
    // Fail fast when Redis is unavailable (avoid hanging requests).
    enableOfflineQueue: false,
    maxRetriesPerRequest: 2,
    retryStrategy(times: number) {
        const delay = Math.min(times * 200, 2000);
        return delay;
    },
});

redis.on('connect', () => {
    console.log('[Redis] Connected successfully');
});

redis.on('error', (err: Error) => {
    console.error('[Redis] Connection error:', err.message);
});

export default redis;
