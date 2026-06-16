import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('========================================');
  console.log('DATABASE RECORD AUDIT COUNTS');
  console.log('========================================');

  const roles = await prisma.role.count();
  const users = await prisma.user.count();
  const admins = await prisma.admin.count();
  const students = await prisma.student.count();
  const exams = await prisma.exam.count();
  const questions = await prisma.question.count();
  const questionOptions = await prisma.questionOption.count();
  const examQuestions = await prisma.examQuestion.count();
  const examAttempts = await prisma.examAttempt.count();
  const studentAnswers = await prisma.studentAnswer.count();
  const results = await prisma.result.count();
  const violations = await prisma.violation.count();
  const proctorLogs = await prisma.proctorLog.count();

  console.log(`Roles:              ${roles}`);
  console.log(`Users:              ${users}`);
  console.log(`Admins:             ${admins}`);
  console.log(`Students:           ${students}`);
  console.log(`Exams:              ${exams}`);
  console.log(`Questions:          ${questions}`);
  console.log(`Question Options:   ${questionOptions}`);
  console.log(`Exam-Questions:     ${examQuestions}`);
  console.log(`Exam Attempts:      ${examAttempts}`);
  console.log(`Student Answers:    ${studentAnswers}`);
  console.log(`Results:            ${results}`);
  console.log(`Violations:         ${violations}`);
  console.log(`Proctor Logs:       ${proctorLogs}`);
  console.log('========================================');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
