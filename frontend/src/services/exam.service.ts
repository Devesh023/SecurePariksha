import api from './api';
import { Exam, Result } from '../types';

export class ExamService {
  static async getExams(): Promise<Exam[]> {
    const { data } = await api.get('/exams');
    return data;
  }

  static async getExamById(id: string): Promise<Exam> {
    const { data } = await api.get(`/exams/${id}`);
    return data;
  }

  static async createExam(examData: Partial<Exam> & { questionIds: string[] }): Promise<Exam> {
    const { data } = await api.post('/exams', examData);
    return data;
  }

  static async updateExam(id: string, examData: Partial<Exam> & { questionIds: string[] }): Promise<Exam> {
    const { data } = await api.put(`/exams/${id}`, examData);
    return data;
  }

  static async deleteExam(id: string): Promise<{ message: string }> {
    const { data } = await api.delete(`/exams/${id}`);
    return data;
  }

  static async startAttempt(examId: string): Promise<{
    attemptId: string;
    examName: string;
    duration: number;
    startedAt: string;
    questions: any[];
  }> {
    const { data } = await api.post('/exams/start', { examId });
    return data;
  }

  static async submitAttempt(payload: {
    attemptId: string;
    answers: { questionId: string; selectedOptionId: string }[];
  }): Promise<Result> {
    const { data } = await api.post('/exams/submit', payload);
    return data;
  }

  static async getResults(): Promise<Result[]> {
    const { data } = await api.get('/results');
    return data;
  }

  static async getResultById(id: string): Promise<Result> {
    const { data } = await api.get(`/results/${id}`);
    return data;
  }
}
export default ExamService;
