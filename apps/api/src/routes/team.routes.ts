import { Router } from 'express';
import { createTeam, getTeams, updateTeam, addTeamMember, getTeamMembers } from '../controllers/team.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getTeams);
router.post('/', authorize(['admin', 'manager', 'team_head']), createTeam);
router.patch('/:id', authorize(['admin', 'manager', 'team_head']), updateTeam);
router.get('/:id/members', getTeamMembers);
router.post('/:id/members', authorize(['admin', 'manager', 'team_head']), addTeamMember);

export default router;
