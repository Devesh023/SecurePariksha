import { Response } from 'express';
import { ExamService } from '../services/exam.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export class ExamController {
  static async getExams(req: AuthRequest, res: Response) {
    try {
      const role = req.user?.role || 'STUDENT';
      const studentId = req.user?.studentId;

      const exams = await ExamService.getExams(role, studentId);
      return res.status(200).json(exams);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async getExamById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const exam = await ExamService.getExamById(id);
      if (!exam) {
        return res.status(404).json({ message: 'Exam not found.' });
      }
      return res.status(200).json(exam);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async createExam(req: AuthRequest, res: Response) {
    try {
      const adminId = req.user?.adminId;
      if (!adminId) {
        return res.status(403).json({ message: 'Forbidden. Admin profile required.' });
      }

      const { name, description, duration, totalQuestions, passingPercentage, startDate, endDate, status, questionIds } = req.body;

      if (!name || !duration || !totalQuestions || !passingPercentage || !startDate || !endDate || !status) {
        return res.status(400).json({ message: 'Missing required fields.' });
      }

      const exam = await ExamService.createExam({
        name,
        description,
        duration: Number(duration),
        totalQuestions: Number(totalQuestions),
        passingPercentage: Number(passingPercentage),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status,
        creatorId: adminId,
        questionIds: questionIds || [],
      });

      return res.status(201).json(exam);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async updateExam(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, duration, totalQuestions, passingPercentage, startDate, endDate, status, questionIds } = req.body;

      const exam = await ExamService.updateExam(id, {
        name,
        description,
        duration: Number(duration),
        totalQuestions: Number(totalQuestions),
        passingPercentage: Number(passingPercentage),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status,
        questionIds: questionIds || [],
      });

      return res.status(200).json(exam);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async deleteExam(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      await ExamService.deleteExam(id);
      return res.status(200).json({ message: 'Exam deleted successfully.' });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async startAttempt(req: AuthRequest, res: Response) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        return res.status(403).json({ message: 'Forbidden. Student profile required to attempt exams.' });
      }

      const { examId } = req.body;
      if (!examId) {
        return res.status(400).json({ message: 'Exam ID is required.' });
      }

      const attemptDetails = await ExamService.startAttempt(studentId, examId);
      return res.status(200).json(attemptDetails);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async submitAttempt(req: AuthRequest, res: Response) {
    try {
      const studentId = req.user?.studentId;
      if (!studentId) {
        return res.status(403).json({ message: 'Forbidden. Student profile required.' });
      }

      const { attemptId, answers } = req.body;
      if (!attemptId || !answers) {
        return res.status(400).json({ message: 'Attempt ID and answers are required.' });
      }

      const result = await ExamService.submitAttempt(studentId, attemptId, answers);
      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
