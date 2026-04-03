import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getReportPreview, exportReport } from '../controllers/export.controller';

const router = Router();

router.use(authenticate);

router.get('/preview', getReportPreview);
router.get('/generate', exportReport);

export default router;
