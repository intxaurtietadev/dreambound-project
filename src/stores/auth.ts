import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: '',
    userId: '',
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
  },
  actions: {
    login(token: string, userId: string) {
      this.token = token;
      this.userId = userId;
    },
    logout() {
      this.token = '';
      this.userId = '';
    },
  },
  persist: true, // 👈 Activas persistencia automática aquí
});
