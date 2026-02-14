<template>
  <div class="d-flex flex-column ga-4">
    <!-- ───── Zone de lancement / activité en cours ───── -->
    <v-card rounded="xl" elevation="2">
      <v-card-title class="pa-4 text-subtitle-1 font-weight-bold d-flex align-center ga-2">
        <v-icon color="primary">mdi-play-circle-outline</v-icon>
        Time Tracker
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <!-- ── Aucune activité en cours ── -->
        <transition name="fade" mode="out-in">
          <div v-if="!currentEntry" key="start-form">
            <v-row dense>
              <v-col cols="12" sm="5">
                <v-select
                  v-model="selectedProjectId"
                  :items="activeProjects"
                  item-title="name"
                  item-value="id"
                  label="Projet *"
                  prepend-inner-icon="mdi-folder-outline"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  hide-details
                  clearable
                />
              </v-col>
              <v-col cols="12" sm="5">
                <v-select
                  v-model="selectedActivityId"
                  :items="activeActivities"
                  item-title="name"
                  item-value="id"
                  label="Type d'activité *"
                  prepend-inner-icon="mdi-tag-outline"
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  hide-details
                  clearable
                />
              </v-col>
              <v-col cols="12" sm="2" class="d-flex align-center">
                <v-btn
                  color="success"
                  variant="elevated"
                  block
                  rounded="lg"
                  size="large"
                  prepend-icon="mdi-play"
                  :disabled="!selectedProjectId || !selectedActivityId"
                  :loading="starting"
                  @click="handleStart"
                >
                  Démarrer
                </v-btn>
              </v-col>
            </v-row>
          </div>

          <!-- ── Activité en cours ── -->
          <div v-else key="running" class="d-flex flex-column ga-3">
            <!-- Bannière activité en cours -->
            <v-sheet
              rounded="lg"
              color="success-lighten-5"
              class="pa-3 d-flex align-center ga-3 flex-wrap current-activity-banner"
              border="md"
            >
              <span class="pulse-dot flex-shrink-0" />

              <div class="flex-grow-1 d-flex align-center ga-2 flex-wrap">
                <v-chip
                  color="primary"
                  variant="tonal"
                  prepend-icon="mdi-folder-outline"
                  size="small"
                >
                  {{ currentProjectName }}
                </v-chip>
                <v-chip
                  :color="currentActivityColor || 'secondary'"
                  variant="tonal"
                  prepend-icon="mdi-tag-outline"
                  size="small"
                >
                  {{ currentActivityName }}
                </v-chip>
                <v-chip
                  color="success"
                  variant="elevated"
                  prepend-icon="mdi-timer-outline"
                  size="small"
                  class="font-weight-bold"
                >
                  {{ liveDuration }}
                </v-chip>
              </div>

              <v-btn
                color="error"
                variant="elevated"
                rounded="lg"
                size="small"
                prepend-icon="mdi-stop"
                :loading="stopping"
                @click="handleStop"
              >
                Stopper
              </v-btn>
            </v-sheet>

            <!-- Zone de notes -->
            <v-textarea
              v-model="currentComment"
              label="Notes (optionnel)"
              placeholder="Décrivez ce que vous faites…"
              prepend-inner-icon="mdi-note-text-outline"
              variant="outlined"
              rounded="lg"
              density="comfortable"
              rows="3"
              auto-grow
              hide-details
              @blur="saveComment"
            />
          </div>
        </transition>
      </v-card-text>
    </v-card>

    <!-- ───── Liste des entrées du jour ───── -->
    <v-card rounded="xl" elevation="1">
      <v-card-title class="pa-4 d-flex align-center justify-space-between">
        <div class="d-flex align-center ga-2 text-subtitle-1 font-weight-bold">
          <v-icon color="primary">mdi-format-list-bulleted-type</v-icon>
          Entrées du jour
          <v-chip size="x-small" color="primary" variant="tonal">{{
            filteredEntries.length
          }}</v-chip>
        </div>
        <v-btn
          color="primary"
          variant="tonal"
          size="small"
          rounded="lg"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          Ajouter manuellement
        </v-btn>
      </v-card-title>

      <!-- Filtres -->
      <v-card-text class="pa-4 pt-0">
        <v-row dense class="mb-3">
          <v-col cols="12" sm="4">
            <v-select
              v-model="filterProjectId"
              :items="[{ id: null, name: 'Tous les projets' }, ...activeProjects]"
              item-title="name"
              item-value="id"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              prepend-inner-icon="mdi-folder-outline"
            />
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              v-model="filterActivityId"
              :items="[{ id: null, name: 'Toutes les activités' }, ...activeActivities]"
              item-title="name"
              item-value="id"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              prepend-inner-icon="mdi-tag-outline"
            />
          </v-col>
          <v-col cols="12" sm="4">
            <search-bar v-model="filterKeywords" placeholder="Filtrer par commentaire…" />
          </v-col>
        </v-row>

        <!-- Liste avec transitions -->
        <div v-if="loadingEntries" class="text-center py-6">
          <v-progress-circular indeterminate color="primary" size="32" />
        </div>

        <div v-else-if="filteredEntries.length === 0" class="text-center py-6 text-medium-emphasis">
          <v-icon size="40" class="mb-2">mdi-clock-remove-outline</v-icon>
          <p class="text-body-2">Aucune entrée pour aujourd'hui</p>
        </div>

        <transition-group v-else name="list" tag="div" class="d-flex flex-column ga-2">
          <time-entry-card
            v-for="entry in filteredEntries"
            :key="entry.id"
            :entry="entry"
            @edit="openEditDialog(entry)"
            @delete="openDeleteDialog(entry)"
          />
        </transition-group>
      </v-card-text>
    </v-card>

    <!-- ───── Dialog Créer / Modifier ───── -->
    <time-entry-form-dialog
      v-model="entryDialog"
      :form="entryForm"
      :active-projects="activeProjects"
      :active-activities="activeActivities"
      :is-editing="!!editingEntry"
      :saving="savingEntry"
      @update:form="entryForm = $event"
      @save="saveEntry"
    />

    <!-- ───── Dialog Supprimer ───── -->
    <confirm-dialog
      :model-value="deleteDialog"
      title="Supprimer l'entrée"
      message="Cette action est irréversible. Voulez-vous vraiment supprimer cette entrée ?"
      confirm-label="Supprimer"
      @update:model-value="deleteDialog = $event"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script>
import { useTimeTracker } from '@/composables/useTimeTracker'
import TimeEntryCard from '@/components/common/TimeEntryCard.vue'
import SearchBar from '@/components/common/SearchBar.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import TimeEntryFormDialog from './TimeEntryFormDialog.vue'

export default {
  name: 'TimeTrackerPanel',
  components: { TimeEntryCard, SearchBar, ConfirmDialog, TimeEntryFormDialog },
  setup() {
    return useTimeTracker()
  },
}
</script>

<style scoped>
.pulse-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #4caf50;
  box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.7);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(76, 175, 80, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(76, 175, 80, 0);
  }
}

.current-activity-banner {
  border-color: #4caf50 !important;
  background-color: #f1f8f1 !important;
}

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

/* Transition fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
