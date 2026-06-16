import api from './api';

export class AuthService {
  static async login(credentials: { email: string; password: string }) {
    const { data } = await api.post('/auth/login', credentials);
    return data;
  }

  static async register(studentData: { name: string; email: string; password: string; rollNumber: string }) {
    const { data } = await api.post('/auth/register', studentData);
    return data;
  }

  static async forgotPassword(email: string) {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  }

  static async resetPassword(payload: { token: string; password: string }) {
    const { data } = await api.post('/auth/reset-password', payload);
    return data;
  }

  static async getMe() {
    const { data } = await api.get('/auth/me');
    return data;
  }

  static async logout() {
    const { data } = await api.post('/auth/logout');
    return data;
  }
}
