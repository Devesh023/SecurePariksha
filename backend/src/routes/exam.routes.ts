import { Router } from 'express';
import { ExamController } from '../controllers/exam.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Student-accessible and admin-accessible list
router.get('/', authenticate as any, ExamController.getExams as any);
router.get('/:id', authenticate as any, ExamController.getExamById as any);

// Admin / SuperAdmin only: Exam Configuration
router.post('/', authenticate as any, authorize(['SUPER_ADMIN', 'EXAM_ADMIN']) as any, ExamController.createExam as any);
router.put('/:id', authenticate as any, authorize(['SUPER_ADMIN', 'EXAM_ADMIN']) as any, ExamController.updateExam as any);
router.delete('/:id', authenticate as any, authorize(['SUPER_ADMIN', 'EXAM_ADMIN']) as any, ExamController.deleteExam as any);

// Student only: Exam Attempt Management
router.post('/start', authenticate as any, authorize(['STUDENT']) as any, ExamController.startAttempt as any);
router.post('/submit', authenticate as any, authorize(['STUDENT']) as any, ExamController.submitAttempt as any);

export default router;
