import { Router } from 'express';
import categoryRouter from './category.route';
import collectionRouter from './collection.route';
import optionRouter from './option.route';
import productRouter from './product.route';

const router = Router();

router.use('/categories', categoryRouter);
router.use('/collections', collectionRouter);
router.use('/options', optionRouter);
router.use('/products', productRouter);

export default router;

