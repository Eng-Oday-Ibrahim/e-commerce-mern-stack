import { Router } from 'express';
import * as collectionController from '../controllers/collection.controller';
import { requireUserAuth } from '../../../shared/middleware/authention';
import { requireRoles } from '../../../shared/middleware/authorization';

const router = Router();

router.get('/', collectionController.listPublic);
router.get('/all', requireUserAuth, requireRoles('admin', 'superadmin'), collectionController.listAll);
router.get('/admin/:id', requireUserAuth, requireRoles('admin', 'superadmin'), collectionController.getAdminById);
router.get('/:id', collectionController.getPublicById);

router.post('/', requireUserAuth, requireRoles('admin', 'superadmin'), collectionController.create);
router.patch('/:id', requireUserAuth, requireRoles('admin', 'superadmin'), collectionController.update);
router.delete('/:id', requireUserAuth, requireRoles('admin', 'superadmin'), collectionController.remove);

export default router;
