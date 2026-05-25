// Queue and exchange name constants

export const EXCHANGES = {
    AUTH: 'auth.events',
    NOTIFICATIONS: 'notification.events',
    CATALOG: 'catalog.events',
} as const;

export const QUEUES = {
    WELCOME_EMAIL: 'email.welcome',
    NOTIFICATION_SEND: 'notification.send',
} as const;

export const ROUTING_KEYS = {
    USER_REGISTERED: 'user.registered',
    CUSTOMER_REGISTERED: 'customer.registered',
    NOTIFICATION_SENT: 'notification.sent',
    NOTIFICATION_CREATED: 'notification.created',
    CATEGORY_CREATED: 'category.created',
    CATEGORY_UPDATED: 'category.updated',
    PRODUCT_CREATED: 'product.created',
    PRODUCT_UPDATED: 'product.updated',
} as const;
