import { Router } from 'express';
import { getMe, updateMe, getUsers, createUser } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/me', getMe);
router.patch('/me', updateMe);
router.get('/', authorize(['admin', 'manager']), getUsers);
router.post('/', authorize(['admin', 'manager']), createUser);

export default router;
