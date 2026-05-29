import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import routes from './routes';
import { errorHandler } from './shared/middleware/errorHandler';
import { stripeWebhook } from './modules/payments/controllers/payment.controller';

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true,
    credentials: true,
  })
);
app.use(helmet(
  {
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
  }
));
app.use(morgan('dev'));
app.post('/api/payments/webhook/stripe', express.raw({ type: 'application/json' }), stripeWebhook);
app.use(express.json({ limit: '10mb' }));

// Serve uploaded files
const storagePath = process.env.STORAGE_PATH || path.join(process.cwd(), 'storage');
app.use(
  '/storage',
  express.static(storagePath, {
    setHeaders: (res) => {
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    },
  })
);

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/api', routes);

app.use(errorHandler);

export default app;
