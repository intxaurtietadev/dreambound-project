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
import { LogIn } from 'lucide-vue-next';
import { useLoginForm } from '../composables/Login';

const { nombre, password, error, handleSubmit } = useLoginForm();
</script>