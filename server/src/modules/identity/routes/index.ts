import { Router } from 'express';
import customerRouter from './customer.route';
import customerAdminRouter from './customer.admin.route';
import userRouter from './user.route';

const router = Router();

router.use('/customers', customerRouter);
router.use('/customers/admin', customerAdminRouter);
router.use('/users', userRouter);

export default router;

