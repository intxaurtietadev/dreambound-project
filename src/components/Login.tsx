import { ref } from 'vue';

export const useLoginForm = () => {
  const email = ref('');
  const password = ref('');
  const error = ref<string | null>(null);

  const handleSubmit = () => {
    if (!email.value || !password.value) {
      error.value = 'Please complete all fields.';
      return;
    }

    error.value = null;
    alert(`Logging in as ${email.value}`);
  };

  return { email, password, error, handleSubmit };
};