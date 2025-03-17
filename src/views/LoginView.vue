<template>
  <section class="py-12 px-4">
    <!-- Mostrar Login si activeTab es 'login', de lo contrario, mostrar Register -->
    <Login v-if="activeTab === 'login'" @login="handleLogin" @switchToRegister="switchToRegister" />
    <Register v-else @switchToLogin="switchToLogin" />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Login from '../components/Login.vue';
import Register from '../components/Register.vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth'; // Usar el store para manejar la autenticación

const activeTab = ref<'login' | 'register'>('login');
const router = useRouter();
const authStore = useAuthStore(); // Obtener el store de autenticación

// Manejar el login cuando el evento 'login' es emitido desde Login.vue
// En el caso de que no haya una respuesta exitosa del login, podemos manejar errores más específicos:
const handleLogin = async (userData: { nombre: string; password: string }) => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error || 'Login failed');
    }

    const data = await response.json();
    // Almacenar el token y userId en Pinia y también en localStorage (para persistencia entre sesiones)
    authStore.login(data.token, data.userId);
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);

    // Redirigir a la página de perfil
    router.push('/profile');
  } catch (err) {
    alert((err instanceof Error ? err.message : 'Unexpected error'));
  }
};


// Cambiar a la vista de registro
const switchToRegister = () => {
  activeTab.value = 'register';
};

// Cambiar a la vista de login
const switchToLogin = () => {
  activeTab.value = 'login';
};
</script>
