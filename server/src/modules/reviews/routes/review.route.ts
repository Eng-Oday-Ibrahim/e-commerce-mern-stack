import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { requireCustomerAuth, requireUserAuth } from '../../../shared/middleware/authention';
import { requireRoles } from '../../../shared/middleware/authorization';

const router = Router();

router.get('/products/:productId', reviewController.listApprovedForProductPublic);
router.post('/products/:productId', requireCustomerAuth, reviewController.createCustomerReview);

router.get(
  '/admin/pending',
  requireUserAuth,
  requireRoles('admin', 'superadmin'),
  reviewController.listPendingAdmin
);
router.get(
  '/admin/:id',
  requireUserAuth,
  requireRoles('admin', 'superadmin'),
  reviewController.getAdminById
);
router.patch(
  '/admin/:id',
  requireUserAuth,
  requireRoles('admin', 'superadmin'),
  reviewController.patchAdminStatus
);
router.delete(
  '/admin/:id',
  requireUserAuth,
  requireRoles('admin', 'superadmin'),
  reviewController.removeAdmin
);

export default router;
