import { Router } from 'express';
import { createTask, getTasks, updateTaskStatus, getTaskById, updateTask } from '../controllers/task.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getTasks);
router.post('/', authorize(['admin', 'manager', 'team_head']), createTask);
router.get('/:id', getTaskById);
router.patch('/:id', authorize(['admin', 'manager', 'team_head']), updateTask);
router.patch('/:id/status', updateTaskStatus); // Status updates usually allowed for everyone assigned

export default router;
