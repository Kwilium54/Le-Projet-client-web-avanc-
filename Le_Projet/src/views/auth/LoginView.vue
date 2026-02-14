<template>
  <v-app>
    <v-main class="bg-grey-lighten-4">
      <v-container fluid class="fill-height">
        <v-row align="center" justify="center" class="fill-height">
          <v-col cols="12" sm="8" md="5" lg="4">
            <!-- Logo / Titre -->
            <div class="text-center mb-8">
              <v-icon size="56" color="primary" class="mb-3">mdi-clock-fast</v-icon>
              <h1 class="text-h4 font-weight-bold text-primary">Timely</h1>
              <p class="text-body-2 text-medium-emphasis mt-1">
                Suivez votre temps, maîtrisez votre journée
              </p>
            </div>

            <!-- Card principale -->
            <v-card elevation="3" rounded="xl" class="pa-2">
              <!-- Tabs -->
              <v-tabs v-model="tab" color="primary" align-tabs="center" class="mb-2">
                <v-tab value="login">
                  <v-icon start>mdi-login</v-icon>
                  Se connecter
                </v-tab>
                <v-tab value="register">
                  <v-icon start>mdi-account-plus</v-icon>
                  Créer un compte
                </v-tab>
              </v-tabs>

              <v-divider />

              <v-card-text class="pa-6">
                <v-tabs-window v-model="tab">
                  <!-- Onglet Connexion -->
                  <v-tabs-window-item value="login">
                    <p class="text-body-2 text-medium-emphasis mb-4 text-center">
                      Saisissez votre clé API pour accéder à votre espace.
                    </p>
                    <v-form @submit.prevent="handleLogin">
                      <v-text-field
                        v-model="loginApiKey"
                        v-auto-focus
                        label="Clé API"
                        placeholder="Entrez votre clé API"
                        prepend-inner-icon="mdi-key-outline"
                        variant="outlined"
                        rounded="lg"
                        density="comfortable"
                        :disabled="loading"
                        :rules="[(v) => !!v || 'La clé API est requise']"
                        autocomplete="off"
                        class="mb-4"
                      />
                      <v-btn
                        type="submit"
                        color="primary"
                        variant="elevated"
                        size="large"
                        block
                        rounded="lg"
                        :loading="loading"
                      >
                        <v-icon start>mdi-login</v-icon>
                        Se connecter
                      </v-btn>
                    </v-form>
                  </v-tabs-window-item>

                  <!-- Onglet Création de compte -->
                  <v-tabs-window-item value="register">
                    <p class="text-body-2 text-medium-emphasis mb-4 text-center">
                      Créez votre compte gratuitement pour commencer à tracker votre temps.
                    </p>
                    <v-form @submit.prevent="handleRegister">
                      <v-text-field
                        v-model="registerData.name"
                        v-auto-focus
                        label="Nom complet"
                        placeholder="Jean Dupont"
                        prepend-inner-icon="mdi-account-outline"
                        variant="outlined"
                        rounded="lg"
                        density="comfortable"
                        :disabled="loading"
                        :rules="[(v) => !!v || 'Le nom est requis']"
                        class="mb-3"
                      />
                      <v-text-field
                        v-model="registerData.email"
                        label="Adresse email"
                        placeholder="jean.dupont@example.com"
                        prepend-inner-icon="mdi-email-outline"
                        type="email"
                        variant="outlined"
                        rounded="lg"
                        density="comfortable"
                        :disabled="loading"
                        :rules="[
                          (v) => !!v || 'L\'email est requis',
                          (v) => /.+@.+\..+/.test(v) || 'Email invalide',
                        ]"
                        class="mb-4"
                      />
                      <v-btn
                        type="submit"
                        color="primary"
                        variant="elevated"
                        size="large"
                        block
                        rounded="lg"
                        :loading="loading"
                      >
                        <v-icon start>mdi-account-plus</v-icon>
                        Créer mon compte
                      </v-btn>
                    </v-form>
                  </v-tabs-window-item>
                </v-tabs-window>
              </v-card-text>
            </v-card>

            <!-- Footer -->
            <p class="text-center text-caption text-medium-emphasis mt-4">
              Timely — IUT Charlemagne · Web Client Avancé
            </p>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { createApiKey, getProfile } from '@/api/auth'
import { toast } from 'vue3-toastify'
import { TOAST_OPTIONS } from '@/utils/constants'

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

        toast.success('Connexion réussie !', TOAST_OPTIONS)
        router.push('/app/activity')
      } catch (error) {
        authStore.logout()
        toast.error('Clé API invalide', TOAST_OPTIONS)
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

        toast.success('Compte créé avec succès !', TOAST_OPTIONS)
        router.push('/app/activity')
      } catch (error) {
        toast.error('Erreur lors de la création du compte', TOAST_OPTIONS)
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
