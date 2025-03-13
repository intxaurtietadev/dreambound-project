`<template>
  <nav class="border-b border-gray-800">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center gap-3">
          <Moon class="text-gray-400" />
          <span class="text-white uppercase tracking-widest text-sm">Dreamscape</span>
        </div>
        <div class="flex items-center gap-8">
          <button class="nav-button">
            <BookHeart class="w-4 h-4" />
            <span>Journal</span>
          </button>
          <button class="nav-button">
            <User class="w-4 h-4" />
            <span>Profile</span>
          </button>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { Moon, BookHeart, User } from 'lucide-vue-next';
</script>`