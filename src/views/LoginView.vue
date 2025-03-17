<template>
    <section class="py-12 px-4">
      <Login v-if="activeTab === 'login'" @login="handleLogin" @switchToRegister="switchToRegister" />
      <Register v-else @switchToLogin="switchToLogin" />
    </section>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import Login from '../components/Login.vue';
  import Register from '../components/Register.vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '../stores/auth';
  
  const activeTab = ref('login');
  const router = useRouter();
  const authStore = useAuthStore();
  
  const handleLogin = async (userData) => {
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
      throw new Error(errorData.error || 'Login failed');
    }

    const data = await response.json();
    authStore.login(data.token, data.id); // ⬅️ Aquí pasas solo token e id
    router.push('/profile');
  } catch (err) {
    alert(err.message || 'Unexpected error');
  }
};

  
  const switchToRegister = () => {
    activeTab.value = 'register';
  };
  
  const switchToLogin = () => {
    activeTab.value = 'login';
  };
  </script>
  
  <style scoped>

  </style>