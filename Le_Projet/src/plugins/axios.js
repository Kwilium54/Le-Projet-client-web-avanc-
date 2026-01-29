import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://timely.edu.netlor.fr',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore()
    if (authStore.apiKey) {
      config.headers.Authorization = `key=${authStore.apiKey}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    let errorMessage = 'Une erreur est survenue'

    if (error.response) {
      errorMessage = error.response.data?.message || error.response.data?.error || errorMessage
      
      if (error.response.status === 401) {
        const authStore = useAuthStore()
        authStore.logout()
        errorMessage = 'Session expirée. Veuillez vous reconnecter.'
      }
    } else if (error.request) {
      errorMessage = 'Impossible de contacter le serveur'
    } else {
      errorMessage = error.message
    }

    toast.error(errorMessage, {
      autoClose: 3000,
      position: 'top-right',
    })

    return Promise.reject(error)
  }
)

export default {
  install: (app) => {
    app.config.globalProperties.$axios = axiosInstance
    app.provide('axios', axiosInstance)
  },
}

export { axiosInstance }
