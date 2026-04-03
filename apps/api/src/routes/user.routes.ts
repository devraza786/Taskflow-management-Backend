import { Router } from 'express';
import multer from 'multer';
import { 
  getMe, 
  updateMe, 
  getUsers, 
  createUser, 
  updateUser,
  updateProfileImage, 
  changePassword,
  updateOrganization
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.use(authenticate);

router.get('/me', getMe);
router.patch('/me', updateMe);
router.post('/avatar', upload.single('avatar'), updateProfileImage);
router.post('/change-password', changePassword);
router.patch('/organization', authorize(['admin']), updateOrganization);

router.get('/', authorize(['admin', 'manager']), getUsers);
router.post('/', authorize(['admin', 'manager']), createUser);
router.patch('/:id', authorize(['admin', 'manager']), updateUser);

export default router;
