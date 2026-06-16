import { Router } from 'express';
import { ResultController } from '../controllers/result.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate as any);

router.get('/', ResultController.getResults as any);
router.get('/:id', ResultController.getResultById as any);

export default router;
