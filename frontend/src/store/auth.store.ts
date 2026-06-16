import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string, refreshToken: string) => void;
  updateUser: (user: User) => void;
  clearAuth: () => void;
  initAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (user, token, refreshToken) => {
    localStorage.setItem('sp_token', token);
    localStorage.setItem('sp_refresh_token', refreshToken);
    localStorage.setItem('sp_user', JSON.stringify(user));
    set({ user, token, refreshToken, isAuthenticated: true, isLoading: false });
  },

  updateUser: (user) => {
    localStorage.setItem('sp_user', JSON.stringify(user));
    set({ user });
  },

  clearAuth: () => {
    localStorage.removeItem('sp_token');
    localStorage.removeItem('sp_refresh_token');
    localStorage.removeItem('sp_user');
    set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false });
  },

  initAuth: () => {
    const token = localStorage.getItem('sp_token');
    const refreshToken = localStorage.getItem('sp_refresh_token');
    const userStr = localStorage.getItem('sp_user');

    if (token && refreshToken && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, refreshToken, isAuthenticated: true, isLoading: false });
      } catch (e) {
        localStorage.removeItem('sp_token');
        localStorage.removeItem('sp_refresh_token');
        localStorage.removeItem('sp_user');
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
