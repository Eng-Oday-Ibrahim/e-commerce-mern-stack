import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller';
import { requireCustomerAuth, requireUserAuth } from '../../../shared/middleware/authention';
import { requireRoles } from '../../../shared/middleware/authorization';

const router = Router();

// Webhook is mounted in app.ts with express.raw().

router.post('/checkout-session', paymentController.createCheckoutSession);

router.get('/mine', requireCustomerAuth, paymentController.listMine);
router.get('/admin', requireUserAuth, requireRoles('admin', 'superadmin'), paymentController.listAdmin);
router.patch('/:id/status', requireUserAuth, requireRoles('admin', 'superadmin'), paymentController.setStatus);

router.get('/settings/public', paymentController.getPublicSettings);
router.get('/settings', requireUserAuth, requireRoles('admin', 'superadmin'), paymentController.getSettings);
router.patch('/settings', requireUserAuth, requireRoles('admin', 'superadmin'), paymentController.patchSettings);

export default router;
