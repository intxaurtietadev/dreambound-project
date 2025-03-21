<template>
  <form @submit.prevent="onSubmit" class="space-y-8">
    <div>
      <label for="dream" class="block text-xl text-white mb-4 uppercase tracking-widest text-sm">
        Record Your Dream
      </label>
      <p class="text-gray-400 mb-6 tracking-wide">
        Share the symbols, emotions, and narrative of your dream. The more detail you provide, 
        the deeper we can explore its meaning.
      </p>
      <textarea
        id="dream"
        v-model="localDream"
        class="dream-input w-full h-48 p-6 rounded-lg bg-opacity-10 border border-gray-800 
        text-white focus:outline-none focus:border-gray-600 transition-all"
        placeholder="Describe your dream in detail..."
      />
    </div>
    <button
      type="submit"
      class="mystical-button w-full py-4 px-6 rounded-lg text-white uppercase tracking-widest 
      text-sm flex items-center justify-center gap-3"
    >
      <Sparkles class="w-4 h-4" />
      Interpret Dream
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { Sparkles } from 'lucide-vue-next';

const props = defineProps<{ modelValue: string }>();
const emits = defineEmits(['update:modelValue', 'submit']);

const localDream = ref(props.modelValue);

watch(() => props.modelValue, (val) => {
  localDream.value = val;
});

watch(localDream, (val) => {
  emits('update:modelValue', val);
});

const onSubmit = () => {
  emits('submit');
};
</script>
