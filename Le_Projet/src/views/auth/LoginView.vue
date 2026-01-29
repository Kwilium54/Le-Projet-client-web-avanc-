<template>
  <div>
    <h1>Timely - Connexion</h1>

    <div>
      <button @click="tab = 'login'">Se connecter</button>
      <button @click="tab = 'register'">Créer un compte</button>
    </div>

    <!-- Formulaire de connexion -->
    <div v-if="tab === 'login'">
      <h2>Connexion</h2>
      <form @submit.prevent="handleLogin">
        <div>
          <label>API Key:</label>
          <input
            v-model="loginApiKey"
            type="text"
            placeholder="Entrez votre clé API"
            v-auto-focus
            required
          />
        </div>
        <button type="submit" :disabled="loading">Se connecter</button>
      </form>
    </div>

    <!-- Formulaire de création de compte -->
    <div v-if="tab === 'register'">
      <h2>Créer un compte</h2>
      <form @submit.prevent="handleRegister">
        <div>
          <label>Nom complet:</label>
          <input
            v-model="registerData.name"
            type="text"
            placeholder="Jean Dupont"
            v-auto-focus
            required
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            v-model="registerData.email"
            type="email"
            placeholder="jean.dupont@example.com"
            required
          />
        </div>
        <button type="submit" :disabled="loading">Créer mon compte</button>
      </form>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { createApiKey, getProfile } from '@/api/auth'
import { toast } from 'vue3-toastify'

export default {
  name: 'LoginView',
  setup() {
    const router = useRouter()
    const authStore = useAuthStore()

    const tab = ref('login')
    const loading = ref(false)
    const loginApiKey = ref('')
    const registerData = ref({
      name: '',
      email: '',
    })

    const handleLogin = async () => {
      if (!loginApiKey.value) return

      loading.value = true
      try {
        authStore.login(loginApiKey.value)
        const userData = await getProfile()
        authStore.setUser(userData)

        toast.success('Connexion réussie !')
        router.push('/app/activity')
      } catch (error) {
        authStore.logout()
        toast.error('Clé API invalide')
        console.error('Erreur de connexion:', error)
      } finally {
        loading.value = false
      }
    }

    const handleRegister = async () => {
      if (!registerData.value.name || !registerData.value.email) return

      loading.value = true
      try {
        const response = await createApiKey(registerData.value.name, registerData.value.email)

        authStore.login(response.key, {
          name: response.name,
          email: response.email,
          id: response.id,
        })

        toast.success('Compte créé avec succès !')
        router.push('/app/activity')
      } catch (error) {
        toast.error('Erreur lors de la création du compte')
        console.error('Erreur de création:', error)
      } finally {
        loading.value = false
      }
    }

    return {
      tab,
      loading,
      loginApiKey,
      registerData,
      handleLogin,
      handleRegister,
    }
  },
}
</script>
