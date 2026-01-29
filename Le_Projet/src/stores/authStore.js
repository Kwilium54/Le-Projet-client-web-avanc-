import { defineStore } from 'pinia'
import { ref } from 'vue'
import { env } from '@/utils/env'

export const useAuthStore = defineStore('auth', () => {
  const apiKey = ref(null)
  const user = ref(null)
  const isAuthenticated = ref(false)

  function initialize() {
    if (!apiKey.value && env.apiKey) {
      apiKey.value = env.apiKey
      isAuthenticated.value = true
      
      if (env.userName && env.userEmail) {
        user.value = {
          name: env.userName,
          email: env.userEmail,
          id: env.userId,
        }
      }
    }
  }

  function login(key, userData = null) {
    apiKey.value = key
    user.value = userData
    isAuthenticated.value = true
  }

  function logout() {
    apiKey.value = null
    user.value = null
    isAuthenticated.value = false
  }

  function setUser(userData) {
    user.value = userData
  }

  return {
    apiKey,
    user,
    isAuthenticated,
    initialize,
    login,
    logout,
    setUser,
  }
}, {
  persist: true,
})
