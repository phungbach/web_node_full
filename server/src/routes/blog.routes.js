import { Router } from 'express';
import {
  createNewPost,
  deleteExistingPost,
  getSinglePost,
  listPosts,
  updateExistingPost,
} from '../controllers/blog.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/', listPosts);
router.get('/:slug', getSinglePost);
router.post('/', authMiddleware, createNewPost);
router.put('/:id', authMiddleware, updateExistingPost);
router.delete('/:id', authMiddleware, deleteExistingPost);

export default router;
