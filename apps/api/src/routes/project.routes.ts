import { Router } from 'express';
import { createProject, getProjects, updateProject, deleteProject } from '../controllers/project.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', authorize(['admin', 'manager', 'team_head']), createProject);
router.patch('/:id', authorize(['admin', 'manager', 'team_head']), updateProject);
router.delete('/:id', authorize(['admin', 'manager']), deleteProject);

export default router;
