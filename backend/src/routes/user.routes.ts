import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Only Super Admins can manage other user accounts and assign/revoke privileges
router.use(authenticate as any, authorize(['SUPER_ADMIN']) as any);

router.get('/', UserController.getUsers as any);
router.post('/admin', UserController.createAdmin as any);
router.delete('/:id', UserController.deleteUser as any);

export default router;
