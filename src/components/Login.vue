<template>
  <div class="max-w-3xl mx-auto">
    <div class="mystical-card rounded-lg p-8">
      <form @submit.prevent="handleSubmit" class="space-y-8">
        <!-- Email Field -->
        <div>
          <label for="email" class="block text-xl text-white mb-4 uppercase tracking-widest text-sm">
            Email Address
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            class="dream-input w-full p-4 rounded-lg bg-opacity-10 border border-gray-800 text-white focus:outline-none focus:border-gray-600 transition-all"
            placeholder="Enter your email..."
          />
        </div>

        <!-- Password Field -->
        <div>
          <label for="password" class="block text-xl text-white mb-4 uppercase tracking-widest text-sm">
            Password
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="dream-input w-full p-4 rounded-lg bg-opacity-10 border border-gray-800 
            text-white focus:outline-none focus:border-gray-600 transition-all"
            placeholder="Enter your password..."
          />
        </div>

        <!-- Error Message -->
        <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

        <!-- Submit Button -->
        <button
          type="submit"
          class="mystical-button w-full py-4 px-6 rounded-lg text-white uppercase tracking-widest 
          text-sm flex items-center justify-center gap-3"
        >
          <Sparkles class="w-4 h-4" />
          Log In
        </button>

        <!-- Sign Up Link -->
        <p class="text-gray-400 text-center mt-4">
          Don't have an account?{' '}
          <a href="#" class="text-white hover:text-gray-300 transition-colors">
            Sign Up
          </a>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next';
import { useLoginForm } from '../composables/Login';

const { email, password, error, handleSubmit } = useLoginForm();
</script>