<template>
  <div v-if="isLoading" class="text-center text-purple-400 mt-20 animate-pulse">
    Loading profile data... ✨
  </div>

  <div v-else-if="error" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
     <div class="p-4 bg-red-900 bg-opacity-40 border border-red-700 rounded text-red-300">
        <p><strong class="font-semibold">Error loading profile:</strong> {{ error }}</p>
      </div>
  </div>

  <div v-else-if="profile" class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-end mb-4">
      <button
        @click="logout"
        class="mystical-button flex items-center gap-2 text-sm px-4 py-2 rounded-full"
      >
        <LogOut class="w-4 h-4" />
        Log out
      </button>
    </div>

    <div class="mystical-card rounded-2xl p-8 mb-10 shadow-lg transition-all">

      <div class="flex flex-col md:flex-row items-center gap-8 mb-12">
        <div class="relative w-32 h-32 rounded-full overflow-hidden ring-2 ring-indigo-500">
          <img
            :src="profile.avatarUrl || 'https://via.placeholder.com/256/300240/FFFFFF?text=No+Avatar'"
            :alt="`${profile.nombre} avatar`"
            class="w-full h-full object-cover"
          />
        </div>
        <div class="text-center md:text-left">
          <h2 class="text-3xl text-white font-semibold mb-2 uppercase tracking-widest">{{ profile.nombre }}</h2>
          <p class="text-gray-400 italic tracking-wide max-w-md">{{ profile.bio || 'No bio provided.' }}</p>
           <div v-if="profile.dominantArchetype" class="mt-3">
             <span class="inline-block bg-indigo-900 bg-opacity-50 text-indigo-200 px-3 py-1 rounded-full text-sm font-medium">
               Archetype: {{ profile.dominantArchetype }}
             </span>
           </div>
        </div>
      </div>


      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">

        <div class="mystical-card rounded-xl p-6 shadow-md">
          <h3 class="text-xl text-white mb-4 uppercase tracking-widest flex items-center gap-2">
            <Moon class="w-5 h-5 text-indigo-300" aria-label="Dream Stats" />
            Dream Stats
          </h3>
          <div class="space-y-4 text-gray-300">
            <div class="flex justify-between">
              <span>Total Dreams</span>
              <span class="text-2xl font-medium">{{ profile.stats?.totalDreams ?? 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span>Lucid Dreams</span>
              <span class="text-2xl font-medium">{{ profile.stats?.lucidDreams ?? 0 }}</span>
            </div>
            <div class="flex justify-between">
              <span>Dream Streak</span>
              <span class="text-2xl font-medium">{{ profile.stats?.currentStreak ?? 0 }} days</span>
            </div>
          </div>
        </div>

        <div class="mystical-card rounded-xl p-6 shadow-md">
           <h3 class="text-xl text-white mb-4 uppercase tracking-widest flex items-center gap-2">
            <Sparkles class="w-5 h-5 text-indigo-300" aria-label="Common Themes" />
            Common Themes
          </h3>
          <div v-if="profile.commonThemes && profile.commonThemes.length > 0" class="flex flex-wrap gap-2">
            <span v-for="theme in profile.commonThemes" :key="theme" class="px-3 py-1 rounded-full text-sm mystical-button">
              {{ theme }}
            </span>
          </div>
          <p v-else class="text-gray-500 italic">No common themes identified yet.</p>
        </div>
      </div>
    </div>

    <div class="mystical-card rounded-2xl p-8 shadow-lg">
      <h3 class="text-xl text-white mb-6 uppercase tracking-widest flex items-center gap-2">
        <BookOpen class="w-5 h-5 text-indigo-300" aria-label="Recent Dreams" />
        Recent Dreams
      </h3>
      <div v-if="profile.recentDreams && profile.recentDreams.length > 0" class="space-y-6">

        <div
          v-for="dream in profile.recentDreams"
          :key="dream.id"
          class="mystical-card rounded-xl p-6 hover:ring-2 hover:ring-indigo-500 transition-all duration-200 cursor-pointer"
          @click="expandDream(dream.id)"
        >

          <div class="flex justify-between items-start mb-4">
            <h4 class="text-lg text-white font-semibold">{{ dream.title || 'Untitled Dream' }}</h4>
            <span class="text-sm text-gray-400">{{ formatDate(dream.date) }}</span>
          </div>
          <p class="text-gray-300 line-clamp-3 mb-4">{{ dream.description }}</p>


          <div class="mt-4 pt-4 border-t border-gray-700">
             <h5 class="text-sm uppercase tracking-wider text-amber-300 mb-2">Your Reflection:</h5>

             <p v-if="dream.reflection" class="text-gray-400 italic text-sm whitespace-pre-line">{{ dream.reflection }}</p>

             <p v-else class="text-gray-500 italic text-sm">No reflection added.</p>
          </div>

          <div v-if="dream.emotions && dream.emotions.length > 0" class="flex flex-wrap gap-2 mt-4">
            <span v-for="emotion in dream.emotions" :key="emotion" class="px-2 py-1 rounded-full text-xs bg-purple-900 bg-opacity-50 text-purple-200">
              {{ emotion }}
            </span>
          </div>
        </div>
      </div>

      <p v-else class="text-gray-500 italic">No dreams logged yet.</p>
    </div>

  </div>

  <div v-else-if="!isLoading && !error" class="text-center text-gray-500 mt-20">
     Could not load profile data.
   </div>
</template>

<script setup lang="ts">
// El <script setup> sigue exactamente igual que en la versión anterior.
// No necesita cambios para esta corrección visual.

import { ref, onMounted, watch, computed } from 'vue';
import { Moon, Sparkles, BookOpen, LogOut } from 'lucide-vue-next';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';
import api from '../api/api';
import axios from 'axios';

interface Dream {
  id: string;
  title: string;
  description: string;
  date: string;
  emotions?: string[];
  reflection?: string | null;
}

interface Profile {
  _id: string;
  nombre: string;
  bio?: string;
  avatarUrl?: string;
  stats?: {
    totalDreams?: number;
    lucidDreams?: number;
    currentStreak?: number;
  };
  commonThemes?: string[];
  recentDreams?: Dream[];
  dominantArchetype?: string | null;
}

const profile = ref<Profile | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);
const authStore = useAuthStore();
const router = useRouter();

const fetchProfile = async () => {
  isLoading.value = true;
  error.value = null;
  console.log("Attempting to fetch profile...");
  const token = authStore.token;
  if (!token) {
    error.value = "Not authenticated.";
    isLoading.value = false;
    console.error("Profile fetch failed: No token found.");
    return;
  }
  try {
    const response = await api.get<Profile>('/usuarios/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    profile.value = response.data;
    console.log("Profile data received:", profile.value);
  } catch (err: any) {
    console.error("⚠️ Error loading profile:", err);
     if (axios.isAxiosError(err)) {
        error.value = `Error (${err.response?.status || 'Network'}): ${err.response?.data?.error || err.message}`;
    } else {
        error.value = `Unexpected error fetching profile: ${err.message}`;
    }
    profile.value = null;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (authStore.token) {
     fetchProfile();
  } else {
      isLoading.value = false;
      console.log("No token on mount, profile not fetched.");
  }
});

const logout = () => {
  console.log("Logging out...");
  authStore.logout();
  profile.value = null;
  router.push('/login');
};

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '';
  try {
    return new Date(dateString).toLocaleDateString('en-US', { // Cambiado a en-US como ejemplo
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch (e) { return dateString; }
};

const expandDream = (dreamId: string | undefined) => {
  if (!dreamId) return;
  console.log("Expandir/Ver detalle del sueño con ID:", dreamId);
  // router.push(`/journal/${dreamId}`); // Ejemplo de navegación
};

</script>