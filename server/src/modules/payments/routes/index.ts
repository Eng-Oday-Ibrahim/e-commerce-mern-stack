import { Router } from 'express';
import paymentRouter from './payment.route';

const router = Router();

router.use('/', paymentRouter);

export default router;

