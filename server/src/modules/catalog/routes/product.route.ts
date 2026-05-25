import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { requireUserAuth } from '../../../shared/middleware/authention';
import { requireRoles } from '../../../shared/middleware/authorization';

const router = Router();

router.get('/', productController.listPublic);
router.get('/detail/:id', productController.getStoreDetail);
router.get('/detail-by-slug/:slug', productController.getStoreDetailBySlug);
router.get('/all', requireUserAuth, requireRoles('admin', 'superadmin'), productController.listAll);
router.get('/admin/:id', requireUserAuth, requireRoles('admin', 'superadmin'), productController.getAdminById);
router.get('/:id', productController.getPublicById);

router.post('/', requireUserAuth, requireRoles('admin', 'superadmin'), productController.create);
router.patch('/:id', requireUserAuth, requireRoles('admin', 'superadmin'), productController.update);
router.delete('/:id', requireUserAuth, requireRoles('admin', 'superadmin'), productController.remove);

export default router;
