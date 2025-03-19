<template>
  <div class="max-w-3xl mx-auto">
    <div class="mystical-card rounded-lg p-8">
      <form @submit.prevent="handleSubmit" class="space-y-8">
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
            v-model="dream"
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

      <Transition name="fade">
        <div v-if="interpretation" class="mt-12 space-y-8">
          <div class="mystical-card rounded-lg p-8">
            <h3 class="text-xl text-white mb-6 uppercase tracking-widest text-sm flex items-center gap-3">
              <Moon class="text-gray-400" />
              Interpretation
            </h3>
            <div class="text-gray-300 leading-relaxed whitespace-pre-line">{{ interpretation }}</div>
          </div>
          
          <div class="mystical-card rounded-lg p-8">
            <h3 class="text-xl text-white mb-6 uppercase tracking-widest text-sm flex items-center gap-3">
              <Heart class="text-gray-400" />
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
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Moon, Sparkles, Heart } from 'lucide-vue-next';
import { analyzeDreamNarrative } from '../utils/dreamInterpreter';
import { useAuthStore } from '../stores/auth'; // Importa el store de autenticación

const dream = ref('');
const interpretation = ref<string | null>(null);

const authStore = useAuthStore(); // Obtén el store de autenticación
const userId = authStore.userId; // Obtén el userId del store

const handleSubmit = async () => {
  const analysis = analyzeDreamNarrative(dream.value);
  interpretation.value = analysis.interpretation;

  const nuevoSueno = {
    id: crypto.randomUUID(),
    title: "Untitled Dream",
    description: dream.value,
    date: new Date().toISOString().split('T')[0],
    emotions: analysis.emotions
  };

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`http://localhost:3000/usuarios/${userId}/dreams`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(nuevoSueno)
    });

    if (!response.ok) {
      throw new Error("Error al guardar el sueño");
    }

    console.log("🌙 Sueño interpretado y guardado correctamente");
  } catch (error) {
    console.error("💥 Error al guardar el sueño:", error);
  }
};
</script>