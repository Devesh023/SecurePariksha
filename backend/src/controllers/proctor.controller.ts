import { Request, Response } from 'express';
import { prisma } from '../database/prisma';
import { notifyViolation, getActiveSessionsList } from '../socket/socket.handler';
import { AuthRequest } from '../middlewares/auth.middleware';

export class ProctorController {
  static async recordViolation(req: AuthRequest, res: Response) {
    try {
      const { attemptId, type, screenshotUrl } = req.body;

      if (!attemptId || !type) {
        return res.status(400).json({ message: 'Attempt ID and violation type are required.' });
      }

      // Assign risk score
      let riskScore = 5;
      switch (type) {
        case 'FACE_MISSING':
          riskScore = 10;
          break;
        case 'MULTIPLE_FACES':
          riskScore = 20;
          break;
        case 'LOOKING_AWAY':
          riskScore = 8;
          break;
        case 'TAB_SWITCH':
          riskScore = 5;
          break;
        case 'FULLSCREEN_EXIT':
          riskScore = 10;
          break;
        case 'COPY_ATTEMPT':
          riskScore = 5;
          break;
        case 'PASTE_ATTEMPT':
          riskScore = 5;
          break;
        case 'DEVTOOLS_OPEN':
          riskScore = 15;
          break;
      }

      const violation = await prisma.$transaction(async (tx) => {
        // 1. Create violation record
        const newViolation = await tx.violation.create({
          data: {
            attemptId,
            type,
            screenshotUrl,
            riskScore,
          },
        });

        // 2. Increment violation count on attempt
        await tx.examAttempt.update({
          where: { id: attemptId },
          data: {
            violationCount: {
              increment: 1,
            },
          },
        });

        // 3. Add to proctor log
        await tx.proctorLog.create({
          data: {
            attemptId,
            type: 'WARNING',
            message: `Proctoring Alert: ${type.replace('_', ' ')} detected (Risk Score: +${riskScore})`,
          },
        });

        return newViolation;
      });

      // Fetch student & exam details for Socket broadcast
      const attempt = await prisma.examAttempt.findUnique({
        where: { id: attemptId },
        include: {
          student: true,
          exam: true,
        },
      });

      if (attempt) {
        notifyViolation({
          id: violation.id,
          attemptId: violation.attemptId,
          type: violation.type,
          screenshotUrl: violation.screenshotUrl,
          riskScore: violation.riskScore,
          timestamp: violation.timestamp,
          studentName: attempt.student.name,
          rollNumber: attempt.student.rollNumber,
          examName: attempt.exam.name,
          totalViolations: attempt.violationCount,
        });
      }

      return res.status(201).json(violation);
    } catch (error: any) {
      return res.status(400).json({ message: error.message });
    }
  }

  static async getLogs(req: AuthRequest, res: Response) {
    try {
      const { attemptId } = req.query;

      const filter: any = {};
      if (attemptId) {
        filter.attemptId = String(attemptId);
      }

      const violations = await prisma.violation.findMany({
        where: filter,
        include: {
          attempt: {
            include: {
              student: true,
              exam: true,
            },
          },
        },
        orderBy: { timestamp: 'desc' },
      });

      return res.status(200).json(violations);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async getLive(req: AuthRequest, res: Response) {
    try {
      const activeList = getActiveSessionsList();
      
      const detailedSessions = await Promise.all(
        activeList.map(async (sess) => {
          const attempt = await prisma.examAttempt.findUnique({
            where: { id: sess.attemptId },
            include: {
              student: true,
              exam: true,
              violations: {
                orderBy: { timestamp: 'desc' },
                take: 5,
              },
            },
          });

          if (!attempt) return null;

          return {
            attemptId: sess.attemptId,
            studentId: sess.studentId,
            studentName: attempt.student.name,
            rollNumber: attempt.student.rollNumber,
            examId: sess.examId,
            examName: attempt.exam.name,
            startedAt: attempt.startedAt,
            violationCount: attempt.violationCount,
            recentViolations: attempt.violations,
          };
        })
      );

      return res.status(200).json(detailedSessions.filter(Boolean));
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
