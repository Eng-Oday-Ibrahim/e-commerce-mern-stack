// All cache key patterns for the application

export const CACHE_KEYS = {
    AUTH: {
        SESSION: (sessionId: string) => `auth:session:${sessionId}`,
    },
    USER: {
        BY_ID: (id: string) => `user:${id}`,
        BY_EMAIL: (email: string) => `user:email:${email}`,
        ALL: 'users:all',
    },
    NOTIFICATIONS: {
        VAPID_PUBLIC_KEY: 'notifications:vapid_public_key',
        RATE_LIMIT_SEND: (adminUserId: string) => `notifications:ratelimit:send:${adminUserId}`,
        PREFERENCE: (userId: string, audience: string) => `notifications:preference:${userId}:${audience}`,
        UNREAD_COUNT: (userId: string) => `notifications:unread:${userId}`,
    },
    CATALOG: {
        CATEGORIES_PUBLIC: 'catalog:categories:public',
        CATEGORY_BY_ID: (id: string) => `catalog:category:${id}`,
        CATEGORIES_ALL: 'catalog:categories:all',
        CATEGORY_ADMIN_BY_ID: (id: string) => `catalog:category:admin:${id}`,
        COLLECTIONS_PUBLIC: 'catalog:collections:public',
        COLLECTION_BY_ID: (id: string) => `catalog:collection:${id}`,
        COLLECTIONS_ALL: 'catalog:collections:all',
        COLLECTION_ADMIN_BY_ID: (id: string) => `catalog:collection:admin:${id}`,
        OPTIONS_PUBLIC: 'catalog:options:public',
        OPTION_BY_ID: (id: string) => `catalog:option:${id}`,
        OPTIONS_ALL: 'catalog:options:all',
        OPTION_ADMIN_BY_ID: (id: string) => `catalog:option:admin:${id}`,
        PRODUCTS_PUBLIC: 'catalog:products:public',
        PRODUCT_BY_ID: (id: string) => `catalog:product:${id}`,
        PRODUCTS_ALL: 'catalog:products:all',
        PRODUCT_ADMIN_BY_ID: (id: string) => `catalog:product:admin:${id}`,
    },
    SHIPPING: {
        COUNTRIES_PUBLIC: 'shipping:countries:public',
        COUNTRY_BY_ID: (id: string) => `shipping:country:${id}`,
        CITY_BY_ID: (id: string) => `shipping:city:${id}`,
    },
} as const;
