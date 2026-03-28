import { Router } from 'express';
import { createTask, getTasks, updateTaskStatus, getTaskById, updateTask } from '../controllers/task.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getTasks);
router.post('/', createTask);
router.get('/:id', getTaskById);
router.patch('/:id', updateTask);
router.patch('/:id/status', updateTaskStatus);

export default router;
