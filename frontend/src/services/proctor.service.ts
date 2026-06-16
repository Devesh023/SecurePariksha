import api from './api';
import { Violation } from '../types';

export class ProctorService {
  static async recordViolation(payload: {
    attemptId: string;
    type: string;
    screenshotUrl?: string;
  }): Promise<Violation> {
    const { data } = await api.post('/proctor/violation', payload);
    return data;
  }

  static async getLogs(attemptId?: string): Promise<Violation[]> {
    const params = attemptId ? { attemptId } : {};
    const { data } = await api.get('/proctor/logs', { params });
    return data;
  }

  static async getLiveSessions(): Promise<any[]> {
    const { data } = await api.get('/proctor/live');
    return data;
  }
}
export default ProctorService;
