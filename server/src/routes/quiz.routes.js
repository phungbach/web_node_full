import { Router } from 'express';
import {
  create,
  importFile,
  listAdminQuestions,
  listPublicQuestions,
  remove,
  submit,
  update,
} from '../controllers/quiz.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import multer from 'multer';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', listPublicQuestions);
router.post('/submit', submit);
router.get('/admin', authMiddleware, listAdminQuestions);
router.post('/admin', authMiddleware, create);
router.put('/admin/:id', authMiddleware, update);
router.delete('/admin/:id', authMiddleware, remove);
router.post('/admin/import', authMiddleware, upload.single('file'), importFile);

export default router;
