import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { requireCustomerAuth, requireUserAuth } from '../../../shared/middleware/authention';
import { requireRoles } from '../../../shared/middleware/authorization';

const router = Router();

// Customer endpoints
router.post('/', orderController.create);
router.post('/validate-coupon', orderController.validateCoupon);
router.get('/mine', requireCustomerAuth, orderController.listMine);
router.get('/mine/:id', requireCustomerAuth, orderController.getMineById);
router.post('/mine/:id/cancel', requireCustomerAuth, orderController.cancelMine);
router.get('/public/:id', orderController.getPublicById);
router.get('/track', orderController.track);
router.get('/phone/:phone', orderController.searchByPhone);

// Admin endpoints
router.get('/', requireUserAuth, requireRoles('admin', 'superadmin'), orderController.list);
router.get('/:id', requireUserAuth, requireRoles('admin', 'superadmin'), orderController.getByIdAdmin);
router.patch('/:id/status', requireUserAuth, requireRoles('admin', 'superadmin'), orderController.setStatus);
router.patch('/:id/shipping-status', requireUserAuth, requireRoles('admin', 'superadmin'), orderController.setShippingStatus);
router.patch('/:id/payment-status', requireUserAuth, requireRoles('admin', 'superadmin'), orderController.setPaymentStatus);

export default router;
