// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import JournalView from '../views/JournalView.vue';
import ProfileView from '../views/ProfileView.vue';
import LoginView from '../views/LoginView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/journal',
    name: 'Journal',
    component: JournalView
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
