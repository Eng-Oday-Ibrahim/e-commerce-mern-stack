import { Router } from 'express';
import stockRouter from './stock.route';

const router = Router();

router.use('/', stockRouter);

export default router;

