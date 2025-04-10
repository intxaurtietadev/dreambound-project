<template>
  <div class="mystical-card rounded-lg p-8">
    <h3 class="text-xl text-white mb-6 uppercase tracking-widest text-sm flex items-center gap-3">
      <Heart class="text-gray-400 w-4 h-4" /> 
      Reflection
    </h3>
    <div class="space-y-6">
      <p class="text-gray-400">Consider these aspects of your dream:</p>
      <ul class="space-y-4 text-gray-300">
        <li class="flex items-center gap-3">
          <span class="w-1 h-1 bg-gray-500 rounded-full"></span>
          What emotions surfaced during this dream?
        </li>
        <li class="flex items-center gap-3">
          <span class="w-1 h-1 bg-gray-500 rounded-full"></span>
          How do these symbols connect to your current path?
        </li>
        <li class="flex items-center gap-3">
          <span class="w-1 h-1 bg-gray-500 rounded-full"></span>
          What message is your subconscious revealing?
        </li>
      </ul>

      <textarea
        v-model="localReflection"
        class="dream-input w-full h-48 p-6 rounded-lg bg-opacity-10 border border-gray-800
        text-white focus:outline-none focus:border-gray-600 transition-all"
        placeholder="Write your personal reflection..."
      />

      <button
        @click="$emit('save-reflection', localReflection)"
        class="mystical-button mt-4 py-3 px-6 rounded-lg text-white uppercase tracking-widest
        text-sm flex items-center justify-center gap-3"
      >
        <Heart class="w-4 h-4" />
        Save Reflection
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Heart } from 'lucide-vue-next';
const props = defineProps<{ interpretation: string | null; reflection: string }>();
const emits = defineEmits(['save-reflection']); // Definimos el emit

const localReflection = ref(props.reflection);

watch(() => props.reflection, (val) => {
  localReflection.value = val;
});

</script>