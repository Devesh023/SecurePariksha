import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seeding database...');

  // 1. Clean database
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.proctorLog.deleteMany({});
  await prisma.violation.deleteMany({});
  await prisma.result.deleteMany({});
  await prisma.studentAnswer.deleteMany({});
  await prisma.examAttempt.deleteMany({});
  await prisma.examQuestion.deleteMany({});
  await prisma.questionOption.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.exam.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.admin.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.role.deleteMany({});

  console.log('Database cleaned.');

  // 2. Create Roles
  const superAdminRole = await prisma.role.create({
    data: { name: 'SUPER_ADMIN', description: 'System owner with full configuration privileges' },
  });

  const examAdminRole = await prisma.role.create({
    data: { name: 'EXAM_ADMIN', description: 'Staff with ability to manage exams and questions' },
  });

  const studentRole = await prisma.role.create({
    data: { name: 'STUDENT', description: 'Candidates participating in examinations' },
  });

  console.log('Roles created.');

  // Hashing helper
  const hashPassword = (password: string) => bcrypt.hashSync(password, 10);

  // 3. Create Users
  const superAdminUser = await prisma.user.create({
    data: {
      email: 'superadmin@securepariksha.com',
      passwordHash: hashPassword('Admin@123'),
      roleId: superAdminRole.id,
      admin: {
        create: { name: 'Super Admin User' },
      },
    },
    include: { admin: true },
  });

  const examAdminUser = await prisma.user.create({
    data: {
      email: 'admin@securepariksha.com',
      passwordHash: hashPassword('Admin@123'),
      roleId: examAdminRole.id,
      admin: {
        create: { name: 'Exam Administrator' },
      },
    },
    include: { admin: true },
  });

  const studentUser = await prisma.user.create({
    data: {
      email: 'student@securepariksha.com',
      passwordHash: hashPassword('Student@123'),
      roleId: studentRole.id,
      student: {
        create: { name: 'Demo Student', rollNumber: 'SP2026001' },
      },
    },
    include: { student: true },
  });

  console.log('Demo accounts created.');

  // Create 10 other student accounts
  const students: any[] = [studentUser.student];
  for (let i = 2; i <= 10; i++) {
    const sUser = await prisma.user.create({
      data: {
        email: `student${i}@securepariksha.com`,
        passwordHash: hashPassword('Student@123'),
        roleId: studentRole.id,
        student: {
          create: {
            name: `Student Participant ${i}`,
            rollNumber: `SP20260${i.toString().padStart(2, '0')}`,
          },
        },
      },
      include: { student: true },
    });
    students.push(sUser.student);
  }

  console.log('10 students created.');

  // 4. Create MCQ Questions Bank (20 complete MCQs)
  const questionData = [
    // Java (5 Questions)
    {
      text: 'Which of the following is NOT a Java feature?',
      category: 'Java',
      difficulty: 'EASY',
      marks: 1,
      options: [
        { text: 'Dynamic loading', isCorrect: false },
        { text: 'Architecture neutral', isCorrect: false },
        { text: 'Use of pointers', isCorrect: true },
        { text: 'Object-oriented programming', isCorrect: false },
      ],
    },
    {
      text: 'What is the default capacity of an ArrayList when it is initialized without arguments in Java?',
      category: 'Java',
      difficulty: 'MEDIUM',
      marks: 2,
      options: [
        { text: '5', isCorrect: false },
        { text: '10', isCorrect: true },
        { text: '15', isCorrect: false },
        { text: '20', isCorrect: false },
      ],
    },
    {
      text: 'Which package contains the Random class in Java?',
      category: 'Java',
      difficulty: 'EASY',
      marks: 1,
      options: [
        { text: 'java.util', isCorrect: true },
        { text: 'java.lang', isCorrect: false },
        { text: 'java.io', isCorrect: false },
        { text: 'java.awt', isCorrect: false },
      ],
    },
    {
      text: 'Which keyword is used in Java to prevent a method from being overridden?',
      category: 'Java',
      difficulty: 'MEDIUM',
      marks: 2,
      options: [
        { text: 'static', isCorrect: false },
        { text: 'final', isCorrect: true },
        { text: 'private', isCorrect: false },
        { text: 'abstract', isCorrect: false },
      ],
    },
    {
      text: 'What is the size of a double variable in Java?',
      category: 'Java',
      difficulty: 'EASY',
      marks: 1,
      options: [
        { text: '8 bits', isCorrect: false },
        { text: '16 bits', isCorrect: false },
        { text: '32 bits', isCorrect: false },
        { text: '64 bits', isCorrect: true },
      ],
    },

    // Python (5 Questions)
    {
      text: 'Which of the following is the correct extension for a Python file?',
      category: 'Python',
      difficulty: 'EASY',
      marks: 1,
      options: [
        { text: '.python', isCorrect: false },
        { text: '.pl', isCorrect: false },
        { text: '.py', isCorrect: true },
        { text: '.p', isCorrect: false },
      ],
    },
    {
      text: 'What is used to define a block of code in Python?',
      category: 'Python',
      difficulty: 'EASY',
      marks: 1,
      options: [
        { text: 'Curly braces {}', isCorrect: false },
        { text: 'Parentheses ()', isCorrect: false },
        { text: 'Indentation', isCorrect: true },
        { text: 'Semicolons', isCorrect: false },
      ],
    },
    {
      text: 'Which function is a built-in function in Python?',
      category: 'Python',
      difficulty: 'EASY',
      marks: 1,
      options: [
        { text: 'val()', isCorrect: false },
        { text: 'print()', isCorrect: true },
        { text: 'printval()', isCorrect: false },
        { text: 'show()', isCorrect: false },
      ],
    },
    {
      text: 'What is the output of print(2 ** 3) in Python?',
      category: 'Python',
      difficulty: 'MEDIUM',
      marks: 2,
      options: [
        { text: '6', isCorrect: false },
        { text: '8', isCorrect: true },
        { text: '9', isCorrect: false },
        { text: '12', isCorrect: false },
      ],
    },
    {
      text: 'How do you define a constructor method in a Python class?',
      category: 'Python',
      difficulty: 'MEDIUM',
      marks: 2,
      options: [
        { text: 'def init()', isCorrect: false },
        { text: 'def __init__(self)', isCorrect: true },
        { text: 'def constructor()', isCorrect: false },
        { text: 'def new()', isCorrect: false },
      ],
    },

    // DBMS (5 Questions)
    {
      text: 'What does SQL stand for in the context of databases?',
      category: 'DBMS',
      difficulty: 'EASY',
      marks: 1,
      options: [
        { text: 'Structured Query Language', isCorrect: true },
        { text: 'Structured Question Language', isCorrect: false },
        { text: 'Strong Query Language', isCorrect: false },
        { text: 'Simple Query Language', isCorrect: false },
      ],
    },
    {
      text: 'Which database key uniquely identifies each record in a table?',
      category: 'DBMS',
      difficulty: 'EASY',
      marks: 1,
      options: [
        { text: 'Foreign Key', isCorrect: false },
        { text: 'Primary Key', isCorrect: true },
        { text: 'Candidate Key', isCorrect: false },
        { text: 'Composite Key', isCorrect: false },
      ],
    },
    {
      text: 'What is the primary purpose of Database Normalization?',
      category: 'DBMS',
      difficulty: 'MEDIUM',
      marks: 2,
      options: [
        { text: 'Minimizing data redundancy', isCorrect: true },
        { text: 'Maximizing file storage speed', isCorrect: false },
        { text: 'Enforcing strong encryption', isCorrect: false },
        { text: 'Adding more indices', isCorrect: false },
      ],
    },
    {
      text: 'Which SQL command is classified under Data Query Language (DQL)?',
      category: 'DBMS',
      difficulty: 'EASY',
      marks: 1,
      options: [
        { text: 'DELETE', isCorrect: false },
        { text: 'UPDATE', isCorrect: false },
        { text: 'INSERT', isCorrect: false },
        { text: 'SELECT', isCorrect: true },
      ],
    },
    {
      text: 'What does the ACID acronym stand for in DBMS?',
      category: 'DBMS',
      difficulty: 'HARD',
      marks: 2,
      options: [
        { text: 'Atomicity Consistency Isolation Durability', isCorrect: true },
        { text: 'Action Control Integration Distribution', isCorrect: false },
        { text: 'Accuracy Completeness Indexing Delivery', isCorrect: false },
        { text: 'Automatic Cache Integrity Defense', isCorrect: false },
      ],
    },

    // Aptitude (5 Questions)
    {
      text: 'If a vehicle travels 120 km in 2 hours, what is its average speed in meters per second (m/s)?',
      category: 'Aptitude',
      difficulty: 'MEDIUM',
      marks: 2,
      options: [
        { text: '16.67 m/s', isCorrect: true },
        { text: '30.00 m/s', isCorrect: false },
        { text: '60.00 m/s', isCorrect: false },
        { text: '20.00 m/s', isCorrect: false },
      ],
    },
    {
      text: 'Identify the next term in the number series: 2, 6, 12, 20, 30, ?',
      category: 'Aptitude',
      difficulty: 'EASY',
      marks: 1,
      options: [
        { text: '36', isCorrect: false },
        { text: '40', isCorrect: false },
        { text: '42', isCorrect: true },
        { text: '48', isCorrect: false },
      ],
    },
    {
      text: 'What is the probability of obtaining a total sum of 7 when rolling two fair six-sided dice simultaneously?',
      category: 'Aptitude',
      difficulty: 'MEDIUM',
      marks: 2,
      options: [
        { text: '1/6', isCorrect: true },
        { text: '1/12', isCorrect: false },
        { text: '1/36', isCorrect: false },
        { text: '5/36', isCorrect: false },
      ],
    },
    {
      text: 'A sum of money doubles itself in 10 years at a constant simple interest rate. What is the rate of interest per annum?',
      category: 'Aptitude',
      difficulty: 'EASY',
      marks: 1,
      options: [
        { text: '5%', isCorrect: false },
        { text: '10%', isCorrect: true },
        { text: '12%', isCorrect: false },
        { text: '15%', isCorrect: false },
      ],
    },
    {
      text: 'If 5 people can build a wooden structure in 12 days, how many days would it take 10 people working at the same pace to build it?',
      category: 'Aptitude',
      difficulty: 'EASY',
      marks: 1,
      options: [
        { text: '6 days', isCorrect: true },
        { text: '24 days', isCorrect: false },
        { text: '5 days', isCorrect: false },
        { text: '8 days', isCorrect: false },
      ],
    },
  ];

  const createdQuestions: any[] = [];
  for (const q of questionData) {
    const dbQuestion = await prisma.question.create({
      data: {
        text: q.text,
        category: q.category,
        difficulty: q.difficulty,
        marks: q.marks,
        questionOptions: {
          create: q.options,
        },
      },
      include: {
        questionOptions: true,
      },
    });
    createdQuestions.push(dbQuestion);
  }

  console.log('20 questions inserted.');

  // 5. Create 2 Exams
  const now = new Date();
  const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
  const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later

  const javaQuestions = createdQuestions.filter((q) => q.category === 'Java' || q.category === 'Aptitude');
  const pythonQuestions = createdQuestions.filter((q) => q.category === 'Python' || q.category === 'DBMS');

  // Exam 1: Java & Aptitude Core Test
  const javaExam = await prisma.exam.create({
    data: {
      name: 'Java and Aptitude General Assessment',
      description: 'Core evaluation test combining foundational Java OOP concepts and logic/aptitude questions.',
      duration: 60, // 60 minutes
      totalQuestions: javaQuestions.length,
      passingPercentage: 50.0,
      startDate,
      endDate,
      status: 'PUBLISHED',
      creatorId: examAdminUser.admin!.id,
    },
  });

  for (const q of javaQuestions) {
    await prisma.examQuestion.create({
      data: {
        examId: javaExam.id,
        questionId: q.id,
      },
    });
  }

  // Exam 2: Python & DBMS Foundations
  const pythonExam = await prisma.exam.create({
    data: {
      name: 'Python Programming and DBMS Foundations',
      description: 'Foundations of Python syntax, data structures, and database principles/SQL.',
      duration: 45, // 45 minutes
      totalQuestions: pythonQuestions.length,
      passingPercentage: 60.0,
      startDate,
      endDate,
      status: 'PUBLISHED',
      creatorId: examAdminUser.admin!.id,
    },
  });

  for (const q of pythonQuestions) {
    await prisma.examQuestion.create({
      data: {
        examId: pythonExam.id,
        questionId: q.id,
      },
    });
  }

  console.log('2 Exams created.');

  // 6. Seed Attempts, Results & Violations for Mock Data
  console.log('Seeding mock exam attempts & violations for analytics...');
  
  // We will loop through the 10 students, generating attempts for each exam
  const examList = [javaExam, pythonExam];
  let attemptCount = 0;

  for (let sIndex = 0; sIndex < students.length; sIndex++) {
    const student = students[sIndex];
    // Not all students attempt all exams to make it realistic
    const examsToAttempt = sIndex % 3 === 0 ? [javaExam] : sIndex % 3 === 1 ? [pythonExam] : [javaExam, pythonExam];

    for (const exam of examsToAttempt) {
      attemptCount++;
      const isJava = exam.id === javaExam.id;
      const currentQuestions = isJava ? javaQuestions : pythonQuestions;
      
      // Determine score & violations based on student index
      // Let's create variations in performance
      const passRateFactor = (sIndex + 3) / 13; // ranges from 0.23 to 1.0
      const durationSeconds = Math.floor(exam.duration * 60 * (0.4 + Math.random() * 0.5));
      const startedAt = new Date(now.getTime() - (sIndex + 1) * 3 * 3600000); // spread across last 30 hours
      const completedAt = new Date(startedAt.getTime() + durationSeconds * 1000);

      // Create Exam Attempt
      const attempt = await prisma.examAttempt.create({
        data: {
          studentId: student.id,
          examId: exam.id,
          status: 'EVALUATED',
          startedAt,
          completedAt,
          violationCount: sIndex % 4 === 0 ? 0 : sIndex % 4 === 1 ? 2 : sIndex % 4 === 2 ? 5 : 8,
          timeTaken: durationSeconds,
        },
      });

      // Answer questions and calculate correct/incorrect
      let earnedMarks = 0;
      let totalMaxMarks = 0;

      for (const q of currentQuestions) {
        totalMaxMarks += q.marks;
        const options = q.questionOptions;
        const correctOption = options.find((o: any) => o.isCorrect);
        const incorrectOptions = options.filter((o: any) => !o.isCorrect);

        // Decide if student got it right
        const gotCorrect = Math.random() < passRateFactor;
        const selectedOption = gotCorrect ? correctOption : incorrectOptions[Math.floor(Math.random() * incorrectOptions.length)];

        if (gotCorrect) {
          earnedMarks += q.marks;
        }

        await prisma.studentAnswer.create({
          data: {
            attemptId: attempt.id,
            questionId: q.id,
            selectedOptionId: selectedOption.id,
            isCorrect: gotCorrect,
            createdAt: startedAt,
          },
        });
      }

      const scorePercentage = (earnedMarks / totalMaxMarks) * 100;
      const isPassed = scorePercentage >= exam.passingPercentage;

      // Update attempt with final score
      await prisma.examAttempt.update({
        where: {
          id: attempt.id,
        },
        data: {
          score: earnedMarks,
          percentage: scorePercentage,
          isPassed,
        },
      });

      // Create Result
      await prisma.result.create({
        data: {
          attemptId: attempt.id,
          score: earnedMarks,
          percentage: scorePercentage,
          isPassed,
          timeTaken: durationSeconds,
          violationCount: attempt.violationCount,
          generatedAt: completedAt,
        },
      });

      // Create Violations if any
      const violationsList = [
        { type: 'TAB_SWITCH', risk: 5 },
        { type: 'FACE_MISSING', risk: 10 },
        { type: 'LOOKING_AWAY', risk: 8 },
        { type: 'MULTIPLE_FACES', risk: 20 },
        { type: 'FULLSCREEN_EXIT', risk: 10 },
        { type: 'DEVTOOLS_OPEN', risk: 15 },
        { type: 'COPY_ATTEMPT', risk: 5 },
        { type: 'PASTE_ATTEMPT', risk: 5 },
      ];

      for (let v = 0; v < attempt.violationCount; v++) {
        const vType = violationsList[v % violationsList.length];
        await prisma.violation.create({
          data: {
            attemptId: attempt.id,
            type: vType.type,
            riskScore: vType.risk,
            timestamp: new Date(startedAt.getTime() + (v + 1) * 2 * 60000), // violations occurred every 2 min
            screenshotUrl: `https://res.cloudinary.com/demo/image/upload/v1625212586/sample_violation_${vType.type.toLowerCase()}.png`,
          },
        });
      }

      // Add simple proctor logs
      await prisma.proctorLog.create({
        data: {
          attemptId: attempt.id,
          type: 'INFO',
          message: 'Webcam feed started successfully.',
          timestamp: startedAt,
        },
      });

      if (attempt.violationCount > 0) {
        await prisma.proctorLog.create({
          data: {
            attemptId: attempt.id,
            type: 'WARNING',
            message: `Detected multiple browser/environmental violations during examination. Warning threshold exceeded.`,
            timestamp: completedAt,
          },
        });
      }
    }
  }

  // Calculate and populate ranks for Results
  // A rank is simply the ordering of the score percentage among attempts for the same exam
  const allExams = await prisma.exam.findMany();
  for (const e of allExams) {
    const attempts = await prisma.examAttempt.findMany({
      where: { examId: e.id, status: 'EVALUATED' },
      orderBy: { percentage: 'desc' },
      include: { result: true },
    });

    for (let r = 0; r < attempts.length; r++) {
      const att = attempts[r];
      if (att.result) {
        await prisma.result.update({
          where: { id: att.result.id },
          data: { rank: r + 1 },
        });
      }
    }
  }

  console.log(`Database seeded with ${attemptCount} attempts, results, and violation histories!`);
  console.log('Seeding process completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
