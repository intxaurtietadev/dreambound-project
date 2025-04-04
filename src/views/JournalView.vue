<template>
  <div class="max-w-3xl mx-auto">
    <div class="mystical-card rounded-lg p-8 space-y-8"> {/* Añadido space-y-8 para espaciado general */}
      <DreamJournal
        v-model="dream"
        @submit="handleSubmit"
        :interpretation="interpretation"
      />

      <div v-if="isLoading" class="text-center text-purple-400 animate-pulse">
        Consultando los reinos oníricos... ✨
      </div>

      <div v-if="error" class="p-4 bg-red-900 bg-opacity-40 border border-red-700 rounded text-red-300">
        <p><strong class="font-semibold">Error:</strong> {{ error }}</p>
      </div>

      <div v-if="interpretation && !isLoading && !error" class="space-y-6 border-t border-gray-700 pt-6">

        <div>
           <h3 class="text-xl font-semibold text-purple-300 uppercase tracking-wider mb-3">Interpretación Junguiana</h3>
           <p class="text-gray-300 whitespace-pre-wrap bg-gray-900 bg-opacity-30 p-4 rounded-md border border-gray-700">{{ interpretation }}</p>
        </div>

        <div v-if="foundArchetypes.length > 0">
          <h3 class="text-xl font-semibold text-cyan-300 uppercase tracking-wider mb-3">Arquetipos Posiblemente Relevantes</h3>
          <ul class="space-y-3">
            <li v-for="(arch, index) in foundArchetypes" :key="index" class="border-l-4 border-cyan-600 pl-4 py-1 bg-gray-900 bg-opacity-20 rounded-r-md">
              <strong class="text-cyan-200">{{ arch.archetype }}</strong>
              <span class="text-xs text-gray-400 ml-2">(Relevancia: {{ arch.score.toFixed(2) }})</span>
              <p class="text-gray-400 text-sm mt-1 italic">{{ arch.description }}</p>
            </li>
          </ul>
           <p class="text-xs text-gray-500 italic mt-3">Nota: La relevancia se basa en la similitud semántica entre el arquetipo y el texto de tu sueño.</p>
        </div>
        </div>

      <div v-if="interpretation && !isLoading && !error" class="border-t border-gray-700 pt-6">
        <DreamReflection
          :interpretation="interpretation"
          :reflection="reflection"
          @save-reflection="saveReflection"
        />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// *** NUEVO: Importar axios directamente ***
import axios from 'axios';
import DreamJournal from '../components/DreamJournal.vue';
import DreamReflection from '../components/DreamReflection.vue';
import api from '../api/api'; // Tu instancia configurada de Axios
import { useAuthStore } from '../stores/auth';

// --- Estado Reactivo ---
const dream = ref('');
const reflection = ref('');
const interpretation = ref<string | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

interface FoundArchetype {
  archetype: string;
  description: string;
  score: number;
}
const foundArchetypes = ref<FoundArchetype[]>([]);

const authStore = useAuthStore();
// *** COMPROBACIÓN/ASIGNACIÓN userId ***
// Obtenemos userId, pero lo comprobaremos antes de usarlo en llamadas críticas
const userId = authStore.userId;

const dreamId = ref<string | null>(null); // Para guardar/actualizar reflexión

// --- Manejador del Envío ---
const handleSubmit = async () => {
  isLoading.value = true;
  error.value = null;
  interpretation.value = null;
  foundArchetypes.value = [];
  dreamId.value = null;

  const token = localStorage.getItem("token");
  // *** Comprobación userId (ejemplo de dónde iría si fuera crítico AHORA) ***
  // const currentUserId = authStore.userId; // Podrías obtenerlo aquí dentro también
  // if (!currentUserId) {
  //   error.value = "Error: ID de usuario no encontrado.";
  //   isLoading.value = false;
  //   return;
  // }


  if (!token) {
    error.value = "No autenticado. Por favor, inicia sesión.";
    isLoading.value = false;
    return;
  }

  if (!dream.value.trim()) {
     error.value = "Por favor, describe tu sueño.";
     isLoading.value = false;
     return;
  }

  try {
    // 1. Obtener Interpretación y Arquetipos
    console.log("Enviando sueño para interpretar...");
    const response = await api.post(
      '/jungian/interpret-dream', // Asegúrate que esta URL esté corregida
      { dreamText: dream.value },
      {
        headers: { "Authorization": `Bearer ${token}` }
      }
    );
    console.log("Respuesta de interpretación recibida:", response.data);

    if (!response.data || typeof response.data.interpretation === 'undefined') {
         throw new Error("Respuesta inválida del servicio de interpretación.");
    }
    interpretation.value = response.data.interpretation;
    foundArchetypes.value = Array.isArray(response.data.archetypes) ? response.data.archetypes : [];


    // 2. Guardar el Sueño Original en el Backend (Lógica separada y necesita revisión)
    //    (Asegúrate de que 'userId' no sea null antes de hacer esta llamada si la reactivas)
    if (!userId) {
      console.warn("No se pudo guardar el sueño porque falta userId");
      // Opcionalmente, podrías poner un error aquí si guardar es obligatorio
      // throw new Error("Falta ID de usuario para guardar el sueño.");
    } else {
      console.log("Intentando guardar el sueño...");
      const nuevoSueno = {
        title: dream.value.substring(0, 50) + (dream.value.length > 50 ? '...' : ''),
        description: dream.value,
        date: new Date().toISOString(),
        emotions: [],
        interpretation: interpretation.value,
        archetypesFound: foundArchetypes.value.map(a => a.archetype)
      };

      // Usar la ruta correcta y la instancia 'api'
      const saveResponse = await api.post(`/usuarios/me/dreams`, nuevoSueno, {
         headers: { "Authorization": `Bearer ${token}` }
      });

      if (!saveResponse.data) {
        throw new Error("Error al guardar el sueño en el backend.");
      }
      console.log("🌙 Sueño interpretado y guardado correctamente.");
      // Aquí podrías guardar el ID si el backend lo devuelve:
      // dreamId.value = saveResponse.data?._id || null;
    }


  } catch (err: any) {
    console.error("💥 Error en handleSubmit:", err);
    // *** CORREGIDO: Ahora 'axios.isAxiosError' debería funcionar ***
    if (axios.isAxiosError(err)) {
        error.value = `Error (${err.response?.status || 'Network'}): ${err.response?.data?.error || err.message}`;
    } else {
        error.value = `Error inesperado: ${err.message}`;
    }
  } finally {
    isLoading.value = false;
  }
};

// --- Guardar Reflexión --- (Necesita revisión de endpoint)
const saveReflection = async (newReflection: string) => {
   // ... (lógica similar, asegurándose de tener userId y dreamId válidos antes de llamar a la API) ...
  console.log("Guardar reflexión - Lógica pendiente de implementar correctamente con backend");
};
</script>