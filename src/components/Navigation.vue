<template>
  <nav class="border-b border-gray-800">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center gap-3">
          <router-link 
            to="/" 
            class="nav-button"
            :class="{ 'text-white': $route.path === '/' }"
          >
          <Moon class="text-gray-400" />
          <span class="text-white uppercase tracking-widest text-sm">Dreamscape</span>
        </router-link>
        </div>
        <div class="flex items-center gap-8">

          <router-link 
            to="/archetypes" 
            class="nav-button"
            :class="{ 'text-white': $route.path === '/archetypes' }"
          >
            <BookOpen class="w-4 h-4" />
            <span>Archetypes</span>
          </router-link>

          <router-link 
            to="/journal" 
            class="nav-button"
            :class="{ 'text-white': $route.path === '/journal' }"
          >
            <BookHeart class="w-4 h-4" />
            <span>Journal</span>
          </router-link>

          <router-link 
            to="/astral-map" 
            class="nav-button"
            :class="{ 'text-white': $route.path === '/astral-map' }"
          >
            <Star class="w-4 h-4" />
            <span>Astral Map</span>
          </router-link>

          <!-- Dinámico: Login o Profile -->
          <router-link 
            v-if="isLoggedIn"
            to="/profile" 
            class="nav-button"
            :class="{ 'text-white': $route.path === '/profile' }"
          >
            <User class="w-4 h-4" />
            <span>Profile</span>
          </router-link>

          <router-link 
            v-else
            to="/login" 
            class="nav-button"
            :class="{ 'text-white': $route.path === '/login' }"
          >
            <LogIn class="w-4 h-4" />
            <span>Login</span>
          </router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { Moon, BookHeart, User, LogIn, BookOpen, Star } from 'lucide-vue-next';
import { ref, onMounted } from 'vue';

const isLoggedIn = ref(false);

onMounted(() => {
  isLoggedIn.value = !!localStorage.getItem("token");
});
</script>