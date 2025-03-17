// src/stores/auth.ts
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userId: localStorage.getItem('userId') || '',
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    login(token: string, id: string) {
      this.token = token;
      this.userId = id;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', id);
    },
    logout() {
      this.token = '';
      this.userId = '';
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    },
  },
});
