import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate as any, authorize(['SUPER_ADMIN', 'EXAM_ADMIN']) as any);

router.get('/dashboard', AnalyticsController.getDashboard as any);
router.get('/exams', AnalyticsController.getExamsStats as any);
router.get('/violations', AnalyticsController.getViolationsStats as any);

export default router;
