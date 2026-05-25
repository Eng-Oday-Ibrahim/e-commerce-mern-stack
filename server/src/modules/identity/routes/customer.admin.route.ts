import { Router } from 'express';
import * as customerAdminController from '../controllers/customer.admin.controller';
import { requireUserAuth } from '../../../shared/middleware/authention';
import { requireRoles } from '../../../shared/middleware/authorization';

const router = Router();

router.get(
  '/all',
  requireUserAuth,
  requireRoles('admin', 'superadmin'),
  customerAdminController.listAdmin
);
router.get(
  '/:customerId',
  requireUserAuth,
  requireRoles('admin', 'superadmin'),
  customerAdminController.getAdminById
);

export default router;
