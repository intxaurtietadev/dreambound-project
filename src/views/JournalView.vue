<template>
  <div class="max-w-3xl mx-auto">
    <div class="mystical-card rounded-lg p-8 space-y-8">
      <DreamJournal
        v-model="dream"
        @submit="handleSubmit"
        :interpretation="null"
      />

      <div v-if="isLoading" class="text-center text-purple-400 animate-pulse pt-8">
        Consulting the oneiric realms... ✨ (This may take a bit with the AI)
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
          <p v-if="reflectionSuccessMessage" class="mt-4 text-sm text-green-400">{{ reflectionSuccessMessage }}</p>
          <p v-if="reflectionError" class="mt-4 text-sm text-red-400">Error saving reflection: {{ reflectionError }}</p>
        </div>

      </div>
    </Transition>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Moon, Heart } from 'lucide-vue-next';
import DreamJournal from '../components/DreamJournal.vue';
import DreamReflection from '../components/DreamReflection.vue';
import api from '../api/api';
import { useAuthStore } from '../stores/auth';
import { interpretDream as interpretDreamLocal } from '../utils/dreamInterpreter';
import axios from 'axios';

// --- Estado Reactivo ---
const dream = ref('');
const reflection = ref(''); // Este es el v-model que debería usar DreamReflection
const interpretation = ref<string | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null); // Error general o de guardado de sueño
const usedFallback = ref(false);
const reflectionSuccessMessage = ref<string | null>(null); // Mensaje éxito reflexión
const reflectionError = ref<string | null>(null); // Error específico reflexión

interface FoundArchetype {
  archetype: string;
  description: string;
  score: number;
}
const foundArchetypes = ref<FoundArchetype[]>([]);
const authStore = useAuthStore();
const userId = authStore.userId;
const dreamId = ref<string | null>(null); // <--- Guardaremos el ID del sueño aquí

// --- handleSubmit ---
const handleSubmit = async () => {
  // Resetear estado
  isLoading.value = true;
  error.value = null;
  reflection.value = ''; // Limpiar reflexión anterior
  reflectionSuccessMessage.value = null;
  reflectionError.value = null;
  interpretation.value = null;
  foundArchetypes.value = [];
  dreamId.value = null; // Limpiar ID de sueño anterior
  usedFallback.value = false;

  const token = authStore.token;

  if (!token || !userId) {
    error.value = "Not authenticated or missing User ID. Please log in.";
    isLoading.value = false;
    return;
  }
  if (!dream.value.trim()) {
     error.value = "Please describe your dream.";
     isLoading.value = false;
     return;
  }

  try {
    let interpretationResult: string | null = null;
    let archetypesResult: FoundArchetype[] = [];

    // ---- Llamada al Servicio de IA ----
    try {
      console.log("Enviando sueño para interpretar al servicio de IA (puerto 5001)...");
      const aiServiceUrl = 'http://localhost:5001/interpret-dream';
      const response = await fetch(aiServiceUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify({ dream_text: dream.value }),
      });

      if (!response.ok) {
        throw new Error(`AI service returned an error: ${response.status} ${response.statusText}`);
      }
      const aiData = await response.json();
      console.log("Respuesta de interpretación (IA) recibida:", aiData);
      if (!aiData || typeof aiData.interpretation !== 'string') {
           throw new Error("Invalid response from AI service.");
      }
      interpretationResult = aiData.interpretation;
      archetypesResult = Array.isArray(aiData.archetypes_found) ? aiData.archetypes_found : [];
      usedFallback.value = false;

    } catch (aiError: any) {
      // ---- Fallback al Intérprete Local ----
      console.error("⚠️ Error al llamar al servicio de IA, usando fallback local:", aiError);
      usedFallback.value = true;
      archetypesResult = [];
      interpretationResult = interpretDreamLocal(dream.value);
      console.log("Interpretación local (fallback) generada.");
    }

    interpretation.value = interpretationResult;
    foundArchetypes.value = archetypesResult;

    // ---- Intento de Guardar el Sueño en Backend Principal ----
    if (interpretation.value) {
        console.log("Intentando guardar el sueño en el backend principal (puerto 3000)...");
        const nuevoSueno = {
          title: dream.value.substring(0, 50) + (dream.value.length > 50 ? '...' : ''),
          description: dream.value,
          date: new Date().toISOString(),
          interpretation: interpretation.value,
          archetypesFound: usedFallback.value ? [] : foundArchetypes.value.map(a => ({ name: a.archetype, score: a.score })),
          reflection: null // Guardamos reflexión como null inicialmente
        };
        try {
            const saveResponse = await api.post(`/usuarios/me/dreams`, nuevoSueno, {
               headers: { "Authorization": `Bearer ${token}` }
            });
            console.log("Respuesta del guardado:", saveResponse.status, saveResponse.data);
            console.log("🌙 Sueño interpretado y guardado correctamente.");
            error.value = null;

            // ---- CAPTURAR EL ID DEL SUEÑO GUARDADO ----
            if (saveResponse.data && saveResponse.data.id) {
                dreamId.value = saveResponse.data.id; // Asumiendo que el backend devuelve el sueño con su 'id'
                console.log(`ID del sueño guardado: ${dreamId.value}`);
            } else {
                 console.warn("El backend no devolvió un ID para el sueño guardado.");
                 // Podrías poner un error si el ID es crucial para la reflexión
                 // error.value = "Error: No se recibió ID del sueño guardado.";
            }
            // -----------------------------------------

        } catch (saveError: any) {
            console.error("💥 Error al guardar el sueño en el backend principal:", saveError);
            if (axios.isAxiosError(saveError)) {
                error.value = `Failed to save dream (${saveError.response?.status || 'Network'}): ${saveError.response?.data?.error || saveError.message}`;
            } else {
                 error.value = `Failed to save dream: ${saveError.message}`;
            }
            interpretation.value = interpretationResult; // Mantener visible
            foundArchetypes.value = archetypesResult; // Mantener visible
            dreamId.value = null; // No tenemos ID si falló el guardado
        }
    }
  } catch (generalError: any) {
      console.error("💥 Error general en handleSubmit:", generalError);
      error.value = `Unexpected error: ${generalError.message}`;
      interpretation.value = null;
      foundArchetypes.value = [];
      usedFallback.value = false;
      dreamId.value = null;
  } finally {
    isLoading.value = false;
  }
};

// --- Guardar Reflexión (IMPLEMENTADO) ---
const saveReflection = async (newReflection: string) => {
  reflectionSuccessMessage.value = null; // Limpiar mensajes previos
  reflectionError.value = null;

  // Comprobaciones
  if (!userId) {
      reflectionError.value = "User not authenticated."; // Mensaje de error
      return;
  }
  if (!dreamId.value) {
    reflectionError.value = "Cannot save reflection, dream ID is missing. Please interpret and save the dream first."; // Mensaje de error
    console.error("Intento de guardar reflexión sin dreamId.");
    return;
  }
   if (typeof newReflection !== 'string') {
     reflectionError.value = "Reflection text is invalid."; // Mensaje de error
     return;
   }

  console.log(`Guardando reflexión para sueño ${dreamId.value}...`);
  const token = authStore.token; // Necesitamos el token también aquí

  try {
    // ---- LLAMADA A LA NUEVA RUTA PUT DEL BACKEND ----
    const response = await api.put(
      `/usuarios/me/dreams/${dreamId.value}/reflection`, // URL dinámica con dreamId
      { reflectionText: newReflection }, // Cuerpo de la petición con la reflexión
      { headers: { Authorization: `Bearer ${token}` } }  // Cabecera de autorización
    );
    // -------------------------------------------------

    console.log("Respuesta al guardar reflexión:", response.status, response.data);
    reflectionSuccessMessage.value = "Reflection saved successfully!"; // Mensaje de éxito

    // Actualizar el valor local de reflection si se guarda bien
    // (Opcional, depende de si quieres que se mantenga tras guardar o se limpie)
    // reflection.value = newReflection; // Podrías hacer esto o dejar que se limpie al reinterpretar

  } catch (err: any) {
    console.error("💥 Error al guardar la reflexión:", err);
     if (axios.isAxiosError(err)) {
        reflectionError.value = `Error (${err.response?.status || 'Network'}): ${err.response?.data?.error || err.message}`;
    } else {
        reflectionError.value = `Unexpected error saving reflection: ${err.message}`;
    }
  }
};

</script>