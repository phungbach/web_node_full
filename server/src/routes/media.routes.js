import { Router } from 'express';
import { listMedia, removeMedia, uploadMedia } from '../controllers/media.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', authMiddleware, listMedia);
router.post('/', authMiddleware, uploadMedia);
router.delete('/:id', authMiddleware, removeMedia);

export default router;
