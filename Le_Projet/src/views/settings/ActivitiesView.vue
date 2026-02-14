<template>
  <v-card elevation="1" rounded="lg">
    <!-- Header -->
    <v-card-title
      class="pa-4 text-subtitle-1 font-weight-bold d-flex align-center justify-space-between flex-wrap gap-2"
    >
      <span>
        <v-icon class="mr-2" color="primary">mdi-tag-multiple-outline</v-icon>
        Mes activités
      </span>
      <v-btn
        color="primary"
        variant="flat"
        size="small"
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        Nouvelle activité
      </v-btn>
    </v-card-title>
    <v-divider />

    <!-- Search + filter -->
    <v-card-text class="pa-4 pb-0">
      <v-row dense>
        <v-col cols="12" sm="8" md="6">
          <v-text-field
            v-model="search"
            placeholder="Rechercher…"
            variant="outlined"
            density="compact"
            clearable
            prepend-inner-icon="mdi-magnify"
            hide-details
          />
        </v-col>
        <v-col cols="12" sm="4" md="6" class="d-flex align-center">
          <v-switch
            v-model="showDisabled"
            label="Voir désactivées"
            density="compact"
            color="primary"
            hide-details
            inset
          />
        </v-col>
      </v-row>
    </v-card-text>

    <!-- List -->
    <v-card-text class="pa-4">
      <v-progress-circular
        v-if="activitiesStore.loading"
        indeterminate
        color="primary"
        class="d-block mx-auto my-6"
      />

      <transition-group name="list" tag="div" class="d-flex flex-column gap-2">
        <v-card
          v-for="activity in filteredActivities"
          :key="activity.id"
          :class="{ 'opacity-50': activity.disabled }"
          variant="outlined"
          rounded="lg"
        >
          <v-card-text class="pa-3 d-flex align-center justify-space-between flex-wrap gap-2">
            <div class="d-flex align-center gap-3">
              <!-- Color swatch -->
              <div class="color-dot" :style="{ backgroundColor: activity.color || '#1976D2' }" />
              <span class="text-body-1 font-weight-medium" v-truncate="28">{{
                activity.name
              }}</span>
              <v-chip v-if="activity.disabled" size="x-small" color="grey" variant="tonal"
                >Désactivée</v-chip
              >
            </div>
            <div class="d-flex gap-1">
              <v-tooltip :text="activity.disabled ? 'Activer' : 'Désactiver'" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    :icon="activity.disabled ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                    size="small"
                    variant="text"
                    :color="activity.disabled ? 'success' : 'warning'"
                    @click="toggleActivity(activity)"
                  />
                </template>
              </v-tooltip>
              <v-tooltip text="Modifier" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-pencil-outline"
                    size="small"
                    variant="text"
                    color="primary"
                    @click="openEdit(activity)"
                  />
                </template>
              </v-tooltip>
            </div>
          </v-card-text>
        </v-card>
      </transition-group>

      <p
        v-if="!activitiesStore.loading && filteredActivities.length === 0"
        class="text-body-2 text-medium-emphasis text-center py-6"
      >
        Aucune activité trouvée.
      </p>
    </v-card-text>
  </v-card>

  <!-- ── Dialog créer / modifier ── -->
  <v-dialog v-model="dialog" max-width="440" persistent>
    <v-card rounded="xl">
      <v-card-title class="pa-4 text-subtitle-1 font-weight-bold">
        {{ editingActivity ? "Modifier l'activité" : 'Nouvelle activité' }}
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4 d-flex flex-column gap-3">
        <!-- Nom -->
        <v-text-field
          v-model="form.name"
          label="Nom de l'activité"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-tag-edit-outline"
          :rules="[(v) => !!v || 'Le nom est requis']"
          autofocus
        />

        <!-- Couleur + prévisualisation -->
        <div class="d-flex align-center gap-3">
          <v-text-field
            v-model="form.color"
            label="Couleur (hex)"
            variant="outlined"
            density="comfortable"
            prepend-inner-icon="mdi-palette-outline"
            placeholder="#1976D2"
            clearable
            style="flex: 1"
          />
          <div
            class="color-preview rounded-lg"
            :style="{ backgroundColor: form.color || '#1976D2' }"
          />
        </div>

        <!-- Swatches rapides -->
        <div class="d-flex flex-wrap gap-2">
          <div
            v-for="swatch in swatches"
            :key="swatch"
            class="swatch-item"
            :class="{ 'swatch-selected': form.color === swatch }"
            :style="{ backgroundColor: swatch }"
            @click="form.color = swatch"
          />
        </div>
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-4 justify-end gap-2">
        <v-btn variant="text" @click="dialog = false">Annuler</v-btn>
        <v-btn
          variant="flat"
          color="primary"
          :loading="saving"
          :disabled="!form.name"
          @click="saveActivity"
        >
          {{ editingActivity ? 'Modifier' : 'Créer' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { TOAST_OPTIONS } from '@/utils/constants'
import { useActivitiesStore } from '@/stores/activitiesStore'

const SWATCHES = [
  '#1976D2',
  '#2196F3',
  '#4CAF50',
  '#8BC34A',
  '#FF9800',
  '#FF5722',
  '#E91E63',
  '#9C27B0',
  '#00BCD4',
  '#607D8B',
]

export default {
  name: 'ActivitiesSettingsView',
  setup() {
    const activitiesStore = useActivitiesStore()

    const search = ref('')
    const showDisabled = ref(false)
    const dialog = ref(false)
    const saving = ref(false)
    const editingActivity = ref(null)
    const form = ref({ name: '', color: '#1976D2' })
    const swatches = SWATCHES

    const filteredActivities = computed(() => {
      return activitiesStore.activities.filter((a) => {
        if (!showDisabled.value && a.disabled) return false
        if (search.value) {
          return a.name.toLowerCase().includes(search.value.toLowerCase())
        }
        return true
      })
    })

    const openCreate = () => {
      editingActivity.value = null
      form.value = { name: '', color: '#1976D2' }
      dialog.value = true
    }

    const openEdit = (activity) => {
      editingActivity.value = activity
      form.value = { name: activity.name, color: activity.color || '#1976D2' }
      dialog.value = true
    }

    const saveActivity = async () => {
      if (!form.value.name) return
      saving.value = true
      try {
        const payload = { name: form.value.name, color: form.value.color || undefined }
        if (editingActivity.value) {
          await activitiesStore.editActivity(editingActivity.value.id, payload)
          toast.success('Activité modifiée ✓', TOAST_OPTIONS)
        } else {
          await activitiesStore.addActivity(payload)
          toast.success('Activité créée ✓', TOAST_OPTIONS)
        }
        dialog.value = false
      } finally {
        saving.value = false
      }
    }

    const toggleActivity = async (activity) => {
      try {
        if (activity.disabled) {
          await activitiesStore.enableActivityById(activity.id)
          toast.success('Activité activée', TOAST_OPTIONS)
        } else {
          await activitiesStore.disableActivityById(activity.id)
          toast.success('Activité désactivée', TOAST_OPTIONS)
        }
      } catch {
        // erreur gérée par l'intercepteur
      }
    }

    onMounted(() => {
      if (activitiesStore.activities.length === 0) activitiesStore.fetchActivities()
    })

    return {
      activitiesStore,
      search,
      showDisabled,
      dialog,
      saving,
      editingActivity,
      form,
      swatches,
      filteredActivities,
      openCreate,
      openEdit,
      saveActivity,
      toggleActivity,
    }
  },
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}

.color-dot {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.color-preview {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border: 2px solid rgba(0, 0, 0, 0.1);
}

.swatch-item {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease;
}
.swatch-item:hover {
  transform: scale(1.2);
}
.swatch-selected {
  border-color: #000 !important;
  transform: scale(1.15);
}

.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(16px);
}
</style>
