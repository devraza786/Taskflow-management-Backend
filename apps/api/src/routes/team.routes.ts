import { Router } from 'express';
import { 
  createTeam, 
  getTeams, 
  updateTeam, 
  addTeamMember, 
  getTeamMembers, 
  deleteTeam, 
  removeTeamMember,
  inviteTeamMember,
  getTeamById
} from '../controllers/team.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getTeams);
router.get('/:id', getTeamById);
router.post('/', authorize(['admin', 'manager', 'team_head']), createTeam);
router.patch('/:id', authorize(['admin', 'manager', 'team_head']), updateTeam);
router.delete('/:id', authorize(['admin', 'manager', 'team_head']), deleteTeam);
router.get('/:id/members', getTeamMembers);
router.post('/:id/members', authorize(['admin', 'manager', 'team_head']), addTeamMember);
router.post('/:id/invitations', authorize(['admin', 'manager', 'team_head']), inviteTeamMember);
router.delete('/:id/members/:userId', authorize(['admin', 'manager', 'team_head']), removeTeamMember);

export default router;
