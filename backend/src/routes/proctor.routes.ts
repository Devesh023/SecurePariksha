import { Router } from 'express';
import { ProctorController } from '../controllers/proctor.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Students register their own webcam/browser violations
router.post('/violation', authenticate as any, authorize(['STUDENT']) as any, ProctorController.recordViolation as any);

// Admins view logs and monitor live dashboard feeds
router.get('/logs', authenticate as any, authorize(['SUPER_ADMIN', 'EXAM_ADMIN']) as any, ProctorController.getLogs as any);
router.get('/live', authenticate as any, authorize(['SUPER_ADMIN', 'EXAM_ADMIN']) as any, ProctorController.getLive as any);

export default router;
