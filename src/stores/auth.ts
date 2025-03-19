import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    userId: localStorage.getItem('userId') || null,
  }),
  actions: {
    login(token: string, userId: string) {
      this.token = token;
      this.userId = userId;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
    },
    logout() {
      this.token = null;
      this.userId = null;
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    },
  },
});