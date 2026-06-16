import { Response } from 'express';
import { prisma } from '../database/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export class AnalyticsController {
  static async getDashboard(req: AuthRequest, res: Response) {
    try {
      // 1. Key Card Stats
      const totalStudents = await prisma.student.count();
      const totalExams = await prisma.exam.count();
      
      const evaluatedAttempts = await prisma.examAttempt.findMany({
        where: { status: 'EVALUATED' },
      });

      const totalAttempts = evaluatedAttempts.length;
      
      let passPercentage = 0;
      let averageScore = 0;

      if (totalAttempts > 0) {
        const passedCount = evaluatedAttempts.filter((a) => a.isPassed === true).length;
        passPercentage = Number(((passedCount / totalAttempts) * 100).toFixed(1));
        
        const sumScores = evaluatedAttempts.reduce((acc, a) => acc + (a.percentage || 0), 0);
        averageScore = Number((sumScores / totalAttempts).toFixed(1));
      }

      // Count violations in the last 24 hours
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const violationsToday = await prisma.violation.count({
        where: {
          timestamp: {
            gte: oneDayAgo,
          },
        },
      });

      // 2. Chart: Pass vs Fail
      const passedAttempts = evaluatedAttempts.filter((a) => a.isPassed === true).length;
      const failedAttempts = totalAttempts - passedAttempts;

      // 3. Chart: Student Growth (last 7 days)
      // Group users by creation date
      const last7Days: string[] = [];
      const growthData: number[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        last7Days.push(dateStr);

        const startOfDay = new Date(d.setHours(0, 0, 0, 0));
        const endOfDay = new Date(d.setHours(23, 59, 59, 999));

        const count = await prisma.student.count({
          where: {
            user: {
              createdAt: {
                gte: startOfDay,
                lte: endOfDay,
              },
            },
          },
        });
        growthData.push(count);
      }

      // Cumulative student growth curve
      const studentsBefore7Days = await prisma.student.count({
        where: {
          user: {
            createdAt: {
              lt: new Date(new Date().setDate(new Date().getDate() - 6)),
            },
          },
        },
      });

      let cumulative = studentsBefore7Days;
      const cumulativeGrowthData = growthData.map((daily) => {
        cumulative += daily;
        return cumulative;
      });

      // 4. Chart: Violation Trends (last 7 days)
      const violationDatesData: number[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const startOfDay = new Date(d.setHours(0, 0, 0, 0));
        const endOfDay = new Date(d.setHours(23, 59, 59, 999));

        const count = await prisma.violation.count({
          where: {
            timestamp: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        });
        violationDatesData.push(count);
      }

      // 5. Chart: Category Performance
      // Calculate average score of answers per category
      const categories = ['Java', 'Python', 'DBMS', 'Aptitude'];
      const categoryPerformance = await Promise.all(
        categories.map(async (cat) => {
          const answers = await prisma.studentAnswer.findMany({
            where: {
              question: { category: cat },
            },
          });
          const totalAnswers = answers.length;
          const correctAnswers = answers.filter((a) => a.isCorrect === true).length;
          const score = totalAnswers > 0 ? Number(((correctAnswers / totalAnswers) * 100).toFixed(1)) : 0;
          return { category: cat, averageScore: score };
        })
      );

      return res.status(200).json({
        cards: {
          totalStudents,
          totalExams,
          totalAttempts,
          passPercentage,
          averageScore,
          violationsToday,
        },
        charts: {
          passFail: {
            labels: ['Pass', 'Fail'],
            datasets: [passedAttempts, failedAttempts],
          },
          studentGrowth: {
            labels: last7Days,
            datasets: cumulativeGrowthData,
          },
          violationTrends: {
            labels: last7Days,
            datasets: violationDatesData,
          },
          categoryPerformance: {
            labels: categoryPerformance.map((c) => c.category),
            datasets: categoryPerformance.map((c) => c.averageScore),
          },
        },
      });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async getExamsStats(req: AuthRequest, res: Response) {
    try {
      const exams = await prisma.exam.findMany({
        include: {
          examAttempts: {
            where: { status: 'EVALUATED' },
          },
        },
      });

      const stats = exams.map((exam) => {
        const attempts = exam.examAttempts;
        const total = attempts.length;
        const passed = attempts.filter((a) => a.isPassed === true).length;
        const passPercentage = total > 0 ? Number(((passed / total) * 100).toFixed(1)) : 0;
        
        const sumScores = attempts.reduce((acc, a) => acc + (a.percentage || 0), 0);
        const averagePercentage = total > 0 ? Number((sumScores / total).toFixed(1)) : 0;

        const totalViolations = attempts.reduce((acc, a) => acc + a.violationCount, 0);

        return {
          id: exam.id,
          name: exam.name,
          totalAttempts: total,
          passPercentage,
          averagePercentage,
          totalViolations,
        };
      });

      return res.status(200).json(stats);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  static async getViolationsStats(req: AuthRequest, res: Response) {
    try {
      const violations = await prisma.violation.findMany();
      
      const breakdown: Record<string, number> = {
        FACE_MISSING: 0,
        MULTIPLE_FACES: 0,
        LOOKING_AWAY: 0,
        TAB_SWITCH: 0,
        FULLSCREEN_EXIT: 0,
        DEVTOOLS_OPEN: 0,
        COPY_ATTEMPT: 0,
        PASTE_ATTEMPT: 0,
      };

      violations.forEach((v) => {
        if (v.type in breakdown) {
          breakdown[v.type]++;
        } else {
          breakdown[v.type] = 1;
        }
      });

      const formatted = Object.entries(breakdown).map(([type, count]) => ({
        type,
        count,
      }));

      return res.status(200).json(formatted);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }
}
