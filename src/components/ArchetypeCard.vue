<template>
    <div class="opacity-75 rounded-xl shadow-xl overflow-hidden bg-white/10 backdrop-blur-md border-white/20 transition-transform hover:scale-105">
      <img :src="image" :alt="title" class="w-full h-40 object-cover">
      <div class="p-4">
        <h3 class="text-xl font-semibold mb-2">{{ title }}</h3>
        <p class="text-sm">{{ description }}</p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  defineProps<{
    title: string
    description: string
    image: string
  }>()
  </script>
  