import { Router } from 'express';
import storageRouter from './storage.route';

const router = Router();

router.use('/', storageRouter);

export default router;

