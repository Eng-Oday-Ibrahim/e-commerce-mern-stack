import { rabbitBus } from './bus/rabbit.bus';
import { EXCHANGES } from './messaging.constants';

/**
 * Publish a "user registered" event to trigger welcome email and other onboarding flows.
 */
export async function publishUserRegistered(data: {
    userId: string;
    email: string;
    name: string;
}): Promise<void> {
    await rabbitBus.publish(EXCHANGES.AUTH, {
        event: 'user.registered',
        timestamp: new Date().toISOString(),
        data,
    });
}

export async function publishCustomerRegistered(data: {
    customerId: string;
    email: string;
    name: string;
}): Promise<void> {
    await rabbitBus.publish(EXCHANGES.AUTH, {
        event: 'customer.registered',
        timestamp: new Date().toISOString(),
        data,
    });
}

export async function publishCategoryCreated(data: { categoryId: string; slug: string }): Promise<void> {
    await rabbitBus.publish(EXCHANGES.CATALOG, {
        event: 'category.created',
        timestamp: new Date().toISOString(),
        data,
    });
}

export async function publishCategoryUpdated(data: { categoryId: string; slug: string }): Promise<void> {
    await rabbitBus.publish(EXCHANGES.CATALOG, {
        event: 'category.updated',
        timestamp: new Date().toISOString(),
        data,
    });
}

export async function publishProductCreated(data: { productId: string; slug: string }): Promise<void> {
    await rabbitBus.publish(EXCHANGES.CATALOG, {
        event: 'product.created',
        timestamp: new Date().toISOString(),
        data,
    });
}

export async function publishProductUpdated(data: { productId: string; slug: string }): Promise<void> {
    await rabbitBus.publish(EXCHANGES.CATALOG, {
        event: 'product.updated',
        timestamp: new Date().toISOString(),
        data,
    });
}
