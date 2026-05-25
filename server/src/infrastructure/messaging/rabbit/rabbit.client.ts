import * as amqp from 'amqplib';

let connection: amqp.ChannelModel | null = null;
let channel: amqp.Channel | null = null;

const RABBITMQ_URL =
  process.env.RABBITMQ_URL || 'amqp://admin:admin@localhost:5672';

export async function getRabbitChannel(): Promise<amqp.Channel> {
  if (channel) return channel;

  try {
    const conn = await amqp.connect(RABBITMQ_URL);
    connection = conn;
    const ch = await conn.createChannel();
    channel = ch;

    conn.on('error', (err: Error) => {
      console.error('[RabbitMQ] Connection error:', err.message);
      connection = null;
      channel = null;
    });

    conn.on('close', () => {
      console.log('[RabbitMQ] Connection closed');
      connection = null;
      channel = null;
    });

    console.log('[RabbitMQ] Connected successfully');
    return ch;
  } catch (err) {
    console.error(
      '[RabbitMQ] Failed to connect:',
      (err as Error).message
    );
    throw err;
  }
}

export async function closeRabbitConnection(): Promise<void> {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    channel = null;
    connection = null;
  } catch (err) {
    console.error(
      '[RabbitMQ] Error closing connection:',
      (err as Error).message
    );
  }
}
