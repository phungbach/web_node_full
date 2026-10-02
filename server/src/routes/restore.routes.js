import { Router } from 'express';
import multer from 'multer';
import { restoreServerBackup, restoreUploadedBackup } from '../controllers/restore.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

router.use(authMiddleware);
router.post('/server', restoreServerBackup);
router.post('/upload', upload.single('backup'), restoreUploadedBackup);

export default router;
