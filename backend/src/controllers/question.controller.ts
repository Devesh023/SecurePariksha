import { Response } from 'express';
import { prisma } from '../database/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export class QuestionController {
  static async getQuestions(req: AuthRequest, res: Response) {
    try {
      const questions = await prisma.question.findMany({
        include: {
          questionOptions: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return res.status(200).json(questions);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async createQuestion(req: AuthRequest, res: Response) {
    try {
      const { text, category, difficulty, marks, options } = req.body;

      if (!text || !category || !difficulty || !marks || !options || !Array.isArray(options)) {
        return res.status(400).json({ message: 'Missing required question fields or options are not array.' });
      }

      if (options.length !== 4) {
        return res.status(400).json({ message: 'A question must have exactly 4 options.' });
      }

      const hasCorrect = options.some((o) => o.isCorrect === true);
      if (!hasCorrect) {
        return res.status(400).json({ message: 'At least one option must be marked as correct.' });
      }

      const question = await prisma.question.create({
        data: {
          text,
          category,
          difficulty,
          marks: Number(marks),
          questionOptions: {
            create: options.map((opt: any) => ({
              text: opt.text,
              isCorrect: !!opt.isCorrect,
            })),
          },
        },
        include: {
          questionOptions: true,
        },
      });

      return res.status(201).json(question);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async updateQuestion(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { text, category, difficulty, marks, options } = req.body;

      if (options && Array.isArray(options)) {
        if (options.length !== 4) {
          return res.status(400).json({ message: 'A question must have exactly 4 options.' });
        }
        const hasCorrect = options.some((o) => o.isCorrect === true);
        if (!hasCorrect) {
          return res.status(400).json({ message: 'At least one option must be marked as correct.' });
        }
      }

      const question = await prisma.$transaction(async (tx) => {
        // 1. Update Core
        const updatedQ = await tx.question.update({
          where: { id },
          data: {
            text,
            category,
            difficulty,
            marks: marks ? Number(marks) : undefined,
          },
        });

        // 2. If options provided, recreate them
        if (options) {
          await tx.questionOption.deleteMany({
            where: { questionId: id },
          });

          await tx.questionOption.createMany({
            data: options.map((opt: any) => ({
              questionId: id,
              text: opt.text,
              isCorrect: !!opt.isCorrect,
            })),
          });
        }

        return tx.question.findUnique({
          where: { id },
          include: { questionOptions: true },
        });
      });

      return res.status(200).json(question);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async deleteQuestion(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      // Because of cascading deletes on schemas, this deletes choices and examQuestion links too
      await prisma.question.delete({
        where: { id },
      });

      return res.status(200).json({ message: 'Question deleted successfully.' });
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }
}
