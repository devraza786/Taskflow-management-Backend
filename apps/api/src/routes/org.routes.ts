import { Router } from 'express';
import { getOrganization, updateOrganization, getOrgAuditLogs } from '../controllers/organization.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getOrganization);
router.patch('/', authorize(['admin']), updateOrganization);
router.get('/audit-logs', authorize(['admin', 'manager']), getOrgAuditLogs);

export default router;
