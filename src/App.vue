<template>
  <div class="min-h-screen starry-bg">
    <Navigation />
    <main class="container mx-auto px-4 py-12">
      <header class="text-center mb-16">
        <h1 class="text-5xl font-normal text-white mb-6 tracking-wide opacity-90 hover:opacity-100 transition-opacity">
          DREAMBOUND
        </h1>
        <p class="text-lg text-gray-400 max-w-lg mx-auto uppercase tracking-widest text-sm">
          Explore the depths of your unconscious mind through the ancient art of dream interpretation
        </p>
      </header>
      <router-view></router-view>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { Moon, Sparkles } from 'lucide-vue-next';
import Navigation from './components/Navigation.vue';
import Footer from './components/Footer.vue';
</script>