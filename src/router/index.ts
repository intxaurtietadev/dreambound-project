import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import JournalView from '../views/JournalView.vue';
import ProfileView from '../views/ProfileView.vue';
import LoginView from '../views/LoginView.vue';
import ArchetypesView from '../views/ArchetypesView.vue';
import ArchetypeTestView from '../views/ArchetypeTestView.vue';
import DreamAstralMapView from '../views/DreamAstralMapView.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/journal',
    name: 'Journal',
    component: JournalView
  },
  {
    path: '/archetypes',
    name: 'Archetypes',
    component: ArchetypesView
  },
  {
    path: '/archetype-test',
    name: 'ArchetypeTest',
    component: ArchetypeTestView
  },
  {
    path: '/astral-map',
    name: 'DreamAstralMap',
    component: DreamAstralMapView,
    meta: { requiresAuth: true }
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

// Guard global para proteger rutas
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'Login' });
  } else {
    next();
  }
});

export default router;
