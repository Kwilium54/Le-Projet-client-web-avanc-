<template>
  <div>
    <h1>Page Activité</h1>
    <p>Bienvenue sur Timely !</p>
    <p>Utilisateur connecté : <strong>{{ authStore.user?.name || 'Inconnu' }}</strong></p>
    <p>Email : <strong>{{ authStore.user?.email || 'N/A' }}</strong></p>

    <button @click="handleLogout">Déconnexion</button>
  </div>
</template>

<script>
import { useAuthStore } from '@/stores/authStore'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

export default {
  name: 'ActivityView',
  setup() {
    const authStore = useAuthStore()
    const router = useRouter()

    const handleLogout = () => {
      authStore.logout()
      toast.info('Déconnexion réussie')
      router.push('/login')
    }

    return {
      authStore,
      handleLogout,
    }
  },
}
</script>
