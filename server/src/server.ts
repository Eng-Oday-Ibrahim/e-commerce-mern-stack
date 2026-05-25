import dotenv from 'dotenv';
import app from './app';
import { connectDb } from './config/db';
import { startConsumers } from './infrastructure/messaging/consumer';

dotenv.config();

const PORT = process.env.PORT || 4000;

async function bootstrap(): Promise<void> {
  await connectDb();

  // Messaging consumers are best-effort. If RabbitMQ is down, the server still runs.
  await startConsumers();

  app.listen(PORT, () => {
    console.log(`[HTTP] Server running on port ${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('[Bootstrap] Failed to start:', (err as Error).message);
  process.exit(1);
});
