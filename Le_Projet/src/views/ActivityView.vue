<template>
  <v-container fluid class="pa-4 pa-md-6">
    <div class="d-flex align-center ga-2 mb-5">
      <v-icon color="primary" size="28">mdi-view-dashboard-outline</v-icon>
      <h1 class="text-h5 font-weight-bold">Activité du jour</h1>
      <v-chip size="small" color="primary" variant="tonal">{{ todayFormatted }}</v-chip>
    </div>

    <v-row>
      <v-col cols="12" lg="7" xl="8">
        <time-tracker-panel />
      </v-col>
      <v-col cols="12" lg="5" xl="4">
        <objectives-panel />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { computed } from 'vue'
import TimeTrackerPanel from '@/components/time/TimeTrackerPanel.vue'
import ObjectivesPanel from '@/components/objectives/ObjectivesPanel.vue'

export default {
  name: 'ActivityView',
  components: { TimeTrackerPanel, ObjectivesPanel },
  setup() {
    const todayFormatted = computed(() =>
      new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }),
    )
    return { todayFormatted }
  },
}
</script>
