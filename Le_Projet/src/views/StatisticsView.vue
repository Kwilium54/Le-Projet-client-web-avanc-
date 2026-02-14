<template>
  <v-container class="py-6" fluid>
    <!-- ──────────── Titre ──────────── -->
    <div class="d-flex align-center justify-space-between flex-wrap gap-3 mb-6">
      <h1 class="text-h5 font-weight-bold d-flex align-center">
        <v-icon class="mr-2" color="primary">mdi-chart-bar</v-icon>
        Statistiques
      </h1>
    </div>

    <!-- ──────────── Filtres ──────────── -->
    <v-card elevation="1" rounded="lg" class="mb-6 pa-4">
      <v-row dense align="center">
        <v-col cols="12" sm="3" md="2">
          <v-text-field
            v-model="filters.from"
            label="Du"
            type="date"
            variant="outlined"
            density="compact"
            hide-details
            prepend-inner-icon="mdi-calendar-start"
          />
        </v-col>
        <v-col cols="12" sm="3" md="2">
          <v-text-field
            v-model="filters.to"
            label="Au"
            type="date"
            variant="outlined"
            density="compact"
            hide-details
            prepend-inner-icon="mdi-calendar-end"
          />
        </v-col>
        <v-col cols="12" sm="4" md="3">
          <v-select
            v-model="filters.projectId"
            :items="projectOptions"
            item-title="name"
            item-value="id"
            label="Projet (tous)"
            variant="outlined"
            density="compact"
            hide-details
            clearable
          />
        </v-col>
        <v-col cols="12" sm="auto" class="d-flex gap-2 flex-wrap">
          <v-btn size="small" variant="tonal" @click="setRange('today')">Aujourd'hui</v-btn>
          <v-btn size="small" variant="tonal" @click="setRange('week')">Cette semaine</v-btn>
          <v-btn size="small" variant="tonal" @click="setRange('month')">Ce mois</v-btn>
        </v-col>
        <v-col cols="auto" class="ml-auto">
          <v-btn
            color="primary"
            variant="flat"
            size="small"
            :loading="loading"
            prepend-icon="mdi-magnify"
            @click="loadStats"
          >
            Filtrer
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- ──────────── KPIs ──────────── -->
    <v-row class="mb-6" dense>
      <v-col cols="6" sm="3">
        <v-card elevation="1" rounded="lg" class="text-center pa-4">
          <div class="text-h4 font-weight-bold text-primary">{{ kpis.totalHours }}</div>
          <div class="text-caption text-medium-emphasis mt-1">Heures travaillées</div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card elevation="1" rounded="lg" class="text-center pa-4">
          <div class="text-h4 font-weight-bold text-primary">{{ kpis.totalEntries }}</div>
          <div class="text-caption text-medium-emphasis mt-1">Entrées</div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card elevation="1" rounded="lg" class="text-center pa-4">
          <div class="text-h4 font-weight-bold text-primary">{{ kpis.projectsCount }}</div>
          <div class="text-caption text-medium-emphasis mt-1">Projets concernés</div>
        </v-card>
      </v-col>
      <v-col cols="6" sm="3">
        <v-card elevation="1" rounded="lg" class="text-center pa-4">
          <div class="text-subtitle-1 font-weight-bold text-truncate px-1">
            {{ kpis.topActivity || '—' }}
          </div>
          <div class="text-caption text-medium-emphasis mt-1">Activité principale</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- ──────────── Charts ──────────── -->
    <v-row class="mb-6" dense>
      <!-- Bar chart: heures/jour -->
      <v-col cols="12" md="6">
        <v-card elevation="1" rounded="lg" class="pa-4" height="320">
          <div class="text-subtitle-2 font-weight-bold mb-3">
            <v-icon size="16" class="mr-1">mdi-chart-bar</v-icon>
            Heures par jour
          </div>
          <div
            v-if="chartDataBar.labels.length === 0"
            class="text-center text-medium-emphasis py-8 text-body-2"
          >
            Aucune donnée
          </div>
          <Bar v-else :data="chartDataBar" :options="barOptions" style="max-height: 240px" />
        </v-card>
      </v-col>

      <!-- Doughnut: par projet (masqué si un projet est sélectionné) -->
      <v-col v-if="!filters.projectId" cols="12" sm="6" md="3">
        <v-card elevation="1" rounded="lg" class="pa-4" height="320">
          <div class="text-subtitle-2 font-weight-bold mb-3">
            <v-icon size="16" class="mr-1">mdi-folder-outline</v-icon>
            Par projet
          </div>
          <div
            v-if="chartDataProjects.labels.length === 0"
            class="text-center text-medium-emphasis py-8 text-body-2"
          >
            Aucune donnée
          </div>
          <Doughnut
            v-else
            :data="chartDataProjects"
            :options="doughnutOptions"
            style="max-height: 240px"
          />
        </v-card>
      </v-col>

      <!-- Doughnut: par activité (plein écran si filtre projet actif) -->
      <v-col cols="12" :sm="filters.projectId ? 12 : 6" :md="filters.projectId ? 6 : 3">
        <v-card elevation="1" rounded="lg" class="pa-4" height="320">
          <div class="text-subtitle-2 font-weight-bold mb-3">
            <v-icon size="16" class="mr-1">mdi-tag-outline</v-icon>
            Par activité
          </div>
          <div
            v-if="chartDataActivities.labels.length === 0"
            class="text-center text-medium-emphasis py-8 text-body-2"
          >
            Aucune donnée
          </div>
          <Doughnut
            v-else
            :data="chartDataActivities"
            :options="doughnutOptions"
            style="max-height: 240px"
          />
        </v-card>
      </v-col>
    </v-row>

    <!-- ──────────── Liste paginée ──────────── -->
    <v-card elevation="1" rounded="lg">
      <v-card-title
        class="pa-4 text-subtitle-1 font-weight-bold d-flex align-center justify-space-between"
      >
        <span>
          <v-icon class="mr-2" size="18">mdi-format-list-bulleted</v-icon>
          Détail des entrées
        </span>
        <span class="text-caption text-medium-emphasis font-weight-regular">
          {{ totalEntries }} entrée{{ totalEntries !== 1 ? 's' : '' }}
        </span>
      </v-card-title>
      <v-divider />

      <v-progress-linear v-if="loading" indeterminate color="primary" />

      <v-card-text
        v-if="entries.length === 0 && !loading"
        class="text-center text-medium-emphasis py-8 text-body-2"
      >
        Aucune entrée dans cette période.
      </v-card-text>

      <v-list v-else lines="two">
        <v-list-item v-for="entry in entries" :key="entry.id" class="border-b">
          <template #prepend>
            <v-icon size="18" class="mr-1">mdi-clock-outline</v-icon>
          </template>
          <v-list-item-title class="d-flex align-center gap-2 flex-wrap">
            <v-chip size="x-small" color="primary" variant="tonal">{{
              projectName(entry.project_id)
            }}</v-chip>
            <v-chip size="x-small" :color="activityColor(entry.activity_id)" variant="tonal">{{
              activityName(entry.activity_id)
            }}</v-chip>
            <span class="text-caption text-medium-emphasis">{{ formatDuration(entry) }}</span>
          </v-list-item-title>
          <v-list-item-subtitle>
            {{ formatDateTime(entry.start) }}
            <span v-if="entry.comment" class="ml-2">· {{ entry.comment }}</span>
          </v-list-item-subtitle>
        </v-list-item>
      </v-list>

      <!-- Pagination -->
      <v-card-actions class="pa-4 justify-center" v-if="totalPages > 1">
        <v-pagination
          v-model="page"
          :length="totalPages"
          :total-visible="5"
          density="compact"
          rounded="circle"
          @update:model-value="loadEntries"
        />
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { Bar, Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js'
import { getTimeEntries } from '@/api/timeEntries'
import { useProjectsStore } from '@/stores/projectsStore'
import { useActivitiesStore } from '@/stores/activitiesStore'
import { calculateDurationInSeconds, secondsToHoursMinutes } from '@/utils/helpers'
import { dateFormatterMixin } from '@/mixins/dateFormatterMixin'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const ROWS_PER_PAGE = 15

const CHART_COLORS = [
  '#1976D2',
  '#4CAF50',
  '#FF9800',
  '#E91E63',
  '#9C27B0',
  '#00BCD4',
  '#FF5722',
  '#8BC34A',
  '#607D8B',
  '#F44336',
]

function getMonday(d) {
  const dt = new Date(d)
  const day = dt.getDay() || 7
  dt.setDate(dt.getDate() - day + 1)
  return dt.toISOString().split('T')[0]
}

function getFirstOfMonth(d) {
  const dt = new Date(d)
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-01`
}

function today() {
  return new Date().toISOString().split('T')[0]
}

export default {
  name: 'StatisticsView',
  components: { Bar, Doughnut },
  mixins: [dateFormatterMixin],

  setup() {
    const projectsStore = useProjectsStore()
    const activitiesStore = useActivitiesStore()

    //Filtres
    const filters = reactive({
      from: today(),
      to: today(),
      projectId: null,
    })

    //Pagination
    const page = ref(1)
    const totalEntries = ref(0)
    const totalPages = computed(() => Math.ceil(totalEntries.value / ROWS_PER_PAGE))

    //Data
    const loading = ref(false)
    const entries = ref([])
    const allEntries = ref([])

    //KPIs
    const kpis = computed(() => {
      const totalSec = allEntries.value
        .filter((e) => e.start && e.end)
        .reduce((acc, e) => acc + calculateDurationInSeconds(e.start, e.end), 0)

      const projectHours = {}
      const activityHours = {}
      allEntries.value
        .filter((e) => e.start && e.end)
        .forEach((e) => {
          const sec = calculateDurationInSeconds(e.start, e.end)
          if (e.project_id) projectHours[e.project_id] = (projectHours[e.project_id] || 0) + sec
          if (e.activity_id)
            activityHours[e.activity_id] = (activityHours[e.activity_id] || 0) + sec
        })

      const topProjId = Object.keys(projectHours).sort(
        (a, b) => projectHours[b] - projectHours[a],
      )[0]
      const topActId = Object.keys(activityHours).sort(
        (a, b) => activityHours[b] - activityHours[a],
      )[0]

      return {
        totalHours: secondsToHoursMinutes(totalSec),
        totalEntries: allEntries.value.length,
        projectsCount: Object.keys(projectHours).length,
        topProject: topProjId ? projectName(topProjId) : null,
        topActivity: topActId ? activityName(topActId) : null,
      }
    })

    //Chart data: bar heures/jour
    const chartDataBar = computed(() => {
      const dayMap = {}
      allEntries.value
        .filter((e) => e.start && e.end)
        .forEach((e) => {
          const day = e.start.split('T')[0] || e.start.split(' ')[0]
          const sec = calculateDurationInSeconds(e.start, e.end)
          dayMap[day] = (dayMap[day] || 0) + sec
        })
      const sorted = Object.keys(dayMap).sort()
      return {
        labels: sorted.map((d) => {
          const [y, m, day] = d.split('-')
          return `${day}/${m}/${y}`
        }),
        datasets: [
          {
            label: 'Heures',
            data: sorted.map((d) => +(dayMap[d] / 3600).toFixed(2)),
            backgroundColor: '#1976D2',
            borderRadius: 4,
          },
        ],
      }
    })

    //Chart data: doughnut projets
    const chartDataProjects = computed(() => {
      const map = {}
      allEntries.value
        .filter((e) => e.start && e.end && e.project_id)
        .forEach((e) => {
          const sec = calculateDurationInSeconds(e.start, e.end)
          map[e.project_id] = (map[e.project_id] || 0) + sec
        })
      const ids = Object.keys(map)
      return {
        labels: ids.map(projectName),
        datasets: [
          {
            data: ids.map((id) => +(map[id] / 3600).toFixed(2)),
            backgroundColor: ids.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]),
            borderWidth: 1,
          },
        ],
      }
    })

    //Chart data: doughnut activités
    const chartDataActivities = computed(() => {
      const map = {}
      allEntries.value
        .filter((e) => e.start && e.end && e.activity_id)
        .forEach((e) => {
          const sec = calculateDurationInSeconds(e.start, e.end)
          map[e.activity_id] = (map[e.activity_id] || 0) + sec
        })
      const ids = Object.keys(map)
      return {
        labels: ids.map(activityName),
        datasets: [
          {
            data: ids.map((id) => +(map[id] / 3600).toFixed(2)),
            backgroundColor: ids.map((id) => {
              const a = activitiesStore.activities.find((a) => String(a.id) === String(id))
              return a?.color || CHART_COLORS[ids.indexOf(id) % CHART_COLORS.length]
            }),
            borderWidth: 1,
          },
        ],
      }
    })

    //Chart options
    const barOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, title: { display: true, text: 'Heures' } } },
    }
    const doughnutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 11 } } } },
    }

    //Helpers
    const projectName = (id) => {
      const p = projectsStore.projects.find((p) => String(p.id) === String(id))
      return p?.name || `#${id}`
    }
    const activityName = (id) => {
      const a = activitiesStore.activities.find((a) => String(a.id) === String(id))
      return a?.name || `#${id}`
    }
    const activityColor = (id) => {
      const a = activitiesStore.activities.find((a) => String(a.id) === String(id))
      return a?.color || 'primary'
    }
    const formatDuration = (entry) => {
      if (!entry.start || !entry.end) return '…'
      return secondsToHoursMinutes(calculateDurationInSeconds(entry.start, entry.end))
    }
    //Projets disponibles pour le filtre
    const projectOptions = computed(() => projectsStore.projects.filter((p) => !p.disabled))

    //Chargement
    const loadEntries = async () => {
      loading.value = true
      const params = {
        from: filters.from,
        to: filters.to,
        page: page.value,
        rowsPerPage: ROWS_PER_PAGE,
      }
      if (filters.projectId) params.project_id = filters.projectId
      try {
        const data = await getTimeEntries(params)
        if (Array.isArray(data)) {
          entries.value = data
          totalEntries.value = data.length
        } else {
          entries.value = data.data || []
          totalEntries.value = data.total || entries.value.length
        }
      } finally {
        loading.value = false
      }
    }

    const loadAllForCharts = async () => {
      const params = { from: filters.from, to: filters.to, rowsPerPage: 500 }
      if (filters.projectId) params.project_id = filters.projectId
      try {
        const data = await getTimeEntries(params)
        allEntries.value = Array.isArray(data) ? data : data.data || []
      } catch {
        allEntries.value = []
      }
    }

    const loadStats = async () => {
      page.value = 1
      await Promise.all([loadEntries(), loadAllForCharts()])
    }

    //Raccourcis période
    const setRange = (preset) => {
      const t = today()
      if (preset === 'today') {
        filters.from = t
        filters.to = t
      } else if (preset === 'week') {
        filters.from = getMonday(new Date())
        filters.to = t
      } else if (preset === 'month') {
        filters.from = getFirstOfMonth(new Date())
        filters.to = t
      }
    }

    onMounted(async () => {
      if (projectsStore.projects.length === 0) await projectsStore.fetchProjects()
      if (activitiesStore.activities.length === 0) await activitiesStore.fetchActivities()
      await loadStats()
    })

    return {
      filters,
      page,
      totalEntries,
      totalPages,
      loading,
      entries,
      kpis,
      chartDataBar,
      chartDataProjects,
      chartDataActivities,
      barOptions,
      doughnutOptions,
      projectOptions,
      projectName,
      activityName,
      activityColor,
      formatDuration,
      setRange,
      loadStats,
      loadEntries,
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
.border-b {
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}
</style>
