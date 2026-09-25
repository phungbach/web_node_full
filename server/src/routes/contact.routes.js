import { Router } from 'express';
import { createContact, listContacts } from '../controllers/contact.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', createContact);
router.get('/', authMiddleware, listContacts);

export default router;
