import { Router } from 'express';
import * as marketingController from '../controllers/marketing.controller';
import { requireUserAuth } from '../../../shared/middleware/authention';
import { requireRoles } from '../../../shared/middleware/authorization';

const router = Router();

const admin = [requireUserAuth, requireRoles('admin', 'superadmin')];

router.get('/announcements/active', marketingController.announcementsActive);

router.get('/announcements', ...admin, marketingController.announcementsList);
router.post('/announcements', ...admin, marketingController.announcementsCreate);
router.patch('/announcements/:id', ...admin, marketingController.announcementsPatch);
router.delete('/announcements/:id', ...admin, marketingController.announcementsDelete);

router.get('/coupons', ...admin, marketingController.couponsList);
router.get('/coupons/:id', ...admin, marketingController.couponsGetOne);
router.post('/coupons', ...admin, marketingController.couponsCreate);
router.patch('/coupons/:id', ...admin, marketingController.couponsPatch);
router.delete('/coupons/:id', ...admin, marketingController.couponsDelete);

router.get('/offers', ...admin, marketingController.offersList);
router.post('/offers', ...admin, marketingController.offersCreate);
router.patch('/offers/:id', ...admin, marketingController.offersPatch);
router.delete('/offers/:id', ...admin, marketingController.offersDelete);

router.get('/campaigns', ...admin, marketingController.campaignsList);
router.post('/campaigns', ...admin, marketingController.campaignsCreate);
router.patch('/campaigns/:id', ...admin, marketingController.campaignsPatch);
router.delete('/campaigns/:id', ...admin, marketingController.campaignsDelete);

router.post('/carts/track', marketingController.cartTrack);

router.get('/abandoned-carts', ...admin, marketingController.cartsListAdmin);
router.get('/abandoned-carts/:id', ...admin, marketingController.cartsGetOneAdmin);
router.post('/abandoned-carts/:id/remind', ...admin, marketingController.cartRemindAdmin);

router.get('/lookbooks/public', marketingController.lookbooksListPublic);
router.get('/lookbooks/public/:slug', marketingController.lookbooksGetBySlugPublic);

router.get('/hero-slides/public', marketingController.heroSlidesListPublic);
router.get('/hero-slides', ...admin, marketingController.heroSlidesListAdmin);
router.post('/hero-slides', ...admin, marketingController.heroSlidesCreate);
router.get('/hero-slides/:id', ...admin, marketingController.heroSlidesGetOneAdmin);
router.patch('/hero-slides/:id', ...admin, marketingController.heroSlidesPatch);
router.delete('/hero-slides/:id', ...admin, marketingController.heroSlidesDelete);

router.get('/lookbooks', ...admin, marketingController.lookbooksListAdmin);
router.post('/lookbooks', ...admin, marketingController.lookbooksCreate);
router.get('/lookbooks/:id', ...admin, marketingController.lookbooksGetOneAdmin);
router.patch('/lookbooks/:id', ...admin, marketingController.lookbooksPatch);
router.delete('/lookbooks/:id', ...admin, marketingController.lookbooksDelete);

router.get('/lookbooks/:id/items', ...admin, marketingController.lookbookItemsListAdmin);
router.post('/lookbooks/:id/items/bulk', ...admin, marketingController.lookbookItemsBulkCreateAdmin);
router.patch('/lookbooks/:id/items/:itemId', ...admin, marketingController.lookbookItemsPatchAdmin);
router.delete('/lookbooks/:id/items/:itemId', ...admin, marketingController.lookbookItemsDeleteAdmin);
router.post('/lookbooks/:id/items/reorder', ...admin, marketingController.lookbookItemsReorderAdmin);

export default router;
