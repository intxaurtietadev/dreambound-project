<template>
    <div class="max-w-md mx-auto">
      <div class="mystical-card rounded-lg p-8">
        <h2 class="text-2xl text-white mb-6 uppercase tracking-widest text-center">Register</h2>
        <form @submit.prevent="handleRegister" class="space-y-6">
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
          <button
            type="submit"
            class="mystical-button w-full py-3 px-6 rounded-lg text-white uppercase tracking-widest 
            text-sm flex items-center justify-center gap-3"
          >
            <UserPlus class="w-4 h-4" />
            Register
          </button>
        </form>
        <div class="mt-6 text-center">
          <router-link to="/login" class="text-gray-400 hover:text-white transition-colors">
            Already have an account? Login here
          </router-link>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { UserPlus } from 'lucide-vue-next';
  
  const router = useRouter();
  const nombre = ref('');
  const password = ref('');
  const bio = ref('');
  const avatarUrl = ref('');
  
  const handleRegister = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: nombre.value,
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
  
      if (response.ok) {
        router.push('/login');
      } else {
        console.error('Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };
  </script>