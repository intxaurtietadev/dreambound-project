<template>
    <section class="py-12 px-6 max-w-6xl mx-auto">
      <h2 class="text-3xl font-bold text-center text-white mb-10">Jungian Archetypes</h2>
      <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ArchetypeCard
          v-for="(archetype, index) in archetypes"
          :key="index"
          v-bind="archetype"
        />
      </div>
    </section>
  </template>
  
  <script setup lang="ts">
  import ArchetypeCard from './ArchetypeCard.vue'
  
  const archetypes = [
    {
      title: 'The Sage',
      description: 'Embodies knowledge, introspection, and the pursuit of truth.',
      image: '/assets/archetypes/sage.jpg'
    },
    {
      title: 'The Warrior',
      description: 'Symbol of courage, strength, and the will to fight for purpose.',
      image: '/assets/archetypes/warrior.jpg'
    },
    {
      title: 'The Shadow',
      description: 'The unconscious, repressed self that holds hidden truths.',
      image: '/assets/archetypes/shadow.jpg'
    },
    {
      title: 'The Lover',
      description: 'Connection, passion, and the desire for unity.',
      image: '/assets/archetypes/lover.jpg'
    },
    {
      title: 'The Child',
      description: 'Represents innocence, creativity, and potential.',
      image: '/assets/archetypes/child.jpg'
    },
    {
      title: 'The Magician',
      description: 'Transformation, inner power, and access to the mystical.',
      image: '/assets/archetypes/magician.jpg'
    }
  ]
  </script>
  