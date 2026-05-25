import { rabbitBus } from './bus/rabbit.bus';
import { EXCHANGES } from './messaging.constants';

/**
 * Start consumers for all messaging events.
 * Call this once during server startup.
 */
export async function startConsumers(): Promise<void> {
    // Listen for user registration events (welcome email, onboarding, etc.)
    await rabbitBus.subscribe(EXCHANGES.AUTH, (data: unknown) => {
        const event = data as {
            event: string;
            timestamp: string;
            data: { userId?: string; customerId?: string; email: string; name: string };
        };

        if (event.event === 'user.registered') {
            console.log(`[Consumer] Welcome email for ${event.data.name} (${event.data.email})`);
            // TODO: In future, send actual email via SMTP transport
        }
        if (event.event === 'customer.registered') {
            console.log(`[Consumer] Customer onboard for ${event.data.name} (${event.data.email})`);
            // TODO: In future, send actual customer welcome email
        }
    });

    // Listen for catalog events (for cache warmups, search indexing, etc.)
    await rabbitBus.subscribe(EXCHANGES.CATALOG, (data: unknown) => {
        const payload = data as { event: string; timestamp: string; data: any };
        console.log(`[Consumer] Catalog event "${payload.event}"`, payload.data);
    });

    // NOTE: notification consumers will be added when the Notifications module is implemented.

    console.log('[Consumers] All consumers started');
}
