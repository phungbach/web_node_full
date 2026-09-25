import { Router } from 'express';
import { login, updatePassword } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/login', login);
router.patch('/password', authMiddleware, updatePassword);

export default router;
