<template>
    <div class="max-w-4xl mx-auto">
      <div class="mystical-card rounded-lg p-8">
        <h2 class="text-2xl text-white mb-6 uppercase tracking-widest flex items-center gap-3">
          <Moon class="w-6 h-6 text-gray-400" />
          Dream Astral Map
        </h2>
        <p class="text-gray-400 mb-8 tracking-wide">
          Your personal dream universe, where each constellation represents recurring themes and symbols in your dream journal.
        </p>
  
        <!-- Cosmic Map Container -->
        <div class="relative w-full aspect-square rounded-full mystical-card p-1 mb-8">
          <div class="absolute inset-0 rounded-full starry-bg"></div>
  
          <!-- Dream Constellations -->
          <div class="relative w-full h-full">
            <template v-for="(constellation, index) in dreamConstellations" :key="index">
              <div 
                class="absolute constellation-point"
                :style="{
                  left: `${constellation.position.x}%`,
                  top: `${constellation.position.y}%`,
                  '--size': `${constellation.size}px`,
                  '--glow-color': constellation.color,
                  opacity: selectedConstellation && selectedConstellation !== constellation ? 0.3 : 1,
                  zIndex: selectedConstellation === constellation ? 10 : 1
                }"
                @mouseenter="activeConstellation = constellation"
                @mouseleave="activeConstellation = null"
                @click="toggleSelectedConstellation(constellation)"
              >
                <div 
                  class="constellation-star" 
                  :class="{ 'selected-glow': selectedConstellation === constellation }"
                ></div>
                <div 
                  class="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 
                  whitespace-nowrap text-sm text-gray-400 opacity-0 transition-opacity duration-300"
                  :class="{ 'opacity-100': activeConstellation === constellation || selectedConstellation === constellation }"
                >
                  {{ constellation.theme }}
                </div>
              </div>
            </template>
  
            <!-- Constellation Lines -->

<svg class="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" style="pointer-events: none;">
  <template v-for="(line, index) in constellationLines" :key="'line-' + index">
    <line
      :x1="line.start.x"
      :y1="line.start.y"
      :x2="line.end.x"
      :y2="line.end.y"
      class="constellation-line"
      :style="{ '--line-color': line.color }"
    />
  </template>
</svg>

          </div>
        </div>
  
        <!-- Legend -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="mystical-card rounded-lg p-6">
            <h3 class="text-white mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
              <Star class="w-4 h-4 text-gray-400" />
              Dream Themes
            </h3>
            <div class="space-y-3">
              <div 
                v-for="constellation in dreamConstellations" 
                :key="constellation.theme"
                class="flex items-center gap-3"
              >
                <div 
                  class="w-3 h-3 rounded-full"
                  :style="{ backgroundColor: constellation.color }"
                ></div>
                <span class="text-gray-300">{{ constellation.theme }}</span>
                <span class="text-gray-500 text-sm">{{ constellation.frequency }} dreams</span>
              </div>
            </div>
          </div>
  
          <div class="mystical-card rounded-lg p-6">
            <h3 class="text-white mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
              <Sparkles class="w-4 h-4 text-gray-400" />
              Insights
            </h3>
            <div class="space-y-3 text-gray-300">
              <p>Most frequent theme: <span class="text-white">{{ mostFrequentTheme }}</span></p>
              <p>Connected themes: {{ connectedThemes.join(', ') }}</p>
              <p>Recent patterns: {{ recentPatterns }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  import { Moon, Star, Sparkles } from 'lucide-vue-next';
  
  interface Constellation {
    theme: string;
    frequency: number;
    color: string;
    position: {
      x: number;
      y: number;
    };
    size: number;
  }
  
  interface ConstellationLine {
    start: {
      x: number;
      y: number;
    };
    end: {
      x: number;
      y: number;
    };
    color: string;
  }
  
  const dreamConstellations = ref<Constellation[]>([
    {
      theme: 'Flying',
      frequency: 12,
      color: '#64B5F6',
      position: { x: 30, y: 25 },
      size: 16
    },
    {
      theme: 'Water',
      frequency: 8,
      color: '#4DD0E1',
      position: { x: 70, y: 35 },
      size: 14
    },
    {
      theme: 'Ancient Temples',
      frequency: 6,
      color: '#FFB74D',
      position: { x: 45, y: 60 },
      size: 12
    },
    {
      theme: 'Celestial Bodies',
      frequency: 15,
      color: '#9575CD',
      position: { x: 80, y: 70 },
      size: 18
    },
    {
      theme: 'Transformation',
      frequency: 10,
      color: '#F06292',
      position: { x: 20, y: 75 },
      size: 15
    }
  ]);
  
  const constellationLines = ref<ConstellationLine[]>([
    {
      start: { x: 30, y: 25 },
      end: { x: 70, y: 35 },
      color: '#4FC3F7'
    },
    {
      start: { x: 70, y: 35 },
      end: { x: 45, y: 60 },
      color: '#4FC3F7'
    },
    {
      start: { x: 45, y: 60 },
      end: { x: 80, y: 70 },
      color: '#4FC3F7'
    },
    {
      start: { x: 20, y: 75 },
      end: { x: 45, y: 60 },
      color: '#4FC3F7'
    }
  ]);
  
  const activeConstellation = ref<Constellation | null>(null);
  const selectedConstellation = ref<Constellation | null>(null);
  
  const toggleSelectedConstellation = (constellation: Constellation) => {
    if (selectedConstellation.value === constellation) {
      selectedConstellation.value = null;
    } else {
      selectedConstellation.value = constellation;
    }
  };
  
  const mostFrequentTheme = computed(() => {
    const sorted = [...dreamConstellations.value].sort((a, b) => b.frequency - a.frequency);
    return sorted[0].theme;
  });
  
  const connectedThemes = computed(() => {
    return ['Flying & Water', 'Temples & Celestial Bodies', 'Transformation & Ancient Wisdom'];
  });
  
  const recentPatterns = computed(() => {
    return 'Increasing frequency of celestial and transformative dreams';
  });
  </script>
  
  <style scoped>
  .constellation-point {
    position: absolute;
    transform: translate(-50%, -50%);
    cursor: pointer;
    transition: opacity 0.3s ease;
  }
  
  .constellation-star {
    width: var(--size);
    height: var(--size);
    background: var(--glow-color);
    border-radius: 50%;
    box-shadow: 0 0 20px var(--glow-color);
    animation: pulse 2s infinite;
  }
  
  .constellation-star.selected-glow {
    animation: pulse-strong 1.5s infinite;
    box-shadow: 0 0 30px 10px var(--glow-color);
  }
  
  .constellation-line {
    stroke: var(--line-color);
    stroke-width: 0.1; /* más fino que 1 */
    opacity: 0.2;
  }
  
  @keyframes pulse {
    0% {
      transform: scale(1);
      opacity: 0.8;
    }
    50% {
      transform: scale(1.2);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0.8;
    }
  }
  
  @keyframes pulse-strong {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.4);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
  </style>
  