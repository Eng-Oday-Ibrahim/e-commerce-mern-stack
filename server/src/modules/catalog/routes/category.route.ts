import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { requireUserAuth } from '../../../shared/middleware/authention';
import { requireRoles } from '../../../shared/middleware/authorization';

const router = Router();

router.get('/', categoryController.listPublic);
router.get('/all', requireUserAuth, requireRoles('admin', 'superadmin'), categoryController.listAll);
router.get('/admin/:id', requireUserAuth, requireRoles('admin', 'superadmin'), categoryController.getAdminById);
router.get('/:id', categoryController.getPublicById);

router.post('/', requireUserAuth, requireRoles('admin', 'superadmin'), categoryController.create);
router.patch('/:id', requireUserAuth, requireRoles('admin', 'superadmin'), categoryController.update);
router.delete('/:id', requireUserAuth, requireRoles('admin', 'superadmin'), categoryController.remove);

export default router;
