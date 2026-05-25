import { MessageBus } from './message.bus';
import { getRabbitChannel } from '../rabbit/rabbit.client';

export class RabbitBus implements MessageBus {
   async publish(event: string, payload: unknown): Promise<void> {
      try {
         const channel = await getRabbitChannel();

         // Ensure the exchange exists (topic type for flexible routing)
         await channel.assertExchange(event, 'topic', { durable: true });

         const message = Buffer.from(JSON.stringify(payload));
         channel.publish(event, event, message, { persistent: true });

         console.log(`[RabbitBus] Published to "${event}":`, payload);
      } catch (err) {
         console.error(`[RabbitBus] Failed to publish to "${event}":`, (err as Error).message);
      }
   }

   async subscribe(event: string, handler: (data: unknown) => void): Promise<void> {
      try {
         const channel = await getRabbitChannel();

         // Ensure exchange and queue exist
         await channel.assertExchange(event, 'topic', { durable: true });
         const q = await channel.assertQueue('', { exclusive: true });
         await channel.bindQueue(q.queue, event, event);

         // Consume messages
         await channel.consume(q.queue, (msg) => {
            if (msg) {
               const data = JSON.parse(msg.content.toString());
               handler(data);
               channel.ack(msg);
            }
         });

         console.log(`[RabbitBus] Subscribed to "${event}"`);
      } catch (err) {
         console.error(`[RabbitBus] Failed to subscribe to "${event}":`, (err as Error).message);
      }
   }
}

export const rabbitBus = new RabbitBus();
