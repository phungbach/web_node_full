import { Router } from 'express';
import { refresh } from '../controllers/sitemap.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', authMiddleware, refresh);

export default router;
