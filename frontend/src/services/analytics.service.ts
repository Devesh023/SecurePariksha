import api from './api';
import { DashboardStats } from '../types';

export class AnalyticsService {
  static async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await api.get('/analytics/dashboard');
    return data;
  }

  static async getExamsStats(): Promise<any[]> {
    const { data } = await api.get('/analytics/exams');
    return data;
  }

  static async getViolationsStats(): Promise<any[]> {
    const { data } = await api.get('/analytics/violations');
    return data;
  }
}
export default AnalyticsService;
