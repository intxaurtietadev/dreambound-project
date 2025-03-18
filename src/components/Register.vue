<template>
  <div class="max-w-md mx-auto">
    <div class="mystical-card rounded-lg p-8">
      <h2 class="text-2xl text-white mb-6 uppercase tracking-widest text-center">Register</h2>
      <form @submit.prevent="handleRegister" class="space-y-6">
        <!-- Nombre -->
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

        <!-- Email -->
        <div>
          <label for="email" class="block text-gray-400 mb-2 uppercase tracking-wider text-sm">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="dream-input w-full p-3 rounded-lg bg-opacity-10 border border-gray-800 
            text-white focus:outline-none focus:border-gray-600 transition-all"
            placeholder="example@example.com"
            required
          />
        </div>

        <!-- Contraseña -->
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

        <!-- Bio -->
        <div>
          <label for="bio" class="block text-gray-400 mb-2 uppercase tracking-wider text-sm">
            Bio
          </label>
          <textarea
            id="bio"
            v-model="bio"
            class="dream-input w-full p-3 rounded-lg bg-opacity-10 border border-gray-800 
            text-white focus:outline-none focus:border-gray-600 transition-all"
            rows="3"
          ></textarea>
        </div>

        <!-- Avatar URL -->
        <div>
          <label for="avatarUrl" class="block text-gray-400 mb-2 uppercase tracking-wider text-sm">
            Avatar URL
          </label>
          <input
            id="avatarUrl"
            v-model="avatarUrl"
            type="url"
            class="dream-input w-full p-3 rounded-lg bg-opacity-10 border border-gray-800 
            text-white focus:outline-none focus:border-gray-600 transition-all"
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        <!-- Botón de registro -->
        <button
          type="submit"
          class="mystical-button w-full py-3 px-6 rounded-lg text-white uppercase tracking-widest 
          text-sm flex items-center justify-center gap-3"
        >
          <UserPlus class="w-4 h-4" />
          Register
        </button>
        
        <!-- Mensajes de error -->
        <p v-if="errorMessage" class="text-red-500 text-center mt-4">{{ errorMessage }}</p>
      </form>

      <!-- Enlace al login -->
      <div class="mt-6 text-center">
        <a 
  href="#"
  class="register__link"
  @click.prevent="$emit('switchToLogin')"
>
  Already have an account? Login here
</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { UserPlus } from 'lucide-vue-next';

const router = useRouter();

// Tipos de datos
const nombre = ref<string>('');
const email = ref<string>('');
const password = ref<string>('');
const bio = ref<string>('');
const avatarUrl = ref<string>('');
const errorMessage = ref<string>('');

defineEmits(['switchToLogin']);

// Función para registrar usuario
const handleRegister = async () => {
  errorMessage.value = '';

  if (!nombre.value || !email.value || !password.value) {
    errorMessage.value = 'All fields are required';
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: nombre.value,
        email: email.value,
        password: password.value,
        bio: bio.value,
        avatarUrl: avatarUrl.value,
        stats: {
          totalDreams: 0,
          lucidDreams: 0,
          currentStreak: 0
        },
        commonThemes: [],
        recentDreams: []
      }),
    });

    const contentType = response.headers.get('content-type');

    if (response.ok) {
      const data = contentType?.includes('application/json') ? await response.json() : {};
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      router.push('/profile'); // Redirigir al perfil si el registro fue exitoso
    } else {
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        errorMessage.value = data.message || data.error || 'Registration failed';
      } else {
        const text = await response.text(); // leer como texto si no es JSON
        console.error('Respuesta no JSON:', text);
        errorMessage.value = 'Unexpected server response.';
      }
    }
  } catch (error) {
    console.error('Error during registration:', error);
    errorMessage.value = 'Something went wrong. Please try again.';
  }
};
</script>
