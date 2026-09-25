import { Router } from 'express';
import { getSiteSettings, updateSiteSettings } from '../controllers/settings.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', getSiteSettings);
router.put('/', authMiddleware, updateSiteSettings);

export default router;
