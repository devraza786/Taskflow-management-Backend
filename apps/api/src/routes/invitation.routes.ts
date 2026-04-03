import { Router } from 'express';
import { createInvitation, getInvitation, acceptInvitation } from '../controllers/invitation.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Public routes (for accepting invitation)
router.get('/:token', getInvitation);
router.post('/:token/accept', acceptInvitation);

// Protected routes (for sending invitation)
router.post('/', authenticate, authorize(['admin', 'manager', 'team_head']), createInvitation);

export default router;
