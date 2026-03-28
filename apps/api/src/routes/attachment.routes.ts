import { Router } from 'express';
import { createAttachment, deleteAttachment } from '../controllers/attachment.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createAttachment);
router.delete('/:id', deleteAttachment);

export default router;
