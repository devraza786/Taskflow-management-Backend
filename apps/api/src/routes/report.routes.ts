import { Router } from 'express';
import { getProjectStats, getTeamPerformance } from '../controllers/report.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/projects', authenticate, authorize(['admin', 'manager']), getProjectStats);
router.get('/teams', authenticate, authorize(['admin', 'manager']), getTeamPerformance);

export default router;
