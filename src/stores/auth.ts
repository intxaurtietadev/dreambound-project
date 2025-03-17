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
    // Acción para cargar el estado desde localStorage
    loadFromLocalStorage() {
      const storedToken = localStorage.getItem('token');
      const storedUserId = localStorage.getItem('userId');
      if (storedToken && storedUserId) {
        this.token = storedToken;
        this.userId = storedUserId;
      }
    },
    
    // Acción para hacer login
    login(token: string, userId: string) {
      this.token = token;
      this.userId = userId;
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
    },

    // Acción para hacer logout
    logout() {
      this.token = '';
      this.userId = '';
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    },
  },
});
