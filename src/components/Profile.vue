
<template>
  <div class="max-w-4xl mx-auto">
    <div class="mystical-card rounded-lg p-8 mb-8">
      <div class="flex items-center gap-8 mb-12">
        <div class="relative w-32 h-32 rounded-full overflow-hidden mystical-card">
          <img 
            :src="profile.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256'" 
            alt="Profile"
            class="w-full h-full object-cover"
          />
        </div>
        <div>
          <h2 class="text-2xl text-white mb-2 uppercase tracking-widest">{{ profile.name }}</h2>
          <p class="text-gray-400 tracking-wide">{{ profile.bio }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="mystical-card rounded-lg p-6">
          <h3 class="text-xl text-white mb-4 uppercase tracking-widest flex items-center gap-2">
            <Moon class="w-5 h-5 text-gray-400" />
            Dream Stats
          </h3>
          <div class="space-y-4">
            <div class="flex justify-between items-center text-gray-300">
              <span>Total Dreams</span>
              <span class="text-2xl">{{ profile.stats.totalDreams }}</span>
            </div>
            <div class="flex justify-between items-center text-gray-300">
              <span>Lucid Dreams</span>
              <span class="text-2xl">{{ profile.stats.lucidDreams }}</span>
            </div>
            <div class="flex justify-between items-center text-gray-300">
              <span>Dream Streak</span>
              <span class="text-2xl">{{ profile.stats.currentStreak }} days</span>
            </div>
          </div>
        </div>

        <div class="mystical-card rounded-lg p-6">
          <h3 class="text-xl text-white mb-4 uppercase tracking-widest flex items-center gap-2">
            <Sparkles class="w-5 h-5 text-gray-400" />
            Common Themes
          </h3>
          <div class="flex flex-wrap gap-2">
            <span 
              v-for="theme in profile.commonThemes" 
              :key="theme"
              class="px-3 py-1 rounded-full text-sm mystical-button"
            >
              {{ theme }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div class="mystical-card rounded-lg p-8">
      <h3 class="text-xl text-white mb-6 uppercase tracking-widest flex items-center gap-2">
        <BookOpen class="w-5 h-5 text-gray-400" />
        Recent Dreams
      </h3>
      <div class="space-y-6">
        <div 
          v-for="dream in profile.recentDreams" 
          :key="dream.id"
          class="mystical-card rounded-lg p-6 hover:border-gray-600 transition-colors cursor-pointer"
        >
          <div class="flex justify-between items-start mb-4">
            <h4 class="text-lg text-white">{{ dream.title }}</h4>
            <span class="text-sm text-gray-400">{{ dream.date }}</span>
          </div>
          <p class="text-gray-300 line-clamp-3">{{ dream.description }}</p>
          <div class="flex gap-2 mt-4">
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Moon, Sparkles, BookOpen } from 'lucide-vue-next';

interface Dream {
  id: string;
  title: string;
  description: string;
  date: string;
  emotions: string[];
}

interface Profile {
  name: string;
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

// Mock data - replace with actual data from your state management
const profile = ref<Profile>({
  name: 'Luna Dreamweaver',
  bio: 'Exploring the depths of consciousness through dream journaling and spiritual practice',
  avatarUrl: '',
  stats: {
    totalDreams: 42,
    lucidDreams: 7,
    currentStreak: 12
  },
  commonThemes: [
    'Flying',
    'Water',
    'Ancient Temples',
    'Celestial Bodies',
    'Transformation',
    'Nature'
  ],
  recentDreams: [
    {
      id: '1',
      title: 'Flight Through the Aurora',
      description: 'Soaring through iridescent northern lights, feeling weightless and connected to the cosmos. The colors shifted between deep purples and ethereal greens.',
      date: '2024-03-15',
      emotions: ['peaceful', 'awe', 'freedom']
    },
    {
      id: '2',
      title: 'The Ancient Library',
      description: 'Wandering through endless shelves of luminous books in a temple-like library. Each book contained memories of past lives.',
      date: '2024-03-14',
      emotions: ['curious', 'mystical', 'wisdom']
    },
    {
      id: '3',
      title: 'Ocean of Stars',
      description: 'Swimming in an ocean where the water was made of liquid starlight. Each movement created ripples of constellations.',
      date: '2024-03-13',
      emotions: ['wonder', 'serenity', 'connection']
    }
  ]
});
</script>
