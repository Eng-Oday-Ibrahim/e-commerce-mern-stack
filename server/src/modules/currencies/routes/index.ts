import { Router } from 'express';
import currencyRouter from './currency.route';

const router = Router();

router.use('/', currencyRouter);

export default router;

