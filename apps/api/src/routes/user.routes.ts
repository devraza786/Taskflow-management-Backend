import { Router } from 'express';
import { getMe, getUsers, createUser } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/me', getMe);
router.get('/', authorize(['admin', 'manager']), getUsers);
router.post('/', authorize(['admin', 'manager']), createUser);

export default router;
