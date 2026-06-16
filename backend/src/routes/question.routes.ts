import { Router } from 'express';
import { QuestionController } from '../controllers/question.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Only admin and superadmin roles can view/manage question bank
router.use(authenticate as any, authorize(['SUPER_ADMIN', 'EXAM_ADMIN']) as any);

router.get('/', QuestionController.getQuestions as any);
router.post('/', QuestionController.createQuestion as any);
router.put('/:id', QuestionController.updateQuestion as any);
router.delete('/:id', QuestionController.deleteQuestion as any);

export default router;
