<template>
  <v-card elevation="0" rounded="lg" border class="time-entry-card pa-1">
    <v-card-text class="pa-3">
      <div class="d-flex align-center ga-3 flex-wrap">
        <!-- Couleur activité + badges -->
        <div class="d-flex align-center ga-2 flex-grow-1 flex-wrap">
          <!-- Pastille couleur activité -->
          <span class="activity-dot flex-shrink-0" :style="{ backgroundColor: activityColor }" />

          <!-- Projet -->
          <v-chip
            size="x-small"
            color="primary"
            variant="tonal"
            prepend-icon="mdi-folder-outline"
            :title="entry.project_id"
          >
            {{ projectName }}
          </v-chip>

          <!-- Activité -->
          <v-chip
            size="x-small"
            variant="tonal"
            :color="activityColor || 'secondary'"
            prepend-icon="mdi-tag-outline"
          >
            {{ activityName }}
          </v-chip>

          <!-- Heures -->
          <v-chip size="x-small" variant="outlined" prepend-icon="mdi-timer-outline">
            <duration-display :start="entry.start" :end="entry.end" size="sm" />
          </v-chip>

          <!-- Heure début → fin -->
          <span class="text-caption text-medium-emphasis">
            <span v-date-format:time="entry.start" />
            →
            <span v-if="entry.end" v-date-format:time="entry.end" />
            <v-chip v-else size="x-small" color="success" variant="tonal" class="ml-1"
              >En cours</v-chip
            >
          </span>
        </div>

        <!-- Actions -->
        <div class="d-flex align-center ga-1 flex-shrink-0">
          <v-btn
            icon="mdi-pencil-outline"
            size="x-small"
            variant="text"
            color="primary"
            @click="$emit('edit', entry)"
          />
          <v-btn
            icon="mdi-delete-outline"
            size="x-small"
            variant="text"
            color="error"
            @click="$emit('delete', entry)"
          />
        </div>
      </div>

      <!-- Commentaire -->
      <div v-if="entry.comment" class="mt-2 text-caption text-medium-emphasis comment-text">
        <v-icon size="12" class="mr-1">mdi-comment-text-outline</v-icon>
        {{ entry.comment }}
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { computed } from 'vue'
import DurationDisplay from './DurationDisplay.vue'
import { useProjectsStore } from '@/stores/projectsStore'
import { useActivitiesStore } from '@/stores/activitiesStore'

export default {
  name: 'TimeEntryCard',
  components: { DurationDisplay },
  props: {
    entry: {
      type: Object,
      required: true,
    },
  },
  emits: ['edit', 'delete'],
  setup(props) {
    const projectsStore = useProjectsStore()
    const activitiesStore = useActivitiesStore()

    const projectName = computed(() => {
      const proj = projectsStore.projects.find((p) => p.id === props.entry.project_id)
      return proj?.name || '—'
    })

    const activityName = computed(() => {
      const act = activitiesStore.activities.find((a) => a.id === props.entry.activity_id)
      return act?.name || '—'
    })

    const activityColor = computed(() => {
      const act = activitiesStore.activities.find((a) => a.id === props.entry.activity_id)
      return act?.color || '#9E9E9E'
    })

    return { projectName, activityName, activityColor }
  },
}
</script>

<style scoped>
.activity-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.comment-text {
  white-space: pre-line;
  word-break: break-word;
  border-left: 2px solid rgba(0, 0, 0, 0.1);
  padding-left: 8px;
}

.time-entry-card {
  transition: box-shadow 0.2s ease;
}
.time-entry-card:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}
</style>
