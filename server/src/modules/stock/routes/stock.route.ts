import { Router } from 'express';
import * as stockController from '../controllers/stock.controller';
import { requireUserAuth } from '../../../shared/middleware/authention';
import { requireRoles } from '../../../shared/middleware/authorization';

const router = Router();

router.get('/public/products/:productId', stockController.getPublicByProductId);
router.get('/all', requireUserAuth, requireRoles('admin', 'superadmin'), stockController.listAll);
router.get('/products/:productId', requireUserAuth, requireRoles('admin', 'superadmin'), stockController.getByProductId);
router.put('/products/:productId', requireUserAuth, requireRoles('admin', 'superadmin'), stockController.setOnHand);
router.post(
  '/products/:productId/adjust',
  requireUserAuth,
  requireRoles('admin', 'superadmin'),
  stockController.adjustOnHand
);

export default router;
