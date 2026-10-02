import { Router } from 'express';
import { create, download, list, remove, schedule, updateSchedule } from '../controllers/backup.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authMiddleware);
router.get('/', list);
router.post('/', create);
router.get('/schedule', schedule);
router.put('/schedule', updateSchedule);
router.delete('/:filename', remove);
router.get('/:filename/download', download);

export default router;
