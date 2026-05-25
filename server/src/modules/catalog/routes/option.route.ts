import { Router } from 'express';
import * as optionController from '../controllers/option.controller';
import { requireUserAuth } from '../../../shared/middleware/authention';
import { requireRoles } from '../../../shared/middleware/authorization';

const router = Router();

router.get('/', optionController.listPublic);
router.get('/all', requireUserAuth, requireRoles('admin', 'superadmin'), optionController.listAll);
router.get('/admin/:id', requireUserAuth, requireRoles('admin', 'superadmin'), optionController.getAdminById);
router.get('/:id', optionController.getPublicById);

router.post('/', requireUserAuth, requireRoles('admin', 'superadmin'), optionController.create);
router.patch('/:id', requireUserAuth, requireRoles('admin', 'superadmin'), optionController.update);
router.delete('/:id', requireUserAuth, requireRoles('admin', 'superadmin'), optionController.remove);

export default router;
