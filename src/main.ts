import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import './index.css'
import { useAuthStore } from './stores/auth'

const app = createApp(App)

// Usar Pinia
const pinia = createPinia()
app.use(pinia)

// Usar el router
app.use(router)

// Cargar el estado de autenticación desde localStorage
const authStore = useAuthStore()
authStore.loadFromLocalStorage()

app.mount('#app')
