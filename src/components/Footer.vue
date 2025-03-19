<template>
  <footer class="border-t border-gray-800 py-12">
    <div class="container mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <div class="flex items-center gap-3 mb-6">
            <Moon class="text-gray-400" />
            <span class="text-white uppercase tracking-widest text-sm">Dreambound</span>
          </div>
          <p class="text-gray-400 tracking-wide">
            Explore the depths of your unconscious mind through dream journaling and Jungian archetype analysis.
          </p>
        </div>
        
        <div>
          <h3 class="text-white uppercase tracking-widest text-sm mb-6">Navigation</h3>
          <div class="space-y-4">
            <router-link 
              to="/" 
              class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <HomeIcon class="w-4 h-4" />
              <span>Home</span>
            </router-link>
            <router-link 
              to="/archetypes" 
              class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <BookOpen class="w-4 h-4" />
              <span>Archetypes</span>
            </router-link>
            <router-link 
              to="/journal" 
              class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <BookHeart class="w-4 h-4" />
              <span>Dream Journal</span>
            </router-link>
          </div>
        </div>

        <div>
          <h3 class="text-white uppercase tracking-widest text-sm mb-6">Resources</h3>
          <div class="space-y-4">
            <a 
              href="https://www.verywellmind.com/jungian-archetypes-2795439"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <BookOpen class="w-4 h-4" />
              <span>Learn About Archetypes</span>
            </a>
            <a 
              href="https://www.psychologytoday.com/us/basics/dreaming"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Moon class="w-4 h-4" />
              <span>Dream Psychology</span>
            </a>
            <router-link 
              to="/archetype-test" 
              class="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <Sparkles class="w-4 h-4" />
              <span>Take the Archetype Test</span>
            </router-link>
          </div>
        </div>
      </div>

      <div class="mt-12 pt-8 border-t border-gray-800">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-gray-400 text-sm">
            © {{ new Date().getFullYear() }} Dreambound. All rights reserved.
          </p>
          <div class="flex items-center gap-6">
            <a 
              href="#"
              class="text-gray-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="#"
              class="text-gray-400 hover:text-white transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { Moon, BookHeart, HomeIcon, BookOpen, Sparkles } from 'lucide-vue-next';
</script>