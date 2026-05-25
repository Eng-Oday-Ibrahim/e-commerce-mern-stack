import { Router } from 'express';
import * as customerController from '../controllers/customer.controller';
import { requireCustomerAuth } from '../../../shared/middleware/authention';

const router = Router();

router.post('/register', customerController.register);
router.post('/login', customerController.login);
router.post('/forgot-password', customerController.forgotPassword);
router.post('/reset-password', customerController.resetPassword);

router.get('/me', requireCustomerAuth, customerController.me);
router.post('/logout', requireCustomerAuth, customerController.logout);
router.get('/wishlist', requireCustomerAuth, customerController.wishlistList);
router.post('/wishlist/:productId', requireCustomerAuth, customerController.wishlistAdd);
router.delete('/wishlist/:productId', requireCustomerAuth, customerController.wishlistRemove);

export default router;
