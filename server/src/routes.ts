import { Router } from 'express';
import identityRouter from './modules/identity/routes';
import catalogRouter from './modules/catalog/routes';
import shippingRouter from './modules/shipping/routes';
import stockRouter from './modules/stock/routes';
import ordersRouter from './modules/orders/routes';
import storageRouter from './modules/storage/routes';
import currenciesRouter from './modules/currencies/routes';
import { reviewsRouter } from './modules/reviews';
import { dashboardRouter } from './modules/dashboard';
import { marketingRouter } from './modules/marketing';
import paymentsRouter from './modules/payments/routes';

const router = Router();

router.use('/identity', identityRouter);
router.use('/catalog', catalogRouter);
router.use('/shipping', shippingRouter);
router.use('/stock', stockRouter);
router.use('/orders', ordersRouter);
router.use('/storage', storageRouter);
router.use('/currencies', currenciesRouter);
router.use('/reviews', reviewsRouter);
router.use('/dashboard', dashboardRouter);
router.use('/marketing', marketingRouter);
router.use('/payments', paymentsRouter);

export default router;
