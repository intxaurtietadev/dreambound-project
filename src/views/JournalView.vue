<template>
  <div class="max-w-3xl mx-auto">
    <div class="mystical-card rounded-lg p-8 space-y-8">
      <DreamJournal
        v-model="dream"
        @submit="handleSubmit"
        :interpretation="null"
      />

      <div v-if="isLoading" class="text-center text-gray-400 animate-pulse pt-8">
        Consulting the oneiric realms... 
      </div>

      <div v-if="error" class="p-4 bg-red-900 bg-opacity-40 border border-red-700 rounded text-red-300 mt-8">
        <p><strong class="font-semibold">Error:</strong> {{ error }}</p>
      </div>
    </div> 

    <Transition name="fade">
      <div v-if="interpretation && !isLoading" class="mt-12 space-y-8">

        <div class="mystical-card rounded-lg p-8">
          <h3 class="text-xl text-white mb-6 uppercase tracking-widest text-sm flex items-center gap-3">
             <Moon class="text-gray-400 w-4 h-4" />
             Interpretation {{ usedFallback ? '(Basic)' : '(AI)' }}
           </h3>
           <div class="text-gray-300 leading-relaxed whitespace-pre-line">{{ interpretation }}</div>
           <p v-if="usedFallback" class="text-xs text-amber-400 italic mt-3">Note: AI service unavailable, showing basic interpretation.</p>
        </div>

        <div v-if="foundArchetypes.length > 0 && !usedFallback" class="mystical-card rounded-lg p-8">
           <h3 class="text-xl text-cyan-300 mb-6 uppercase tracking-widest text-sm flex items-center gap-3">
             Relevant Archetypes (AI)
           </h3>
           <ul class="space-y-3">
             <li v-for="(arch, index) in foundArchetypes" :key="index" class="border-l-4 border-cyan-600 pl-4 py-1">
               <strong class="text-cyan-200">{{ arch.archetype }}</strong>
               <span class="text-xs text-gray-400 ml-2">(Relevance: {{ arch.score.toFixed(2) }})</span>
               <p class="text-gray-400 text-sm mt-1 italic">{{ arch.description }}</p>
             </li>
           </ul>
           <p class="text-xs text-gray-500 italic mt-3">Note: Relevance is based on semantic similarity.</p>
        </div>

        <div class="mystical-card rounded-lg p-8">
           <h3 class="text-xl text-white mb-6 uppercase tracking-widest text-sm flex items-center gap-3">
             <Heart class="text-gray-400 w-4 h-4" />
             Personal Reflection
           </h3>
          <DreamReflection
            :interpretation="interpretation"
            :reflection="reflection"
            @save-reflection="saveReflection"
          />
        </div>

      </div>
    </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Moon, Sparkles, Heart } from 'lucide-vue-next';
import DreamJournal from '../components/DreamJournal.vue';
import DreamReflection from '../components/DreamReflection.vue';
import api from '../api/api';
import { useAuthStore } from '../stores/auth';
import { interpretDream as interpretDreamLocal } from '../utils/dreamInterpreter';
import axios from 'axios';

// --- Estado Reactivo ---
const dream = ref('');
const reflection = ref('');
const interpretation = ref<string | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null); // Errores para el usuario (en inglés)
const usedFallback = ref(false);

interface FoundArchetype {
  archetype: string;
  description: string;
  score: number;
}
const foundArchetypes = ref<FoundArchetype[]>([]);
const authStore = useAuthStore();
const userId = authStore.userId;
const dreamId = ref<string | null>(null);

// --- handleSubmit ---
const handleSubmit = async () => {
  isLoading.value = true;
  error.value = null;
  interpretation.value = null;
  foundArchetypes.value = [];
  dreamId.value = null;
  usedFallback.value = false;
  const token = authStore.token;

  // Validaciones iniciales 
  if (!token || !userId) {
    error.value = "Not authenticated or missing User ID. Please log in."; // <-- Inglés (Usuario)
    isLoading.value = false;
    return;
  }
  if (!dream.value.trim()) {
     error.value = "Please describe your dream."; // <-- Inglés (Usuario)
     isLoading.value = false;
     return;
  }

  try {
    let interpretationResult: string | null = null;
    let archetypesResult: FoundArchetype[] = [];

    try {
      console.log("Enviando sueño para interpretar al servicio de IA (puerto 5001)...");
      const aiServiceUrl = 'http://localhost:5001/interpret-dream';
      const response = await fetch(aiServiceUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ dream_text: dream.value }),
      });

      if (!response.ok) {
        throw new Error(`El servicio de IA devolvió un error: ${response.status} ${response.statusText}`);
      }
      const aiData = await response.json();

      console.log("Respuesta de interpretación (IA) recibida:", aiData);
      if (!aiData || typeof aiData.interpretation !== 'string') {
          throw new Error("Respuesta inválida del servicio de IA.");
      }
      interpretationResult = aiData.interpretation; // Interpretación en Inglés (de la IA)
      archetypesResult = Array.isArray(aiData.archetypes_found) ? aiData.archetypes_found : [];
      usedFallback.value = false;

    } catch (aiError: any) {
      console.error("⚠️ Error al llamar al servicio de IA, usando fallback local:", aiError);
      usedFallback.value = true;
      archetypesResult = [];
      interpretationResult = interpretDreamLocal(dream.value);
      console.log("Interpretación local (fallback) generada.");
    }

    interpretation.value = interpretationResult;
    foundArchetypes.value = archetypesResult;

    if (interpretation.value) {
        console.log("Intentando guardar el sueño en el backend principal (puerto 3000)...");
        const nuevoSueno = {
          title: dream.value.substring(0, 50) + (dream.value.length > 50 ? '...' : ''),
          description: dream.value,
          date: new Date().toISOString(),
          interpretation: interpretation.value,
          archetypesFound: usedFallback.value ? [] : foundArchetypes.value.map(a => ({ name: a.archetype, score: a.score })),
        };
        try {
            const saveResponse = await api.post(`/usuarios/me/dreams`, nuevoSueno, {
               headers: { "Authorization": `Bearer ${token}` }
            });
            console.log("Respuesta del guardado:", saveResponse.status, saveResponse.data);
            console.log("🌙 Sueño interpretado y guardado correctamente.");
            error.value = null;

        } catch (saveError: any) {
            console.error("💥 Error al guardar el sueño en el backend principal:", saveError);
            if (axios.isAxiosError(saveError)) {
                error.value = `Failed to save dream (${saveError.response?.status || 'Network'}): ${saveError.response?.data?.error || saveError.message}`;
            } else {
                 error.value = `Failed to save dream: ${saveError.message}`;
            }
            interpretation.value = interpretationResult;
            foundArchetypes.value = archetypesResult;
        }
    }
  } catch (generalError: any) {
      console.error("💥 Error general en handleSubmit:", generalError);
      error.value = `Unexpected error: ${generalError.message}`;
      interpretation.value = null;
      foundArchetypes.value = [];
      usedFallback.value = false;
  } finally {
    isLoading.value = false;
  }
};

// --- Guardar Reflexión ---
const saveReflection = async (newReflection: string) => {
  if (!userId || !dreamId.value) {
    console.error("Falta userId o dreamId para guardar la reflexión.");
    return;
  }
  console.log(`Guardando reflexión para sueño ${dreamId.value}: "${newReflection.substring(0,50)}..."`);
  // ... (Lógica API pendiente) ...
};

</script>