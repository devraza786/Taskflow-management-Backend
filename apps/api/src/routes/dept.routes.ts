import { Router } from 'express';
import { createDepartment, getDepartments, updateDepartment, deleteDepartment } from '../controllers/department.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getDepartments);
router.post('/', authorize(['admin', 'manager']), createDepartment);
router.patch('/:id', authorize(['admin', 'manager']), updateDepartment);
router.delete('/:id', authorize(['admin']), deleteDepartment);

export default router;
