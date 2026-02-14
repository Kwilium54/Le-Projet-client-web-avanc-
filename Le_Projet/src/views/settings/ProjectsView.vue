<template>
  <v-card elevation="1" rounded="lg">
    <!-- Header -->
    <v-card-title
      class="pa-4 text-subtitle-1 font-weight-bold d-flex align-center justify-space-between flex-wrap gap-2"
    >
      <span>
        <v-icon class="mr-2" color="primary">mdi-folder-multiple-outline</v-icon>
        Mes projets
      </span>
      <v-btn
        color="primary"
        variant="flat"
        size="small"
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        Nouveau projet
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
            label="Voir désactivés"
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
        v-if="projectsStore.loading"
        indeterminate
        color="primary"
        class="d-block mx-auto my-6"
      />

      <transition-group name="list" tag="div" class="d-flex flex-column gap-2">
        <v-card
          v-for="project in filteredProjects"
          :key="project.id"
          :class="{ 'opacity-50': project.disabled }"
          variant="outlined"
          rounded="lg"
        >
          <v-card-text class="pa-3 d-flex align-center justify-space-between flex-wrap gap-2">
            <div class="d-flex align-center gap-3">
              <v-icon color="primary" size="20">mdi-folder-outline</v-icon>
              <span class="text-body-1 font-weight-medium" v-truncate="28">{{ project.name }}</span>
              <v-chip v-if="project.disabled" size="x-small" color="grey" variant="tonal"
                >Désactivé</v-chip
              >
            </div>
            <div class="d-flex gap-1">
              <v-tooltip :text="project.disabled ? 'Activer' : 'Désactiver'" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    :icon="project.disabled ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                    size="small"
                    variant="text"
                    :color="project.disabled ? 'success' : 'warning'"
                    @click="toggleProject(project)"
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
                    @click="openEdit(project)"
                  />
                </template>
              </v-tooltip>
            </div>
          </v-card-text>
        </v-card>
      </transition-group>

      <p
        v-if="!projectsStore.loading && filteredProjects.length === 0"
        class="text-body-2 text-medium-emphasis text-center py-6"
      >
        Aucun projet trouvé.
      </p>
    </v-card-text>
  </v-card>

  <!-- ── Dialog créer / modifier ── -->
  <v-dialog v-model="dialog" max-width="420" persistent>
    <v-card rounded="xl">
      <v-card-title class="pa-4 text-subtitle-1 font-weight-bold">
        {{ editingProject ? 'Modifier le projet' : 'Nouveau projet' }}
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <v-text-field
          v-model="form.name"
          label="Nom du projet"
          variant="outlined"
          density="comfortable"
          prepend-inner-icon="mdi-folder-edit-outline"
          :rules="[(v) => !!v || 'Le nom est requis']"
          autofocus
        />
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-4 justify-end gap-2">
        <v-btn variant="text" @click="dialog = false">Annuler</v-btn>
        <v-btn
          variant="flat"
          color="primary"
          :loading="saving"
          :disabled="!form.name"
          @click="saveProject"
        >
          {{ editingProject ? 'Modifier' : 'Créer' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { toast } from 'vue3-toastify'
import { TOAST_OPTIONS } from '@/utils/constants'
import { useProjectsStore } from '@/stores/projectsStore'

export default {
  name: 'ProjectsView',
  setup() {
    const projectsStore = useProjectsStore()

    const search = ref('')
    const showDisabled = ref(false)
    const dialog = ref(false)
    const saving = ref(false)
    const editingProject = ref(null)
    const form = ref({ name: '' })

    const filteredProjects = computed(() => {
      return projectsStore.projects.filter((p) => {
        if (!showDisabled.value && p.disabled) return false
        if (search.value) {
          return p.name.toLowerCase().includes(search.value.toLowerCase())
        }
        return true
      })
    })

    const openCreate = () => {
      editingProject.value = null
      form.value = { name: '' }
      dialog.value = true
    }

    const openEdit = (project) => {
      editingProject.value = project
      form.value = { name: project.name }
      dialog.value = true
    }

    const saveProject = async () => {
      if (!form.value.name) return
      saving.value = true
      try {
        if (editingProject.value) {
          await projectsStore.editProject(editingProject.value.id, { name: form.value.name })
          toast.success('Projet modifié ✓', TOAST_OPTIONS)
        } else {
          await projectsStore.addProject({ name: form.value.name })
          toast.success('Projet créé ✓', TOAST_OPTIONS)
        }
        dialog.value = false
      } finally {
        saving.value = false
      }
    }

    const toggleProject = async (project) => {
      try {
        if (project.disabled) {
          await projectsStore.enableProjectById(project.id)
          toast.success('Projet activé', TOAST_OPTIONS)
        } else {
          await projectsStore.disableProjectById(project.id)
          toast.success('Projet désactivé', TOAST_OPTIONS)
        }
      } catch {
        // erreur gérée par l'intercepteur
      }
    }

    onMounted(() => {
      if (projectsStore.projects.length === 0) projectsStore.fetchProjects()
    })

    return {
      projectsStore,
      search,
      showDisabled,
      dialog,
      saving,
      editingProject,
      form,
      filteredProjects,
      openCreate,
      openEdit,
      saveProject,
      toggleProject,
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
