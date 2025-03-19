<template>
    <div class="max-w-4xl mx-auto">
      <div class="mystical-card rounded-lg p-8 mb-8">
        <h2 class="text-2xl text-white mb-6 uppercase tracking-widest">Jungian Archetypes</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div 
            v-for="archetype in archetypes" 
            :key="archetype.name"
            class="mystical-card rounded-lg p-6 hover:border-gray-600 transition-all cursor-pointer"
            @click="selectedArchetype = archetype"
          >
            <div class="flex items-center gap-3 mb-4">
              <component :is="archetype.icon" class="w-6 h-6 text-gray-400" />
              <h3 class="text-xl text-white uppercase tracking-wider">{{ archetype.name }}</h3>
            </div>
            <p class="text-gray-400 mb-4">{{ archetype.shortDescription }}</p>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="trait in archetype.traits" 
                :key="trait"
                class="px-3 py-1 rounded-full text-sm mystical-button"
              >
                {{ trait }}
              </span>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Archetype Detail Modal -->
      <div v-if="selectedArchetype" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="mystical-card rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-start mb-6">
            <div class="flex items-center gap-3">
              <component :is="selectedArchetype.icon" class="w-8 h-8 text-gray-400" />
              <h3 class="text-2xl text-white uppercase tracking-wider">{{ selectedArchetype.name }}</h3>
            </div>
            <button @click="selectedArchetype = null" class="text-gray-400 hover:text-white">
              <X class="w-6 h-6" />
            </button>
          </div>
          <div class="space-y-6">
            <p class="text-gray-300">{{ selectedArchetype.description }}</p>
            <div>
              <h4 class="text-white uppercase tracking-wider mb-3">Key Characteristics</h4>
              <ul class="space-y-2">
                <li 
                  v-for="trait in selectedArchetype.characteristics" 
                  :key="trait"
                  class="flex items-center gap-2 text-gray-300"
                >
                  <span class="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                  {{ trait }}
                </li>
              </ul>
            </div>
            <div>
              <h4 class="text-white uppercase tracking-wider mb-3">Shadow Aspects</h4>
              <ul class="space-y-2">
                <li 
                  v-for="aspect in selectedArchetype.shadowAspects" 
                  :key="aspect"
                  class="flex items-center gap-2 text-gray-300"
                >
                  <span class="w-1.5 h-1.5 bg-gray-500 rounded-full"></span>
                  {{ aspect }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
  
      <div class="flex justify-center">
        <router-link 
          to="/archetype-test" 
          class="mystical-button px-8 py-3 rounded-lg text-white uppercase tracking-widest text-sm flex items-center gap-2"
        >
          <Sparkles class="w-4 h-4" />
          Take the Archetype Test
        </router-link>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { 
    Crown, Flame, Heart, Eye, Star, Wand, Shield, Compass, 
    Sparkles, X, Sword, Feather, Sun, Moon
  } from 'lucide-vue-next';
  
  interface Archetype {
    name: string;
    icon: any;
    shortDescription: string;
    description: string;
    traits: string[];
    characteristics: string[];
    shadowAspects: string[];
  }
  
  const archetypes: Archetype[] = [
    {
      name: 'The Sovereign',
      icon: Crown,
      shortDescription: 'The leader who brings order and wisdom to their realm',
      description: 'The Sovereign represents the archetype of order, leadership, and wisdom. They embody the mature masculine or feminine energy that brings structure and guidance to their kingdom, whether literal or metaphorical.',
      traits: ['Leadership', 'Wisdom', 'Authority'],
      characteristics: [
        'Natural leadership abilities',
        'Strong sense of responsibility',
        'Ability to create order from chaos',
        'Wisdom in decision-making'
      ],
      shadowAspects: [
        'Tyrannical tendencies',
        'Abuse of power',
        'Excessive control',
        'Fear of losing authority'
      ]
    },
    {
      name: 'The Magician',
      icon: Wand,
      shortDescription: 'The transformer who bridges the spiritual and material worlds',
      description: 'The Magician represents transformation, knowledge, and the power to manifest change. They understand the underlying patterns of reality and can transform situations through wisdom and insight.',
      traits: ['Transformation', 'Knowledge', 'Power'],
      characteristics: [
        'Deep understanding of natural laws',
        'Ability to transform situations',
        'Bridge between spiritual and material',
        'Mastery of skills and knowledge'
      ],
      shadowAspects: [
        'Manipulation of others',
        'Using knowledge for personal gain',
        'Deception',
        'Intellectual arrogance'
      ]
    },
    {
      name: 'The Lover',
      icon: Heart,
      shortDescription: 'The passionate soul who seeks beauty and connection',
      description: 'The Lover archetype represents passion, beauty, and emotional connection. They seek to create and appreciate beauty in all its forms, fostering deep relationships and emotional experiences.',
      traits: ['Passion', 'Beauty', 'Connection'],
      characteristics: [
        'Deep capacity for love',
        'Appreciation of beauty',
        'Emotional intelligence',
        'Desire for union and connection'
      ],
      shadowAspects: [
        'Obsessive attachment',
        'Loss of self in relationships',
        'Emotional dependency',
        'Fear of abandonment'
      ]
    },
    {
      name: 'The Sage',
      icon: Eye,
      shortDescription: 'The seeker of truth and wisdom',
      description: 'The Sage represents the eternal search for truth and understanding. They seek knowledge not just for its own sake, but to share wisdom and illuminate the path for others.',
      traits: ['Wisdom', 'Truth', 'Understanding'],
      characteristics: [
        'Deep thirst for knowledge',
        'Ability to see truth',
        'Teaching and sharing wisdom',
        'Objective perspective'
      ],
      shadowAspects: [
        'Dogmatic thinking',
        'Analysis paralysis',
        'Disconnection from emotion',
        'Pride in knowledge'
      ]
    },
    {
      name: 'The Warrior',
      icon: Sword,
      shortDescription: 'The courageous protector who fights for what is right',
      description: 'The Warrior embodies courage, discipline, and the fight for justice. They protect what is valuable and stand up against oppression and wrongdoing.',
      traits: ['Courage', 'Strength', 'Protection'],
      characteristics: [
        'Strong sense of justice',
        'Physical and moral courage',
        'Discipline and training',
        'Protection of others'
      ],
      shadowAspects: [
        'Unnecessary aggression',
        'Cruel or brutal behavior',
        'Addiction to conflict',
        'Inability to show vulnerability'
      ]
    },
    {
      name: 'The Creator',
      icon: Feather,
      shortDescription: 'The innovative artist who brings new things into being',
      description: 'The Creator represents innovation, imagination, and the drive to bring new things into being. They transform ideas into reality and find original solutions to problems.',
      traits: ['Innovation', 'Imagination', 'Expression'],
      characteristics: [
        'Strong creative vision',
        'Ability to manifest ideas',
        'Original thinking',
        'Artistic expression'
      ],
      shadowAspects: [
        'Perfectionism',
        'Creative blocks',
        'Self-doubt',
        'Fear of criticism'
      ]
    },
    {
      name: 'The Jester',
      icon: Flame,
      shortDescription: 'The playful spirit who brings joy and laughter',
      description: 'The Jester embodies humor, playfulness, and joy. They see the world through a lens of comedy, often showing others the truth in a lighthearted way.',
      traits: ['Humor', 'Playfulness', 'Joy'],
      characteristics: [
        'Light-hearted attitude',
        'Ability to make others laugh',
        'Sharp wit',
        'Sees the humor in difficult situations'
      ],
      shadowAspects: [
        'Avoidance of responsibility',
        'Superficiality',
        'Emotional detachment',
        'Fear of facing serious issues'
      ]
    },
    {
      name: 'The Shadow',
      icon: Star,
      shortDescription: 'The hidden parts of ourselves that we reject or repress',
      description: 'The Shadow represents the parts of ourselves that we have disowned, denied, or rejected. These aspects often manifest as unconscious traits or behaviors that emerge when we are under stress.',
      traits: ['Repression', 'Denial', 'Unconscious'],
      characteristics: [
        'Unconscious behaviors',
        'Repressed desires',
        'Hidden traits and emotions',
        'Projection onto others'
      ],
      shadowAspects: [
        'Self-destructive behaviors',
        'Projection of flaws onto others',
        'Inability to accept responsibility for mistakes',
        'Unacknowledged fears'
      ]
    },
    {
      name: 'The Innocent',
      icon: Sun,
      shortDescription: 'The pure and optimistic spirit, untouched by the world',
      description: 'The Innocent archetype represents purity, optimism, and trust. They see the world as a place of potential and goodness, and they approach life with an untainted perspective.',
      traits: ['Purity', 'Trust', 'Optimism'],
      characteristics: [
        'Idealistic view of the world',
        'Trusting and open',
        'Hopeful and joyful',
        'Uncomplicated perspective'
      ],
      shadowAspects: [
        'Naivety',
        'Avoidance of reality',
        'Excessive optimism',
        'Dependency on others'
      ]
    },
    {
      name: 'The Rebel',
      icon: Moon,
      shortDescription: 'The non-conformist who challenges the status quo',
      description: 'The Rebel archetype embodies the desire for change, revolution, and breaking free from constraints. They are often dissatisfied with the established order and strive to create a new path.',
      traits: ['Rebellion', 'Non-conformity', 'Independence'],
      characteristics: [
        'Challenging authority',
        'Desire for change',
        'Non-conformist attitude',
        'Strong sense of personal freedom'
      ],
      shadowAspects: [
        'Destruction for the sake of destruction',
        'Disregard for consequences',
        'Anarchism without purpose',
        'Excessive defiance'
      ]
    }
  ];
  
  const selectedArchetype = ref<Archetype | null>(null);
  </script>
  