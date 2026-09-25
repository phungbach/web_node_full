import { Router } from 'express';
import { createRegistrationEntry, deleteRegistrationEntry, listRegistrations, patchRegistrationStatus } from '../controllers/registration.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
router.post('/', createRegistrationEntry);
router.get('/', authMiddleware, listRegistrations);
router.patch('/:id/status', authMiddleware, patchRegistrationStatus);
router.delete('/:id', authMiddleware, deleteRegistrationEntry);

export default router;
