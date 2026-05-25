import { Router } from 'express';
import * as currencyController from '../controllers/currency.controller';
import { requireUserAuth } from '../../../shared/middleware/authention';
import { requireRoles } from '../../../shared/middleware/authorization';

const router = Router();

router.get('/public/default', currencyController.getPublicDefault);
router.get('/', requireUserAuth, requireRoles('admin', 'superadmin'), currencyController.listAll);
router.get('/:id', requireUserAuth, requireRoles('admin', 'superadmin'), currencyController.getById);
router.post('/', requireUserAuth, requireRoles('admin', 'superadmin'), currencyController.create);
router.patch('/:id', requireUserAuth, requireRoles('admin', 'superadmin'), currencyController.update);
router.delete('/:id', requireUserAuth, requireRoles('admin', 'superadmin'), currencyController.remove);

export default router;
