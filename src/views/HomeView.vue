<template>
    <div class="px-6 py-12 max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row gap-12 items-start">
        <IntroductionSection />
        <ArchetypesGrid />
      </div>

    </div>
  </template>

  <script setup lang="ts">
  import IntroductionSection from '../components/IntroductionSection.vue'
  import ArchetypesGrid from '../components/ArchetypeGrid.vue'
  </script>
  