import { Router } from 'express';
import { getProjectStats, getTeamPerformance, getAIInsights, exportReport } from '../controllers/report.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { checkPlan } from '../middlewares/plan.middleware';

const router = Router();

router.get('/project-stats', authenticate, authorize(['admin', 'manager']), getProjectStats);
router.get('/team-performance', authenticate, authorize(['admin', 'manager']), getTeamPerformance);
router.get('/ai-insights', authenticate, checkPlan(['PREMIUM']), getAIInsights);
router.get('/export', authenticate, authorize(['admin', 'manager']), exportReport);

export default router;
