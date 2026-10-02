import { Router } from 'express';
import { databaseStatus, getAnalyticsOverview, trackPostView, trackVisitor } from '../controllers/analytics.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/overview', authMiddleware, getAnalyticsOverview);
router.get('/database', authMiddleware, databaseStatus);
router.post('/visitor', trackVisitor);
router.post('/post-view', trackPostView);

export default router;
