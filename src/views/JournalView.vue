<template>
  <div class="max-w-3xl mx-auto">
    <div class="mystical-card rounded-lg p-8">
      <DreamJournal v-model="dream" @submit="handleSubmit" />
      <DreamReflection
        v-if="interpretation"
        :interpretation="interpretation"
        :reflection="reflection"
        @save-reflection="saveReflection"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import DreamJournal from '../components/DreamJournal.vue';
import DreamReflection from '../components/DreamReflection.vue';
import { analyzeDreamNarrative } from '../utils/dreamInterpreter';
import { useAuthStore } from '../stores/auth';

const dream = ref('');
const reflection = ref('');
const interpretation = ref<string | null>(null);

const authStore = useAuthStore();
const userId = authStore.userId;

const dreamId = ref<string | null>(null);

const handleSubmit = async () => {
  const analysis = analyzeDreamNarrative(dream.value);
  interpretation.value = analysis.interpretation;

  const nuevoSueno = {
    id: crypto.randomUUID(),
    title: "Untitled Dream",
    description: dream.value,
    date: new Date().toISOString().split('T')[0],
    emotions: analysis.emotions,
    reflection: ""
  };

  dreamId.value = nuevoSueno.id;

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

const saveReflection = async (newReflection: string) => {
  reflection.value = newReflection;
  if (!dreamId.value) return;

  const token = localStorage.getItem("token");

  try {
    const response = await fetch(`http://localhost:3000/usuarios/${userId}/dreams/${dreamId.value}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ reflection: reflection.value })
    });

    if (!response.ok) {
      throw new Error("Error al guardar la reflexión");
    }

    console.log("📝 Reflexión guardada correctamente");
  } catch (error) {
    console.error("💥 Error al guardar la reflexión:", error);
  }
};
</script>
