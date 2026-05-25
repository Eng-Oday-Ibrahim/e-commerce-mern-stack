import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { requireUserAuth } from '../../../shared/middleware/authention';

const router = Router();

router.post('/login', userController.login);
router.post('/bootstrap', userController.bootstrap);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.post('/accept-invite', userController.acceptInvite);

router.get('/me', requireUserAuth, userController.me);
router.post('/logout', requireUserAuth, userController.logout);

// Invitation-only admin user creation
router.post('/invitations', requireUserAuth, userController.createInvitation);

router.get('/admin/list', requireUserAuth, userController.listTeamUsers);
router.patch('/admin/:id', requireUserAuth, userController.patchTeamUser);

export default router;
