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
              >
                <input 
                  type="radio" 
                  :name="'question-' + currentQuestionIndex"
                  :value="option.archetype"
                  v-model="answers[currentQuestionIndex]"
                  class="hidden"
                >
                <div 
                  class="w-4 h-4 rounded-full border-2 border-gray-600"
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
            <button 
              v-if="currentQuestionIndex < questions.length - 1 && answers[currentQuestionIndex]"
              @click="currentQuestionIndex++"
              class="mystical-button px-6 py-2 rounded-lg text-white uppercase tracking-widest text-sm flex items-center gap-2 ml-auto"
            >
              Next
              <ArrowRight class="w-4 h-4" />
            </button>
            <button 
              v-if="currentQuestionIndex === questions.length - 1 && answers[currentQuestionIndex]"
              @click="calculateResult"
              class="mystical-button px-6 py-2 rounded-lg text-white uppercase tracking-widest text-sm flex items-center gap-2 ml-auto"
            >
              <Sparkles class="w-4 h-4" />
              Reveal Your Archetype
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
                  answers[index] ? 'ring-2 ring-gray-500 ring-offset-2 ring-offset-black' : ''
                ]"
              ></div>
            </div>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="text-center mb-8">
          <component :is="getArchetypeIcon(result)" class="w-16 h-16 text-white mx-auto mb-4" />
          <h2 class="text-3xl text-white mb-4 uppercase tracking-widest">Your Archetype:</h2>
          <h3 class="text-2xl text-white mb-6">{{ result }}</h3>
        </div>

        <div class="mystical-card rounded-lg p-6 mb-8">
          <h4 class="text-xl text-white mb-4 uppercase tracking-wider">Your Archetype's Characteristics</h4>
          <p class="text-gray-300 mb-6">{{ getArchetypeDescription(result) }}</p>
          <div class="space-y-4">
            <div v-for="(trait, index) in getArchetypeTraits(result)" :key="index" class="flex items-center gap-3">
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
import { ref } from 'vue';
import { 
  ArrowLeft, ArrowRight, Sparkles, Star, RefreshCw, Book,
  Crown, Wand, Heart, Eye, Sword, Feather, Flame, Sun, Moon
} from 'lucide-vue-next';

interface Question {
  question: string;
  options: Array<{
    text: string;
    archetype: string;
  }>;
}

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
      { text: "I use humor to diffuse tension", archetype: "The Jester" }
    ]
  },
  {
    question: "What is your approach to change?",
    options: [
      { text: "I embrace change and adapt quickly", archetype: "The Magician" },
      { text: "I resist change and prefer stability", archetype: "The Sovereign" },
      { text: "I see change as an opportunity for growth", archetype: "The Creator" },
      { text: "I challenge the status quo and seek revolution", archetype: "The Rebel" }
    ]
  }
];

const currentQuestionIndex = ref(0);
const answers = ref<string[]>([]);
const result = ref<string | null>(null);

const calculateResult = () => {
  const counts: Record<string, number> = {};
  answers.value.forEach(answer => {
    counts[answer] = (counts[answer] || 0) + 1;
  });
  
  const sortedArchetypes = Object.entries(counts)
    .sort(([,a], [,b]) => b - a);
  
  result.value = sortedArchetypes[0][0];
};

const resetTest = () => {
  currentQuestionIndex.value = 0;
  answers.value = [];
  result.value = null;
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
    'The Shadow': Star,
    'The Innocent': Sun,
    'The Rebel': Moon
  };
  return icons[archetype];
};

const getArchetypeDescription = (archetype: string): string => {
  const descriptions: Record<string, string> = {
    'The Sovereign': 'You are a natural leader with the ability to create order and inspire others. You have a strong sense of responsibility and wisdom in decision-making.',
    'The Magician': 'You are a transformer who understands the deeper patterns of reality. You have the power to manifest change through wisdom and insight.',
    'The Lover': 'You have a deep capacity for emotional connection and appreciation of beauty. You seek meaningful relationships and experiences.',
    'The Sage': 'You are driven by the pursuit of truth and understanding. You have the ability to see clearly and share wisdom with others.',
    'The Warrior': 'You embody courage and the fight for what is right. You have strong protective instincts and a disciplined approach to challenges.',
    'The Creator': 'You are innovative and imaginative, with the ability to bring new ideas into reality. You express yourself through creative endeavors.',
    'The Jester': 'You are the playful spirit who brings joy and laughter. You see the world through a lens of comedy, often showing others the truth in a lighthearted way.',
    'The Shadow': 'You represent the hidden parts of ourselves that we reject or repress. These aspects often manifest as unconscious traits or behaviors that emerge when we are under stress.',
    'The Innocent': 'You are the pure and optimistic spirit, untouched by the world. You see the world as a place of potential and goodness, and you approach life with an untainted perspective.',
    'The Rebel': 'You are the non-conformist who challenges the status quo. You are often dissatisfied with the established order and strive to create a new path.'
  };
  return descriptions[archetype];
};

const getArchetypeTraits = (archetype: string): string[] => {
  const traits: Record<string, string[]> = {
    'The Sovereign': ['Natural leadership', 'Wisdom in decision-making', 'Creating order from chaos', 'Inspiring others'],
    'The Magician': ['Understanding patterns', 'Transformative power', 'Bridge between worlds', 'Manifestation abilities'],
    'The Lover': ['Deep emotional connection', 'Appreciation of beauty', 'Passionate expression', 'Seeking meaningful relationships'],
    'The Sage': ['Pursuit of truth', 'Clear vision', 'Sharing wisdom', 'Objective understanding'],
    'The Warrior': ['Courage in action', 'Protection of others', 'Disciplined approach', 'Fighting for justice'],
    'The Creator': ['Innovation', 'Artistic expression', 'Bringing ideas to life', 'Original thinking'],
    'The Jester': ['Humor', 'Playfulness', 'Joy', 'Sharp wit'],
    'The Shadow': ['Repression', 'Denial', 'Unconscious', 'Projection onto others'],
    'The Innocent': ['Purity', 'Trust', 'Optimism', 'Idealistic view of the world'],
    'The Rebel': ['Rebellion', 'Non-conformity', 'Independence', 'Desire for change']
  };
  return traits[archetype];
};
</script>