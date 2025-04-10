<template>
  <div class="max-w-3xl mx-auto">
    <div class="mystical-card rounded-lg p-8">
      <template v-if="!result">
        <div class="mb-8">
          <h2 class="text-2xl text-white mb-4 uppercase tracking-widest">Discover Your Archetype</h2>
          <p class="text-gray-400">Answer these questions honestly to reveal your dominant Jungian archetype.</p>
        </div>

        <div v-if="currentQuestionIndex < questions.length" class="space-y-8">
          <div class="mystical-card rounded-lg p-6">
            <h3 class="text-xl text-white mb-6">{{ questions[currentQuestionIndex].question }}</h3>
            <div class="space-y-4">
              <label
                v-for="(option, index) in questions[currentQuestionIndex].options"
                :key="index"
                class="flex items-center space-x-3 p-4 mystical-card rounded-lg cursor-pointer hover:border-gray-600 transition-all"
                :class="{ 'ring-2 ring-white': answers[currentQuestionIndex] === option.archetype }"
              >
                <input
                  type="radio"
                  :name="'question-' + currentQuestionIndex"
                  :value="option.archetype"
                  v-model="answers[currentQuestionIndex]"
                  class="hidden"
                >
                <div
                  class="w-4 h-4 rounded-full border-2 border-gray-600 flex-shrink-0" 
                  :class="{ 'bg-white border-white': answers[currentQuestionIndex] === option.archetype }"
                ></div>
                <span class="text-gray-300">{{ option.text }}</span>
              </label>
            </div>
          </div>

          <div class="flex justify-between items-center">
            <button
              v-if="currentQuestionIndex > 0"
              @click="currentQuestionIndex--"
              class="mystical-button px-6 py-2 rounded-lg text-white uppercase tracking-widest text-sm flex items-center gap-2"
            >
              <ArrowLeft class="w-4 h-4" />
              Previous
            </button>
            <span v-else></span> 

            <button
              v-if="currentQuestionIndex < questions.length - 1 && answers[currentQuestionIndex]"
              @click="currentQuestionIndex++"
              class="mystical-button px-6 py-2 rounded-lg text-white uppercase tracking-widest text-sm flex items-center gap-2"
            >
              Next
              <ArrowRight class="w-4 h-4" />
            </button>

            <button
              v-if="currentQuestionIndex === questions.length - 1 && answers[currentQuestionIndex]"
              @click="calculateResult"
              class="mystical-button px-6 py-2 rounded-lg text-white uppercase tracking-widest text-sm flex items-center gap-2"
              :disabled="isSavingResult" 
            >
              <Sparkles v-if="!isSavingResult" class="w-4 h-4" />
              <span v-else class="animate-spin w-4 h-4 border-2 border-t-transparent border-white rounded-full"></span> 
              {{ isSavingResult ? 'Saving...' : 'Reveal Your Archetype' }}
            </button>
          </div>


          <div class="flex justify-center">
            <div class="flex gap-2">
              <div
                v-for="(_, index) in questions"
                :key="index"
                class="w-2 h-2 rounded-full"
                :class="[
                  currentQuestionIndex === index ? 'bg-white' : 'bg-gray-600',
                  answers[index] ? 'ring-1 ring-gray-500 ring-offset-1 ring-offset-black' : ''
                ]"
              ></div>
            </div>
          </div>
        </div>
         <p v-if="saveError" class="text-red-400 text-center mt-4">Error saving archetype: {{ saveError }}</p>
      </template>

      <template v-else>
        <div class="text-center mb-8">
          <component :is="getArchetypeIcon(result!)" class="w-16 h-16 text-white mx-auto mb-4" />
          <h2 class="text-3xl text-white mb-4 uppercase tracking-widest">Your Archetype:</h2>
          <h3 class="text-2xl text-white mb-6">{{ result }}</h3>
        </div>

        <div class="mystical-card rounded-lg p-6 mb-8">
          <h4 class="text-xl text-white mb-4 uppercase tracking-wider">Characteristics</h4>
          <p class="text-gray-300 mb-6">{{ getArchetypeDescription(result!) }}</p>
          <div class="space-y-4">
            <div v-for="(trait, index) in getArchetypeTraits(result!)" :key="index" class="flex items-center gap-3">
              <Star class="w-4 h-4 text-gray-400" />
              <span class="text-gray-300">{{ trait }}</span>
            </div>
          </div>
        </div>

        <div class="flex justify-center gap-4">
          <button
            @click="resetTest"
            class="mystical-button px-6 py-2 rounded-lg text-white uppercase tracking-widest text-sm flex items-center gap-2"
          >
            <RefreshCw class="w-4 h-4" />
            Retake Test
          </button>
          <router-link
            to="/archetypes"
            class="mystical-button px-6 py-2 rounded-lg text-white uppercase tracking-widest text-sm flex items-center gap-2"
          >
            <Book class="w-4 h-4" />
            View All Archetypes
          </router-link>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'; // Import computed si no estaba
import {
  ArrowLeft, ArrowRight, Sparkles, Star, RefreshCw, Book,
  Crown, Wand, Heart, Eye, Sword, Feather, Flame, Sun, Moon
} from 'lucide-vue-next';
// ---- NUEVOS IMPORTS ----
import { useAuthStore } from '../stores/auth';
import api from '../api/api'; // Nuestra instancia de Axios
import axios from 'axios'; // Para isAxiosError
// -----------------------

interface Question {
  question: string;
  options: Array<{
    text: string;
    archetype: string;
  }>;
}

// --- Preguntas y Descripciones (Sin cambios, traducidos al inglés) ---
const questions: Question[] = [
  {
    question: "When faced with a challenge, what is your first instinct?",
    options: [
      { text: "Analyze and strategize the best approach", archetype: "The Sage" },
      { text: "Take immediate action to protect others", archetype: "The Warrior" },
      { text: "Find an innovative solution", archetype: "The Creator" },
      { text: "Seek to understand the deeper meaning", archetype: "The Magician" }
    ]
  },
   {
    question: "What drives you most in life?",
    options: [
      { text: "The pursuit of knowledge and wisdom", archetype: "The Sage" },
      { text: "Creating order and helping others", archetype: "The Sovereign" },
      { text: "Expressing yourself and creating beauty", archetype: "The Creator" },
      { text: "Building meaningful connections", archetype: "The Lover" }
    ]
  },
   {
    question: "How do others typically see you?",
    options: [
      { text: "As a natural leader and guide", archetype: "The Sovereign" },
      { text: "As a wise advisor and teacher", archetype: "The Sage" },
      { text: "As a passionate and inspiring person", archetype: "The Lover" },
      { text: "As a protective and brave individual", archetype: "The Warrior" }
    ]
  },
   {
    question: "What kind of environment do you thrive in?",
    options: [
      { text: "One that allows for deep contemplation", archetype: "The Sage" },
      { text: "One that presents challenges to overcome", archetype: "The Warrior" },
      { text: "One that fosters creativity and expression", archetype: "The Creator" },
      { text: "One that enables meaningful connections", archetype: "The Lover" }
    ]
  },
  {
    question: "What is your greatest strength?",
    options: [
      { text: "Your ability to lead and inspire others", archetype: "The Sovereign" },
      { text: "Your creativity and innovative thinking", archetype: "The Creator" },
      { text: "Your wisdom and understanding", archetype: "The Magician" },
      { text: "Your courage and determination", archetype: "The Warrior" }
    ]
  },
  {
    question: "How do you handle conflict?",
    options: [
      { text: "I avoid conflict and seek harmony", archetype: "The Lover" },
      { text: "I confront it head-on with courage", archetype: "The Warrior" },
      { text: "I analyze the situation and find a logical solution", archetype: "The Sage" },
      { text: "I use humor to diffuse tension", archetype: "The Jester" } // Jester no estaba antes, añadido
    ]
  },
   {
    question: "What is your approach to change?",
    options: [
      { text: "I embrace change and adapt quickly", archetype: "The Magician" },
      { text: "I resist change and prefer stability", archetype: "The Sovereign" },
      { text: "I see change as an opportunity for growth", archetype: "The Creator" },
      // { text: "I challenge the status quo and seek revolution", archetype: "The Rebel" } // Rebel no estaba antes, añadido o revisar
       { text: "I question norms and seek alternative paths", archetype: "The Rebel" } // Opción alternativa
    ]
  }
];
// ... (resto de descripciones, traits, iconos igual, pero traducidos a inglés) ...
const getArchetypeDescription = (archetype: string): string => {
  const descriptions: Record<string, string> = {
    'The Sovereign': 'You are a natural leader with the ability to create order and inspire others. You have a strong sense of responsibility and wisdom in decision-making.',
    'The Magician': 'You are a transformer who understands the deeper patterns of reality. You have the power to manifest change through wisdom and insight.',
    'The Lover': 'You have a deep capacity for emotional connection and appreciation of beauty. You seek meaningful relationships and experiences.',
    'The Sage': 'You are driven by the pursuit of truth and understanding. You have the ability to see clearly and share wisdom with others.',
    'The Warrior': 'You embody courage and the fight for what is right. You have strong protective instincts and a disciplined approach to challenges.',
    'The Creator': 'You are innovative and imaginative, with the ability to bring new ideas into reality. You express yourself through creative endeavors.',
    'The Jester': 'You are the playful spirit who brings joy and laughter. You see the world through a lens of comedy, often showing others the truth in a lighthearted way.',
    'The Rebel': 'You challenge conventions and seek alternative paths. You question authority and value freedom and radical change.'
    // Añadir aquí las descripciones para otros arquetipos si los usas (Shadow, Innocent...)
  };
  return descriptions[archetype] || 'No description available.';
};
const getArchetypeTraits = (archetype: string): string[] => {
 const traits: Record<string, string[]> = {
    'The Sovereign': ['Natural leadership', 'Wisdom in decision-making', 'Creating order', 'Inspiring others'],
    'The Magician': ['Understanding patterns', 'Transformative power', 'Insightful', 'Manifestation'],
    'The Lover': ['Emotional connection', 'Appreciation of beauty', 'Passionate', 'Seeks relationships'],
    'The Sage': ['Pursuit of truth', 'Clear vision', 'Wisdom sharing', 'Objective understanding'],
    'The Warrior': ['Courage', 'Protection', 'Discipline', 'Fights for justice'],
    'The Creator': ['Innovation', 'Artistic expression', 'Imaginative', 'Original thinking'],
    'The Jester': ['Humor', 'Playfulness', 'Joyful', 'Witty'],
    'The Rebel': ['Challenges status quo', 'Values freedom', 'Non-conformist', 'Seeks change']
    // Añadir traits para otros arquetipos
  };
  return traits[archetype] || ['No specific traits listed.'];
};
const getArchetypeIcon = (archetype: string) => {
  const icons: Record<string, any> = {
    'The Sovereign': Crown,
    'The Magician': Wand,
    'The Lover': Heart,
    'The Sage': Eye,
    'The Warrior': Sword,
    'The Creator': Feather,
    'The Jester': Flame,
    'The Rebel': Moon // Asignado Rebel a Moon como ejemplo
    // Añadir iconos para otros
  };
  return icons[archetype] || Star; // Icono por defecto
};
// ---------------------------------------------------------------------

// --- Estado y Lógica del Test ---
const currentQuestionIndex = ref(0);
const answers = ref<string[]>([]); // Almacena el arquetipo ('The Sage', etc.) elegido para cada pregunta
const result = ref<string | null>(null); // Almacena el arquetipo dominante calculado
const isSavingResult = ref(false); // Estado para indicar si se está guardando
const saveError = ref<string | null>(null); // Mensaje de error si falla el guardado

// ---- INSTANCIA DEL STORE DE AUTENTICACIÓN ----
const authStore = useAuthStore();
// -------------------------------------------

// ---- FUNCIÓN calculateResult MODIFICADA ----
const calculateResult = async () => {
  saveError.value = null; // Limpiar error previo
  isSavingResult.value = true; // Indicar que estamos guardando

  // --- Cálculo del arquetipo (igual que antes) ---
  const counts: Record<string, number> = {};
  answers.value.forEach(answer => {
    if (answer) { // Asegurarse que hay una respuesta
        counts[answer] = (counts[answer] || 0) + 1;
    }
  });

  if (Object.keys(counts).length === 0) {
      console.warn("No answers provided to calculate result.");
      isSavingResult.value = false;
      // Quizás mostrar un error al usuario
      saveError.value = "Please answer at least one question.";
      return;
  }

  const sortedArchetypes = Object.entries(counts)
    .sort(([,a], [,b]) => b - a);

  const dominantArchetype = sortedArchetypes[0][0];
  result.value = dominantArchetype; // Mostrar resultado en UI inmediatamente
  console.log('Calculated Archetype:', dominantArchetype);
  // ---------------------------------------------

  // --- GUARDAR RESULTADO EN BACKEND ---
  const token = authStore.token;
  if (!token) {
    console.error('Cannot save archetype: User not authenticated.');
    saveError.value = 'You must be logged in to save the result.';
    isSavingResult.value = false;
    return; // No continuar si no hay token
  }

  try {
    console.log(`Attempting to save dominant archetype "${dominantArchetype}" to backend...`);
    // Usamos la ruta PUT /usuarios/me para actualizar el perfil
    await api.put(
      '/usuarios/me', // Endpoint para actualizar el usuario logueado
      { dominantArchetype: dominantArchetype }, // Enviamos solo el campo a actualizar
      { headers: { Authorization: `Bearer ${token}` } } // Enviamos el token
    );
    console.log('Dominant archetype saved successfully!');
    // Puedes mostrar un mensaje de éxito temporal si quieres

  } catch (err) {
    console.error('💥 Error saving dominant archetype:', err);
    if (axios.isAxiosError(err)) {
        saveError.value = `Error saving (${err.response?.status || 'Network'}): ${err.response?.data?.error || err.message}`;
    } else {
        saveError.value = `Unexpected error saving archetype: ${(err as Error).message}`;
    }
    // El resultado ya se muestra en la UI, pero el guardado falló.
  } finally {
    isSavingResult.value = false; // Terminar estado de guardado
  }
  // ----------------------------------
};
// -------------------------------------------

const resetTest = () => {
  currentQuestionIndex.value = 0;
  answers.value = [];
  result.value = null;
  saveError.value = null; // Limpiar error al reiniciar
};

</script>