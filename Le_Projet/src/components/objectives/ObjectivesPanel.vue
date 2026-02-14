<template>
  <div class="d-flex flex-column ga-4">
    <!-- ───── Formulaire d'ajout ───── -->
    <v-card rounded="xl" elevation="2">
      <v-card-title class="pa-4 text-subtitle-1 font-weight-bold d-flex align-center ga-2">
        <v-icon color="primary">mdi-checkbox-marked-circle-plus-outline</v-icon>
        Objectifs journaliers
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <v-form @submit.prevent="handleAddObjective">
          <v-text-field
            v-model="newObjective.name"
            v-auto-focus
            label="Nom de l'objectif *"
            placeholder="Ex : Finir le rapport"
            prepend-inner-icon="mdi-flag-outline"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            hide-details="auto"
            :rules="[(v) => !!v || 'Le nom est requis']"
            class="mb-3"
          />
          <v-textarea
            v-model="newObjective.content"
            label="Description (optionnel)"
            placeholder="Décrivez l'objectif en détail…"
            prepend-inner-icon="mdi-text"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            rows="2"
            auto-grow
            hide-details
            class="mb-3"
          />
          <v-btn
            type="submit"
            color="primary"
            variant="elevated"
            rounded="lg"
            block
            prepend-icon="mdi-plus"
            :loading="adding"
            :disabled="!newObjective.name"
          >
            Ajouter l'objectif
          </v-btn>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- ───── Liste des objectifs ───── -->
    <v-card rounded="xl" elevation="1">
      <v-card-text class="pa-4">
        <!-- Recherche + options -->
        <div class="d-flex align-center ga-2 mb-3 flex-wrap">
          <div class="flex-grow-1">
            <search-bar v-model="searchKeywords" placeholder="Rechercher un objectif…" />
          </div>
          <v-btn
            :color="showDone ? 'success' : 'default'"
            :variant="showDone ? 'tonal' : 'outlined'"
            size="small"
            rounded="lg"
            prepend-icon="mdi-check-all"
            @click="showDone = !showDone"
          >
            {{ showDone ? 'Masquer atteints' : 'Voir atteints' }}
          </v-btn>
        </div>

        <!-- Loading -->
        <div v-if="loadingObjectives" class="text-center py-6">
          <v-progress-circular indeterminate color="primary" size="32" />
        </div>

        <!-- Vide -->
        <div
          v-else-if="groupedObjectives.length === 0"
          class="text-center py-6 text-medium-emphasis"
        >
          <v-icon size="40" class="mb-2">mdi-checkbox-blank-circle-outline</v-icon>
          <p class="text-body-2">Aucun objectif trouvé</p>
        </div>

        <!-- Groupes par date -->
        <div v-else class="d-flex flex-column ga-4">
          <div v-for="group in groupedObjectives" :key="group.date">
            <!-- En-tête de groupe -->
            <div class="d-flex align-center ga-2 mb-2">
              <v-chip size="x-small" color="primary" variant="tonal" prepend-icon="mdi-calendar">
                {{ formatGroupDate(group.date) }}
              </v-chip>
              <v-chip size="x-small" variant="outlined">
                {{ group.objectives.filter((o) => o.done).length }}/{{ group.objectives.length }}
              </v-chip>
            </div>

            <!-- Items avec transition -->
            <transition-group name="list" tag="div" class="d-flex flex-column ga-2">
              <objective-item
                v-for="obj in group.objectives"
                :key="obj.id"
                :objective="obj"
                @toggle="handleToggle"
                @edit="openEditDialog(obj)"
                @delete="openDeleteDialog(obj)"
              />
            </transition-group>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- ───── Dialog : Modifier un objectif ───── -->
    <v-dialog :model-value="editDialog" max-width="480" @update:model-value="editDialog = $event">
      <v-card rounded="xl" elevation="4">
        <v-card-title class="pa-5 text-subtitle-1 font-weight-bold d-flex align-center ga-2">
          <v-icon color="primary">mdi-pencil-outline</v-icon>
          Modifier l'objectif
        </v-card-title>
        <v-divider />
        <v-card-text class="pa-5">
          <v-text-field
            v-model="editForm.name"
            v-auto-focus
            label="Nom *"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            prepend-inner-icon="mdi-flag-outline"
            :rules="[(v) => !!v || 'Requis']"
            class="mb-3"
          />
          <v-textarea
            v-model="editForm.content"
            label="Description (optionnel)"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            rows="3"
            auto-grow
            prepend-inner-icon="mdi-text"
            hide-details
          />
        </v-card-text>
        <v-card-actions class="pa-4 pt-0 justify-end ga-2">
          <v-btn variant="text" rounded="lg" @click="editDialog = false">Annuler</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            rounded="lg"
            :loading="savingEdit"
            :disabled="!editForm.name"
            @click="saveEdit"
          >
            Enregistrer
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ───── Dialog : Confirmer suppression ───── -->
    <confirm-dialog
      :model-value="deleteDialog"
      title="Supprimer l'objectif"
      message="Voulez-vous vraiment supprimer cet objectif ?"
      confirm-label="Supprimer"
      @update:model-value="deleteDialog = $event"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useObjectivesStore } from '@/stores/objectivesStore'
import { dateFormatterMixin } from '@/mixins/dateFormatterMixin'
import { toast } from 'vue3-toastify'
import { TOAST_OPTIONS } from '@/utils/constants'
import ObjectiveItem from '@/components/common/ObjectiveItem.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

export default {
  name: 'ObjectivesPanel',
  components: { ObjectiveItem, SearchBar, ConfirmDialog },
  mixins: [dateFormatterMixin],
  setup() {
    const objectivesStore = useObjectivesStore()

    const loadingObjectives = ref(false)
    const adding = ref(false)
    const showDone = ref(false)
    const searchKeywords = ref('')

    const newObjective = ref({ name: '', content: '' })

    // Edit dialog
    const editDialog = ref(false)
    const savingEdit = ref(false)
    const editingObjective = ref(null)
    const editForm = ref({ name: '', content: '' })

    // Delete dialog
    const deleteDialog = ref(false)
    const objectiveToDelete = ref(null)

    //Chargement
    const loadObjectives = async () => {
      loadingObjectives.value = true
      try {
        await objectivesStore.fetchObjectives()
      } finally {
        loadingObjectives.value = false
      }
    }

    //Objectifs filtrés
    const filteredObjectives = computed(() => {
      return objectivesStore.objectives.filter((obj) => {
        if (!showDone.value && obj.done) return false
        if (searchKeywords.value) {
          const kw = searchKeywords.value.toLowerCase()
          const inName = obj.name?.toLowerCase().includes(kw)
          const inContent = obj.content?.toLowerCase().includes(kw)
          if (!inName && !inContent) return false
        }
        return true
      })
    })

    //Groupés par date
    const groupedObjectives = computed(() => {
      const groups = {}
      for (const obj of filteredObjectives.value) {
        const date = obj.date?.split(' ')[0] || obj.date?.split('T')[0] || 'unknown'
        if (!groups[date]) groups[date] = []
        groups[date].push(obj)
      }
      return Object.entries(groups)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([date, objectives]) => ({ date, objectives }))
    })

    const formatGroupDate = (dateStr) => {
      if (!dateStr || dateStr === 'unknown') return 'Date inconnue'
      const today = new Date().toISOString().split('T')[0]
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      if (dateStr === today) return "Aujourd'hui"
      if (dateStr === yesterday) return 'Hier'
      const d = new Date(dateStr)
      return d.toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })
    }

    //Ajouter
    const handleAddObjective = async () => {
      if (!newObjective.value.name) return
      adding.value = true
      try {
        await objectivesStore.addObjective({
          name: newObjective.value.name,
          content: newObjective.value.content || undefined,
        })
        newObjective.value = { name: '', content: '' }
        toast.success('Objectif ajouté !', TOAST_OPTIONS)
      } finally {
        adding.value = false
      }
    }

    //Toggle done/undone
    const handleToggle = async (objective) => {
      try {
        if (objective.done) {
          await objectivesStore.markAsUndone(objective.id)
        } else {
          await objectivesStore.markAsDone(objective.id)
          toast.success('Objectif atteint ! 🎉', TOAST_OPTIONS)
        }
      } catch {
        // géré par l'intercepteur
      }
    }

    //Edit
    const openEditDialog = (obj) => {
      editingObjective.value = obj
      editForm.value = { name: obj.name, content: obj.content || '' }
      editDialog.value = true
    }

    const saveEdit = async () => {
      if (!editForm.value.name || !editingObjective.value) return
      savingEdit.value = true
      try {
        await objectivesStore.editObjective(editingObjective.value.id, {
          name: editForm.value.name,
          content: editForm.value.content || undefined,
        })
        editDialog.value = false
        toast.success('Objectif modifié', TOAST_OPTIONS)
      } finally {
        savingEdit.value = false
      }
    }

    //Delete
    const openDeleteDialog = (obj) => {
      objectiveToDelete.value = obj
      deleteDialog.value = true
    }

    const confirmDelete = async () => {
      if (!objectiveToDelete.value) return
      try {
        await objectivesStore.removeObjective(objectiveToDelete.value.id)
        toast.success('Objectif supprimé', TOAST_OPTIONS)
      } finally {
        objectiveToDelete.value = null
      }
    }

    onMounted(loadObjectives)

    return {
      loadingObjectives,
      adding,
      showDone,
      searchKeywords,
      newObjective,
      groupedObjectives,
      editDialog,
      savingEdit,
      editForm,
      deleteDialog,
      formatGroupDate,
      handleAddObjective,
      handleToggle,
      openEditDialog,
      saveEdit,
      openDeleteDialog,
      confirmDelete,
    }
  },
}
</script>

<style scoped>
/* Transitions liste */
.list-enter-active,
.list-leave-active {
  transition: all 0.35s ease;
}
.list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}
.list-leave-to {
  opacity: 0;
  transform: translateX(20px);
}
</style>
