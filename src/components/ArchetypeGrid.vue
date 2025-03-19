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
  import sageImage from '../assets/archetypes/sage.jpg'
  import warriorImage from '../assets/archetypes/warrior.jpg'
  import shadowImage from '../assets/archetypes/shadow.jpg'
  import loverImage from '../assets/archetypes/lover.jpg'
  import childImage from '../assets/archetypes/child.jpg'
  import magicianImage from '../assets/archetypes/magician.jpg'
  
  const archetypes = [
    {
      title: 'The Sage',
      description: 'Embodies knowledge, introspection, and the pursuit of truth.',
      image: sageImage
    },
    {
      title: 'The Warrior',
      description: 'Symbol of courage, strength, and the will to fight for purpose.',
      image: warriorImage
    },
    {
      title: 'The Shadow',
      description: 'The unconscious, repressed self that holds hidden truths.',
      image: shadowImage
    },
    {
      title: 'The Lover',
      description: 'Connection, passion, and the desire for unity.',
      image: loverImage
    },
    {
      title: 'The Child',
      description: 'Represents innocence, creativity, and potential.',
      image: childImage
    },
    {
      title: 'The Magician',
      description: 'Transformation, inner power, and access to the mystical.',
      image: magicianImage
    }
  ]
  </script>
  