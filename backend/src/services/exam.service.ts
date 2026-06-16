import { prisma } from '../database/prisma';

export class ExamService {
  static async createExam(data: {
    name: string;
    description?: string;
    duration: number;
    totalQuestions: number;
    passingPercentage: number;
    startDate: Date;
    endDate: Date;
    status: string;
    creatorId: string;
    questionIds: string[];
  }) {
    const exam = await prisma.$transaction(async (tx) => {
      // 1. Create Exam
      const newExam = await tx.exam.create({
        data: {
          name: data.name,
          description: data.description,
          duration: data.duration,
          totalQuestions: data.totalQuestions,
          passingPercentage: data.passingPercentage,
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.status,
          creatorId: data.creatorId,
        },
      });

      // 2. Link Questions
      if (data.questionIds && data.questionIds.length > 0) {
        await tx.examQuestion.createMany({
          data: data.questionIds.map((qId) => ({
            examId: newExam.id,
            questionId: qId,
          })),
        });
      }

      return newExam;
    });

    return exam;
  }

  static async updateExam(
    id: string,
    data: {
      name: string;
      description?: string;
      duration: number;
      totalQuestions: number;
      passingPercentage: number;
      startDate: Date;
      endDate: Date;
      status: string;
      questionIds: string[];
    }
  ) {
    const exam = await prisma.$transaction(async (tx) => {
      // 1. Update Exam
      const updatedExam = await tx.exam.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          duration: data.duration,
          totalQuestions: data.totalQuestions,
          passingPercentage: data.passingPercentage,
          startDate: data.startDate,
          endDate: data.endDate,
          status: data.status,
        },
      });

      // 2. Clear old links
      await tx.examQuestion.deleteMany({
        where: { examId: id },
      });

      // 3. Link new questions
      if (data.questionIds && data.questionIds.length > 0) {
        await tx.examQuestion.createMany({
          data: data.questionIds.map((qId) => ({
            examId: id,
            questionId: qId,
          })),
        });
      }

      return updatedExam;
    });

    return exam;
  }

  static async deleteExam(id: string) {
    return prisma.exam.delete({
      where: { id },
    });
  }

  static async getExams(role: string, studentId?: string) {
    if (role === 'STUDENT') {
      if (!studentId) throw new Error('Student identifier missing.');

      const exams = await prisma.exam.findMany({
        where: {
          status: 'PUBLISHED',
        },
        include: {
          examAttempts: {
            where: { studentId },
            include: { result: true },
          },
        },
        orderBy: { startDate: 'asc' },
      });

      // Format exams to show student status: ATTEMPTED, IN_PROGRESS, NOT_ATTEMPTED
      return exams.map((exam) => {
        const attempts = exam.examAttempts;
        let attemptStatus = 'NOT_ATTEMPTED';
        let attemptId = null;
        let score = null;
        let percentage = null;
        let isPassed = null;

        if (attempts.length > 0) {
          const sorted = [...attempts].sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
          const latest = sorted[0];
          attemptId = latest.id;
          if (latest.status === 'EVALUATED' || latest.status === 'SUBMITTED') {
            attemptStatus = 'ATTEMPTED';
            score = latest.score;
            percentage = latest.percentage;
            isPassed = latest.isPassed;
          } else {
            attemptStatus = 'IN_PROGRESS';
          }
        }

        const { examAttempts, ...examData } = exam;
        return {
          ...examData,
          attemptStatus,
          attemptId,
          score,
          percentage,
          isPassed,
        };
      });
    }

    // Admin / SuperAdmin can see all exams
    return prisma.exam.findMany({
      include: {
        creator: true,
        examQuestions: {
          include: {
            question: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getExamById(id: string) {
    return prisma.exam.findUnique({
      where: { id },
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
    });
  }

  static async startAttempt(studentId: string, examId: string) {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
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
    });

    if (!exam) throw new Error('Exam not found.');
    if (exam.status !== 'PUBLISHED') throw new Error('Exam is not open for attempts.');

    const now = new Date();
    if (now < exam.startDate || now > exam.endDate) {
      throw new Error('Exam session is outside the scheduled window.');
    }

    // Check if user has an attempt
    const existingAttempts = await prisma.examAttempt.findMany({
      where: { studentId, examId },
    });

    const activeAttempt = existingAttempts.find((a) => a.status === 'IN_PROGRESS');
    if (activeAttempt) {
      // Re-load questions for active attempt, stripping correctness
      return {
        attemptId: activeAttempt.id,
        examName: exam.name,
        duration: exam.duration,
        startedAt: activeAttempt.startedAt,
        questions: exam.examQuestions.map((eq) => {
          const q = eq.question;
          return {
            id: q.id,
            text: q.text,
            category: q.category,
            difficulty: q.difficulty,
            marks: q.marks,
            options: q.questionOptions.map((o) => ({ id: o.id, text: o.text })), // Strip isCorrect!
          };
        }),
      };
    }

    const completedAttempt = existingAttempts.find((a) => a.status === 'EVALUATED' || a.status === 'SUBMITTED');
    if (completedAttempt) {
      throw new Error('You have already submitted this exam. Duplicate attempts are not permitted.');
    }

    // Start a new attempt
    const newAttempt = await prisma.examAttempt.create({
      data: {
        studentId,
        examId,
        status: 'IN_PROGRESS',
        startedAt: now,
      },
    });

    await prisma.proctorLog.create({
      data: {
        attemptId: newAttempt.id,
        type: 'INFO',
        message: 'Exam session initialized. Monitoring activated.',
      },
    });

    return {
      attemptId: newAttempt.id,
      examName: exam.name,
      duration: exam.duration,
      startedAt: newAttempt.startedAt,
      questions: exam.examQuestions.map((eq) => {
        const q = eq.question;
        return {
          id: q.id,
          text: q.text,
          category: q.category,
          difficulty: q.difficulty,
          marks: q.marks,
          options: q.questionOptions.map((o) => ({ id: o.id, text: o.text })), // Strip isCorrect!
        };
      }),
    };
  }

  static async submitAttempt(
    studentId: string,
    attemptId: string,
    answers: { questionId: string; selectedOptionId: string }[]
  ) {
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
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
      },
    });

    if (!attempt) throw new Error('Attempt not found.');
    if (attempt.studentId !== studentId) throw new Error('Unauthorized action.');
    if (attempt.status !== 'IN_PROGRESS') throw new Error('Exam has already been submitted.');

    const completedAt = new Date();
    const durationSeconds = Math.floor((completedAt.getTime() - attempt.startedAt.getTime()) / 1000);

    const questions = attempt.exam.examQuestions.map((eq) => eq.question);

    let earnedMarks = 0;
    let totalMaxMarks = 0;
    const answerRecords: any[] = [];

    for (const q of questions) {
      totalMaxMarks += q.marks;
      const studentAnswer = answers.find((ans) => ans.questionId === q.id);

      if (studentAnswer) {
        const option = q.questionOptions.find((o) => o.id === studentAnswer.selectedOptionId);
        const isCorrect = option ? option.isCorrect : false;
        
        if (isCorrect) {
          earnedMarks += q.marks;
        }

        answerRecords.push({
          questionId: q.id,
          selectedOptionId: studentAnswer.selectedOptionId,
          isCorrect,
        });
      }
    }

    const scorePercentage = totalMaxMarks > 0 ? (earnedMarks / totalMaxMarks) * 100 : 0;
    const isPassed = scorePercentage >= attempt.exam.passingPercentage;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Save all student answers
      for (const record of answerRecords) {
        await tx.studentAnswer.create({
          data: {
            attemptId,
            questionId: record.questionId,
            selectedOptionId: record.selectedOptionId,
            isCorrect: record.isCorrect,
          },
        });
      }

      // 2. Update Attempt status
      const updatedAttempt = await tx.examAttempt.update({
        where: { id: attemptId },
        data: {
          status: 'EVALUATED',
          completedAt,
          score: earnedMarks,
          percentage: scorePercentage,
          isPassed,
          timeTaken: durationSeconds,
        },
      });

      // 3. Create Result Record
      const newResult = await tx.result.create({
        data: {
          attemptId,
          score: earnedMarks,
          percentage: scorePercentage,
          isPassed,
          timeTaken: durationSeconds,
          violationCount: attempt.violationCount,
          generatedAt: completedAt,
        },
      });

      return { updatedAttempt, newResult };
    });

    // 4. Recalculate ranks asynchronously or right after
    try {
      const allAttemptsForExam = await prisma.examAttempt.findMany({
        where: { examId: attempt.examId, status: 'EVALUATED' },
        orderBy: { percentage: 'desc' },
        include: { result: true },
      });

      for (let r = 0; r < allAttemptsForExam.length; r++) {
        const att = allAttemptsForExam[r];
        if (att.result) {
          await prisma.result.update({
            where: { id: att.result.id },
            data: { rank: r + 1 },
          });
        }
      }
    } catch (rankError) {
      console.error('Rank calculation failed:', rankError);
    }

    return prisma.result.findUnique({
      where: { attemptId },
      include: {
        attempt: {
          include: {
            exam: true,
            student: true,
          },
        },
      },
    });
  }
}
