import { Router } from 'express';
import shippingRouter from './shipping.route';

const router = Router();

router.use('/', shippingRouter);

export default router;

