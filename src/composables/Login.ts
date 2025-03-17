import { ref } from 'vue';
import { useRouter } from 'vue-router';

export const useLoginForm = () => {
  const nombre = ref('');
  const password = ref('');
  const error = ref<string | null>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    error.value = null;

    if (!nombre.value || !password.value) {
      error.value = 'Please complete all fields.';
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ nombre: nombre.value, password: password.value }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await response.json();

      // Guardamos el token y el ID del usuario
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.id); // <- Asegúrate de enviarlo desde backend

      router.push('/profile');
    } catch (err: any) {
      error.value = err.message || 'Unexpected error occurred';
    }
  };

  return { nombre, password, error, handleSubmit };
};
