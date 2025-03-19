<template>
  <div class="max-w-md mx-auto">
    <div class="mystical-card rounded-lg p-8">
      <h2 class="text-2xl text-white mb-6 uppercase tracking-widest text-center">Login</h2>
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div>
          <label for="nombre" class="block text-gray-400 mb-2 uppercase tracking-wider text-sm">
            Username
          </label>
          <input
            id="nombre"
            v-model="nombre"
            type="text"
            class="dream-input w-full p-3 rounded-lg bg-opacity-10 border border-gray-800 
            text-white focus:outline-none focus:border-gray-600 transition-all"
            required
          />
        </div>
        <div>
          <label for="password" class="block text-gray-400 mb-2 uppercase tracking-wider text-sm">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="dream-input w-full p-3 rounded-lg bg-opacity-10 border border-gray-800 
            text-white focus:outline-none focus:border-gray-600 transition-all"
            required
          />
        </div>
        <button
          type="submit"
          class="mystical-button w-full py-3 px-6 rounded-lg text-white uppercase tracking-widest 
          text-sm flex items-center justify-center gap-3"
        >
          <LogIn class="w-4 h-4" />
          Login
        </button>

        <p v-if="error" class="text-red-500 text-center">{{ error }}</p>
      </form>
      <div class="mt-6 text-center">
        <button @click="$emit('switchToRegister')" class="text-gray-400 hover:text-white transition-colors">
          Don't have an account? Register here
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { LogIn } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { jwtDecode } from 'jwt-decode';


// Interfaz para el contenido decodificado del token
interface DecodedToken {
  id: string;
  nombre: string;
  email: string;
  iat: number;
  exp: number;
}

// Interfaz de la respuesta del backend
interface LoginResponse {
  token: string;
}

const nombre = ref<string>('');
const password = ref<string>('');
const error = ref<string | null>(null);

const router = useRouter();
const authStore = useAuthStore();

const handleSubmit = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ nombre: nombre.value, password: password.value }),
    });

    const data: LoginResponse = await response.json();

    if (!response.ok) {
      throw new Error('Login failed');
    }

    // Decodificar el token para obtener el userId
    const decoded = jwtDecode<DecodedToken>(data.token);
    const userId = decoded.id;

    // Guardar en el store
    authStore.login(data.token, userId);
    console.log('✅ Login successful');
    console.log('🧠 Token:', authStore.token);
    console.log('🧠 UserId:', authStore.userId);

    // Redirigir al perfil
    router.push('/profile');
  } catch (err) {
    error.value = (err as Error).message || 'Unexpected error';
    console.error('❌ Login error:', err);
  }
};
</script>
