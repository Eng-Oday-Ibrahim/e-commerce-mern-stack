import { Router } from 'express';
import * as storageController from '../controllers/storage.controller';
import { requireUserAuth } from '../../../shared/middleware/authention';
import { requireRoles } from '../../../shared/middleware/authorization';

const router = Router();

router.post('/upload', requireUserAuth, requireRoles('admin', 'superadmin'), storageController.upload);

export default router;

