// src/composables/login.ts
import { ref } from 'vue';
import { useRouter } from 'vue-router';

export const useLoginForm = () => {
  const email = ref('');
  const password = ref('');
  const error = ref<string | null>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    // Limpiar errores previos
    error.value = null;

    // Validar campos
    if (!email.value || !password.value) {
      error.value = 'Please complete all fields.';
      return;
    }

    try {
      // Simular una llamada a una API de autenticación
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          if (email.value === 'user@example.com' && password.value === 'password123') {
            resolve(true); // Credenciales válidas
          } else {
            reject(new Error('Invalid credentials')); // Credenciales inválidas
          }
        }, 1000); // Simula un retardo de 1 segundo
      });

      // Si las credenciales son válidas, redirigir al usuario a /journal
      router.push('/journal');
    } catch (err) {
      // Manejar errores de autenticación
      error.value = 'Invalid email or password. Please try again.';
    }
  };

  return { email, password, error, handleSubmit };
};