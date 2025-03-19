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
    component: ProfileView,
    meta: { requiresAuth: true } // Ruta protegida que requiere autenticación
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

// Guard de navegación global para verificar la autenticación
router.beforeEach((to, from, next) => {
  const isLoggedIn = !!localStorage.getItem('token'); // Verifica si el token existe en localStorage

  // Si la ruta requiere autenticación y el usuario no está logueado, lo redirige a Login
  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'Login' });
  } else {
    next(); // Si está logueado o no es necesario autenticación, continua con la navegación
  }
});

export default router;
