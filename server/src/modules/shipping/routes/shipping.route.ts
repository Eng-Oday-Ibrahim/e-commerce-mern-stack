import { Router } from 'express';
import * as shippingController from '../controllers/shipping.controller';
import { requireUserAuth } from '../../../shared/middleware/authention';
import { requireRoles } from '../../../shared/middleware/authorization';

const router = Router();

// Public: countries with their active cities
router.get('/countries', shippingController.listPublicCountries);

// Admin: countries
router.get('/countries/all', requireUserAuth, requireRoles('admin', 'superadmin'), shippingController.listAllCountriesController);
router.get('/countries/:id', requireUserAuth, requireRoles('admin', 'superadmin'), shippingController.getCountry);
router.post('/countries', requireUserAuth, requireRoles('admin', 'superadmin'), shippingController.createCountryController);
router.patch('/countries/:id', requireUserAuth, requireRoles('admin', 'superadmin'), shippingController.updateCountryController);
router.delete('/countries/:id', requireUserAuth, requireRoles('admin', 'superadmin'), shippingController.deleteCountryController);

// Admin: cities
router.get('/countries/:countryId/cities', requireUserAuth, requireRoles('admin', 'superadmin'), shippingController.listCities);
router.get('/cities/:id', requireUserAuth, requireRoles('admin', 'superadmin'), shippingController.getCity);
router.post('/cities', requireUserAuth, requireRoles('admin', 'superadmin'), shippingController.createCityController);
router.patch('/cities/:id', requireUserAuth, requireRoles('admin', 'superadmin'), shippingController.updateCityController);
router.delete('/cities/:id', requireUserAuth, requireRoles('admin', 'superadmin'), shippingController.deleteCityController);

export default router;
