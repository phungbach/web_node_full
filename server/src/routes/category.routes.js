import { Router } from 'express';
import { createCategoryEntry, deleteCategoryEntry, listCategories, updateCategoryEntry } from '../controllers/category.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', listCategories);
router.post('/', authMiddleware, createCategoryEntry);
router.put('/:id', authMiddleware, updateCategoryEntry);
router.delete('/:id', authMiddleware, deleteCategoryEntry);

export default router;
