import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import DreamJournal from '../components/DreamJournal.vue';
import Profile from '../components/Profile.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('../components/DreamJournal.vue') // O cualquier otro componente de inicio
  },
  {
    path: '/journal',
    name: 'journal',
    component: DreamJournal
  },
  {
    path: '/profile',
    name: 'profile',
    component: Profile
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;