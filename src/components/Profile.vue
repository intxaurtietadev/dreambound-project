<template>
  <div v-if="profile" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Botón de Cerrar Sesión -->
<!-- Botón de Cerrar Sesión -->
<div class="flex justify-end mb-4">
  <button
    @click="logout"
    class="mystical-button flex items-center gap-2 text-sm px-4 py-2 rounded-full"
  >
    <LogOut class="w-4 h-4" />
    Log out
  </button>
</div>


    <!-- Perfil -->
    <div class="mystical-card rounded-2xl p-8 mb-10 shadow-lg transition-all">
      <div class="flex flex-col md:flex-row items-center gap-8 mb-12">
        <div class="relative w-32 h-32 rounded-full overflow-hidden ring-2 ring-indigo-500">
          <img 
            :src="profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'" 
            :alt="`${profile.nombre} avatar`"
            class="w-full h-full object-cover"
          />
        </div>
        <div class="text-center md:text-left">
          <h2 class="text-3xl text-white font-semibold mb-2 uppercase tracking-widest">{{ profile.nombre }}</h2>
          <p class="text-gray-400 italic tracking-wide max-w-md">{{ profile.bio }}</p>
        </div>
      </div>

      <!-- Stats y Temas -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <!-- Dream Stats -->
        <div class="mystical-card rounded-xl p-6 shadow-md">
          <h3 class="text-xl text-white mb-4 uppercase tracking-widest flex items-center gap-2">
            <Moon class="w-5 h-5 text-indigo-300" aria-label="Dream Stats" />
            Dream Stats
          </h3>
          <div class="space-y-4 text-gray-300">
            <div class="flex justify-between">
              <span>Total Dreams</span>
              <span class="text-2xl font-medium">{{ profile.stats.totalDreams }}</span>
            </div>
            <div class="flex justify-between">
              <span>Lucid Dreams</span>
              <span class="text-2xl font-medium">{{ profile.stats.lucidDreams }}</span>
            </div>
            <div class="flex justify-between">
              <span>Dream Streak</span>
              <span class="text-2xl font-medium">{{ profile.stats.currentStreak }} days</span>
            </div>
          </div>
        </div>

        <!-- Common Themes -->
        <div class="mystical-card rounded-xl p-6 shadow-md">
          <h3 class="text-xl text-white mb-4 uppercase tracking-widest flex items-center gap-2">
            <Sparkles class="w-5 h-5 text-indigo-300" aria-label="Common Themes" />
            Common Themes
          </h3>
          <div v-if="profile.commonThemes.length" class="flex flex-wrap gap-2">
            <span 
              v-for="theme in profile.commonThemes" 
              :key="theme"
              class="px-3 py-1 rounded-full text-sm mystical-button"
            >
              {{ theme }}
            </span>
          </div>
          <p v-else class="text-gray-500 italic">No common themes yet.</p>
        </div>
      </div>
    </div>

    <!-- Recent Dreams -->
    <div class="mystical-card rounded-2xl p-8 shadow-lg">
      <h3 class="text-xl text-white mb-6 uppercase tracking-widest flex items-center gap-2">
        <BookOpen class="w-5 h-5 text-indigo-300" aria-label="Recent Dreams" />
        Recent Dreams
      </h3>
      <div v-if="profile.recentDreams.length" class="space-y-6">
        <div 
          v-for="dream in profile.recentDreams" 
          :key="dream.id"
          class="mystical-card rounded-xl p-6 hover:ring-2 hover:ring-indigo-500 transition-all duration-200 cursor-pointer"
        >
          <div class="flex justify-between items-start mb-4">
            <h4 class="text-lg text-white font-semibold">{{ dream.title }}</h4>
            <span class="text-sm text-gray-400">{{ dream.date }}</span>
          </div>
          <p class="text-gray-300 line-clamp-3">{{ dream.description }}</p>
          <div class="flex flex-wrap gap-2 mt-4">
            <span 
              v-for="emotion in dream.emotions" 
              :key="emotion"
              class="px-2 py-1 rounded-full text-xs mystical-button"
            >
              {{ emotion }}
            </span>
          </div>
        </div>
      </div>
      <p v-else class="text-gray-500 italic">No dreams logged yet.</p>
    </div>
    
  </div>
  

  <div v-else class="text-center text-white mt-20">
    Cargando perfil...
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { Moon, Sparkles, BookOpen, LogOut } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

interface Dream {
  id: string;
  title: string;
  description: string;
  date: string;
  emotions: string[];
}

interface Profile {
  nombre: string;
  bio: string;
  avatarUrl: string;
  stats: {
    totalDreams: number;
    lucidDreams: number;
    currentStreak: number;
  };
  commonThemes: string[];
  recentDreams: Dream[];
}

const profile = ref<Profile | null>(null);
const authStore = useAuthStore();

const fetchProfile = async () => {
  try {
    if (!authStore.userId || !authStore.token) return;

    const response = await fetch(`http://localhost:3000/usuarios/${authStore.userId}`, {
      headers: {
        'Authorization': `Bearer ${authStore.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error("❌ Error del servidor");

    const data = await response.json();
    profile.value = data;
  } catch (error) {
    console.error("⚠️ Error al cargar el perfil:", error);
  }
};

onMounted(() => {
  if (authStore.userId && authStore.token) fetchProfile();

  watch(
    () => [authStore.userId, authStore.token],
    ([userId, token]) => {
      if (userId && token) fetchProfile();
    }
  );
});

const router = useRouter();

const logout = () => {
  authStore.logout();
  router.push('/login');
};

</script>
