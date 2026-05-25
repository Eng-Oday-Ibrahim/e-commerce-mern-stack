import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { requireUserAuth } from '../../../shared/middleware/authention';
import { requireRoles } from '../../../shared/middleware/authorization';

const router = Router();

router.get(
  '/analytics',
  requireUserAuth,
  requireRoles('admin', 'superadmin'),
  dashboardController.analytics
);

export default router;
