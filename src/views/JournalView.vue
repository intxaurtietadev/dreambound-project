<template>
  <div class="max-w-3xl mx-auto">
    <div class="mystical-card rounded-lg p-8">
      <DreamJournal 
        v-model="dream" 
        @submit="handleSubmit" 
        :interpretation="interpretation" 
      />
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
import api from '../api/api'; // Importamos la configuración de Axios
import { useAuthStore } from '../stores/auth';

const dream = ref('');
const reflection = ref('');
const interpretation = ref<string | null>(null);

const authStore = useAuthStore();
const userId = authStore.userId;

const dreamId = ref<string | null>(null);

const handleSubmit = async () => {
  const token = localStorage.getItem("token");  // Obtener el token de localStorage

  if (!token) {
    console.error("No se encontró el token");
    return;
  }

  try {
    // Enviar el texto del sueño al backend para obtener la interpretación
    const response = await api.post('/api/interpret-dream', { dreamText: dream.value }, {
      headers: {
        "Authorization": `Bearer ${token}`  // Asegúrate de que el token esté en el encabezado
      }
    });

    // Guardamos la interpretación recibida
    interpretation.value = response.data.interpretation;

    // Crear un nuevo sueño con la interpretación
    const nuevoSueno = {
      id: crypto.randomUUID(),
      title: "Untitled Dream",
      description: dream.value,
      date: new Date().toISOString().split('T')[0],
      emotions: [],  // Agrega las emociones si las tienes
      reflection: ""
    };

    dreamId.value = nuevoSueno.id;

    // Guardamos el sueño en el backend
    const saveResponse = await fetch(`http://localhost:3000/usuarios/${userId}/dreams`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`  // Asegúrate de que el token esté en el encabezado
      },
      body: JSON.stringify(nuevoSueno)
    });

    if (!saveResponse.ok) {
      throw new Error("Error al guardar el sueño");
    }

    console.log("🌙 Sueño interpretado y guardado correctamente");
  } catch (error) {
    console.error("💥 Error al obtener la interpretación o guardar el sueño:", error);
  }
};

const saveReflection = async (newReflection: string) => {
  reflection.value = newReflection;
  if (!dreamId.value) return;

  const token = localStorage.getItem("token");

  if (!token) {
    console.error("No se encontró el token");
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/usuarios/${userId}/dreams/${dreamId.value}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`  // Asegúrate de que el token esté en el encabezado
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
