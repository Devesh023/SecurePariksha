export interface Role {
  id: string;
  name: string;
  description?: string;
}

export interface Admin {
  id: string;
  userId: string;
  name: string;
}

export interface Student {
  id: string;
  userId: string;
  name: string;
  rollNumber: string;
}

export interface User {
  id: string;
  email: string;
  role: string;
  admin?: Admin | null;
  student?: Student | null;
}

export interface QuestionOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  text: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  marks: number;
  questionOptions: QuestionOption[];
  options?: any[];
}

export interface Exam {
  id: string;
  name: string;
  description?: string;
  duration: number; // in minutes
  totalQuestions: number;
  passingPercentage: number;
  startDate: string;
  endDate: string;
  status: 'DRAFT' | 'PUBLISHED' | 'COMPLETED';
  creatorId?: string;
  creator?: Admin;
  attemptStatus?: 'NOT_ATTEMPTED' | 'IN_PROGRESS' | 'ATTEMPTED';
  attemptId?: string | null;
  score?: number | null;
  percentage?: number | null;
  isPassed?: boolean | null;
  examQuestions?: any[];
}

export interface ExamAttempt {
  id: string;
  studentId: string;
  examId: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'EVALUATED';
  startedAt: string;
  completedAt?: string | null;
  score?: number | null;
  percentage?: number | null;
  isPassed?: boolean | null;
  violationCount: number;
  timeTaken?: number | null;
  student?: Student;
  exam?: Exam;
  violations?: Violation[];
  studentAnswers?: StudentAnswer[];
}

export interface StudentAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  selectedOption?: QuestionOption;
}

export interface Result {
  id: string;
  attemptId: string;
  score: number;
  percentage: number;
  rank?: number | null;
  isPassed: boolean;
  timeTaken: number; // in seconds
  violationCount: number;
  generatedAt: string;
  attempt: ExamAttempt;
}

export interface Violation {
  id: string;
  attemptId: string;
  type: 'FACE_MISSING' | 'MULTIPLE_FACES' | 'LOOKING_AWAY' | 'FULLSCREEN_EXIT' | 'TAB_SWITCH' | 'COPY_ATTEMPT' | 'PASTE_ATTEMPT' | 'DEVTOOLS_OPEN';
  screenshotUrl?: string | null;
  timestamp: string;
  riskScore: number;
  studentName?: string;
  rollNumber?: string;
  examName?: string;
  totalViolations?: number;
}

export interface DashboardStats {
  cards: {
    totalStudents: number;
    totalExams: number;
    totalAttempts: number;
    passPercentage: number;
    averageScore: number;
    violationsToday: number;
  };
  charts: {
    passFail: {
      labels: string[];
      datasets: number[];
    };
    studentGrowth: {
      labels: string[];
      datasets: number[];
    };
    violationTrends: {
      labels: string[];
      datasets: number[];
    };
    categoryPerformance: {
      labels: string[];
      datasets: number[];
    };
  };
}
