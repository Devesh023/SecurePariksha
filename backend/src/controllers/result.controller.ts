import { Response } from 'express';
import { prisma } from '../database/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export class ResultController {
  static async getResults(req: AuthRequest, res: Response) {
    try {
      const role = req.user?.role || 'STUDENT';
      const studentId = req.user?.studentId;

      if (role === 'STUDENT') {
        if (!studentId) {
          return res.status(403).json({ message: 'Forbidden. Student profile required.' });
        }

        const results = await prisma.result.findMany({
          where: {
            attempt: { studentId },
          },
          include: {
            attempt: {
              include: {
                exam: true,
                student: true,
              },
            },
          },
          orderBy: { generatedAt: 'desc' },
        });

        return res.status(200).json(results);
      }

      // Admin & SuperAdmin get all results
      const results = await prisma.result.findMany({
        include: {
          attempt: {
            include: {
              exam: true,
              student: true,
            },
          },
        },
        orderBy: { generatedAt: 'desc' },
      });

      return res.status(200).json(results);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async getResultById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const role = req.user?.role || 'STUDENT';
      const studentId = req.user?.studentId;

      const result = await prisma.result.findUnique({
        where: { id },
        include: {
          attempt: {
            include: {
              exam: {
                include: {
                  examQuestions: {
                    include: {
                      question: {
                        include: {
                          questionOptions: true,
                        },
                      },
                    },
                  },
                },
              },
              student: true,
              violations: true,
              studentAnswers: {
                include: {
                  selectedOption: true,
                },
              },
            },
          },
        },
      });

      if (!result) {
        return res.status(404).json({ message: 'Result not found.' });
      }

      // If student, check ownership
      if (role === 'STUDENT' && result.attempt.studentId !== studentId) {
        return res.status(403).json({ message: 'Access Denied. You do not own this exam result.' });
      }

      return res.status(200).json(result);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
