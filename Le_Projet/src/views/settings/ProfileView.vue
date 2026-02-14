<template>
  <v-card elevation="1" rounded="lg">
    <!-- Header -->
    <v-card-title class="pa-4 text-subtitle-1 font-weight-bold d-flex align-center">
      <v-icon class="mr-2" color="primary">mdi-account-outline</v-icon>
      Mon profil
    </v-card-title>
    <v-divider />

    <!-- Loading skeleton -->
    <v-card-text v-if="loading" class="pa-6">
      <v-skeleton-loader type="text, text, button" />
    </v-card-text>

    <!-- Form -->
    <v-card-text v-else class="pa-6">
      <v-row>
        <v-col cols="12" md="6">
          <!-- API Key (lecture seule) -->
          <v-text-field
            :model-value="authStore.apiKey"
            label="Clé API"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-key-outline"
            readonly
            class="mb-4"
          >
            <template #append-inner>
              <v-tooltip text="Copier" location="top">
                <template #activator="{ props }">
                  <v-icon v-bind="props" @click="copyApiKey" size="18">mdi-content-copy</v-icon>
                </template>
              </v-tooltip>
            </template>
          </v-text-field>

          <!-- Nom -->
          <v-text-field
            v-model="form.name"
            label="Nom"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-account-edit-outline"
            :rules="[(v) => !!v || 'Le nom est requis']"
            class="mb-4"
            v-auto-focus
          />

          <!-- Email -->
          <v-text-field
            v-model="form.email"
            label="Adresse e-mail"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-email-outline"
            type="email"
            :rules="[
              (v) => !!v || 'L\'e-mail est requis',
              (v) => /.+@.+\..+/.test(v) || 'E-mail invalide',
            ]"
            class="mb-4"
          />

          <v-btn
            color="primary"
            variant="flat"
            :loading="saving"
            :disabled="!form.name || !form.email"
            prepend-icon="mdi-content-save-outline"
            @click="saveProfile"
          >
            Enregistrer
          </v-btn>
        </v-col>

        <!-- Illustration / avatar -->
        <v-col cols="12" md="6" class="d-flex flex-column align-center justify-center">
          <v-avatar size="96" color="primary" class="mb-4">
            <span class="text-h4 text-white font-weight-bold">{{ initials }}</span>
          </v-avatar>
          <p class="text-body-2 text-medium-emphasis text-center">
            Votre avatar est généré à partir de votre nom.
          </p>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { TOAST_OPTIONS } from '@/utils/constants'
import { getProfile, updateProfile } from '@/api/auth'
import { useAuthStore } from '@/stores/authStore'

export default {
  name: 'ProfileView',
  setup() {
    const authStore = useAuthStore()
    const loading = ref(true)
    const saving = ref(false)

    const form = reactive({ name: '', email: '' })

    const initials = computed(() => {
      const parts = (form.name || '').trim().split(' ')
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
      return (parts[0]?.[0] || '?').toUpperCase()
    })

    const loadProfile = async () => {
      loading.value = true
      try {
        const profile = await getProfile()
        form.name = profile.name || ''
        form.email = profile.email || ''
        authStore.setUser({ name: form.name, email: form.email, id: profile.id })
      } catch {
        // erreur affichée par l'intercepteur
      } finally {
        loading.value = false
      }
    }

    const saveProfile = async () => {
      if (!form.name || !form.email) return
      saving.value = true
      try {
        const updated = await updateProfile(form.name, form.email)
        authStore.setUser({ name: updated.name, email: updated.email, id: updated.id })
        toast.success('Profil mis à jour !', TOAST_OPTIONS)
      } finally {
        saving.value = false
      }
    }

    const copyApiKey = () => {
      navigator.clipboard.writeText(authStore.apiKey || '')
      toast.success('Clé API copiée !', TOAST_OPTIONS)
    }

    onMounted(loadProfile)

    return { authStore, loading, saving, form, initials, saveProfile, copyApiKey }
  },
}
</script>
