<template>
  <v-app-bar color="primary" elevation="3" height="64">
    <!-- Logo -->
    <v-app-bar-title class="flex-shrink-0" style="min-width: 110px; max-width: 130px">
      <router-link
        to="/app/activity"
        class="text-decoration-none text-white d-flex align-center ga-2"
      >
        <v-icon size="22">mdi-clock-fast</v-icon>
        <span class="font-weight-bold text-subtitle-1">Timely</span>
      </router-link>
    </v-app-bar-title>

    <!-- Activité en cours (centre) -->
    <div class="flex-grow-1 d-flex align-center justify-center">
      <transition name="fade" mode="out-in">
        <div v-if="currentEntry" key="active" class="d-flex align-center ga-3">
          <!-- Indicateur animé -->
          <span class="pulse-dot" />

          <!-- Infos projet / activité -->
          <div class="d-flex flex-column" style="line-height: 1.2">
            <span class="text-white text-body-2 font-weight-bold">
              {{ currentProject?.name || '—' }}
            </span>
            <span class="text-white text-caption" style="opacity: 0.85">
              {{ currentActivity?.name || '—' }}
            </span>
          </div>

          <!-- Durée -->
          <v-chip
            color="white"
            text-color="primary"
            size="small"
            variant="elevated"
            prepend-icon="mdi-timer-outline"
            class="font-weight-bold"
          >
            {{ liveDuration }}
          </v-chip>

          <!-- Bouton stop -->
          <v-btn
            icon="mdi-stop-circle-outline"
            color="error"
            variant="tonal"
            size="small"
            :loading="stopping"
            @click="handleStop"
          />
        </div>

        <div v-else key="idle" class="d-flex align-center ga-2 text-white" style="opacity: 0.7">
          <v-icon size="18">mdi-clock-outline</v-icon>
          <span class="text-body-2">Aucune activité en cours</span>
        </div>
      </transition>
    </div>

    <!-- Compteurs + navigation (droite) -->
    <template #append>
      <!-- Heures aujourd'hui -->
      <v-chip
        color="white"
        variant="tonal"
        size="small"
        prepend-icon="mdi-clock-check-outline"
        class="mr-1 text-white"
        :title="'Heures travaillées aujourd\'hui'"
      >
        {{ todayHours }}h
      </v-chip>

      <!-- Objectifs -->
      <v-chip
        color="white"
        variant="tonal"
        size="small"
        prepend-icon="mdi-checkbox-marked-circle-outline"
        class="mr-3 text-white"
        :title="'Objectifs atteints aujourd\'hui'"
      >
        {{ objectivesCount.done }}/{{ objectivesCount.total }}
      </v-chip>

      <v-divider vertical class="mx-1 border-opacity-30" color="white" />

      <!-- Navigation -->
      <v-btn
        :variant="isActive('/app/activity') ? 'tonal' : 'text'"
        color="white"
        size="small"
        prepend-icon="mdi-view-dashboard-outline"
        to="/app/activity"
        class="ml-1"
      >
        Activité
      </v-btn>

      <v-btn
        :variant="isActive('/app/stats') ? 'tonal' : 'text'"
        color="white"
        size="small"
        prepend-icon="mdi-chart-bar"
        to="/app/stats"
      >
        Stats
      </v-btn>

      <v-btn
        :variant="isActive('/app/settings') ? 'tonal' : 'text'"
        color="white"
        size="small"
        prepend-icon="mdi-cog-outline"
        to="/app/settings"
      >
        Paramètres
      </v-btn>

      <v-divider vertical class="mx-1 border-opacity-30" color="white" />

      <!-- Utilisateur + déconnexion -->
      <v-menu location="bottom end" :close-on-content-click="true">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            color="white"
            variant="tonal"
            size="small"
            prepend-icon="mdi-account-circle-outline"
            append-icon="mdi-chevron-down"
            class="ml-1"
          >
            {{ authStore.user?.name?.split(' ')[0] || 'Profil' }}
          </v-btn>
        </template>
        <v-list density="compact" rounded="lg" min-width="180">
          <v-list-item
            prepend-icon="mdi-account-outline"
            title="Mon profil"
            to="/app/settings/profile"
          />
          <v-divider class="my-1" />
          <v-list-item
            prepend-icon="mdi-logout"
            title="Déconnexion"
            base-color="error"
            @click="handleLogout"
          />
        </v-list>
      </v-menu>
    </template>
  </v-app-bar>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useTimeEntriesStore } from '@/stores/timeEntriesStore'
import { useObjectivesStore } from '@/stores/objectivesStore'
import { useProjectsStore } from '@/stores/projectsStore'
import { useActivitiesStore } from '@/stores/activitiesStore'
import { toast } from 'vue3-toastify'
import { TOAST_OPTIONS } from '@/utils/constants'

export default {
  name: 'AppHeader',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const authStore = useAuthStore()
    const timeEntriesStore = useTimeEntriesStore()
    const objectivesStore = useObjectivesStore()
    const projectsStore = useProjectsStore()
    const activitiesStore = useActivitiesStore()

    const stopping = ref(false)
    const ticker = ref(0)
    let timerInterval = null

    // Récupère l'entrée en cours depuis le store
    const currentEntry = computed(() => timeEntriesStore.currentEntry)

    // Projet / activité associés à l'entrée courante
    const currentProject = computed(
      () => projectsStore.projects.find((p) => p.id === currentEntry.value?.project_id) || null,
    )
    const currentActivity = computed(
      () =>
        activitiesStore.activities.find((a) => a.id === currentEntry.value?.activity_id) || null,
    )

    // Durée live de l'entrée en cours
    const liveDuration = computed(() => {
      void ticker.value
      if (!currentEntry.value?.start) return '0h 00m'
      const start = new Date(currentEntry.value.start)
      const diffMs = new Date() - start
      const totalSeconds = Math.floor(diffMs / 1000)
      const h = Math.floor(totalSeconds / 3600)
      const m = Math.floor((totalSeconds % 3600) / 60)
      const s = totalSeconds % 60
      if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
      return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
    })

    // Heures totales aujourd'hui (arrondi à 2 décimales)
    const todayHours = computed(() => {
      void ticker.value
      return timeEntriesStore.todayTotalHours
    })

    // Compteur objectifs
    const objectivesCount = computed(() => objectivesStore.todayObjectivesCount)

    const isActive = (path) => route.path.startsWith(path)

    // Charger les données nécessaires au header
    const loadHeaderData = async () => {
      const today = new Date().toISOString().split('T')[0]
      await Promise.all([
        // Entrées du jour pour le total d'heures + détecter l'entrée en cours
        timeEntriesStore.fetchTimeEntries({ from: today, to: today }),
        // Objectifs du jour
        objectivesStore.fetchObjectives({ date: today }),
        // Projets & activités pour les noms
        projectsStore.projects.length === 0 ? projectsStore.fetchProjects() : Promise.resolve(),
        activitiesStore.activities.length === 0
          ? activitiesStore.fetchActivities()
          : Promise.resolve(),
      ])

      // Détecter l'entrée en cours (end = null) parmi les entries chargées
      const openEntry = timeEntriesStore.timeEntries.find((e) => !e.end)
      if (openEntry) {
        timeEntriesStore.currentEntry = openEntry
      }
    }

    // Stopper l'activité courante
    const handleStop = async () => {
      stopping.value = true
      try {
        await timeEntriesStore.stopCurrentEntry()
        toast.success('Activité stoppée', TOAST_OPTIONS)
        // Recharger les données pour mettre à jour les totaux
        const today = new Date().toISOString().split('T')[0]
        await timeEntriesStore.fetchTimeEntries({ from: today, to: today })
      } catch {
        // L'erreur est déjà gérée par l'intercepteur axios
      } finally {
        stopping.value = false
      }
    }

    const handleLogout = () => {
      if (timerInterval) clearInterval(timerInterval)
      authStore.logout()
      toast.info('Déconnexion réussie', TOAST_OPTIONS)
      router.push('/login')
    }

    onMounted(async () => {
      await loadHeaderData()
      // Tick toutes les secondes pour animer la durée
      timerInterval = setInterval(() => {
        ticker.value++
        // Recalculer todayTotalHours aussi si entrée en cours
      }, 1000)
    })

    onUnmounted(() => {
      if (timerInterval) clearInterval(timerInterval)
    })

    return {
      authStore,
      currentEntry,
      currentProject,
      currentActivity,
      liveDuration,
      todayHours,
      objectivesCount,
      stopping,
      isActive,
      handleStop,
      handleLogout,
    }
  },
}
</script>

<style scoped>
/* Point clignotant pour l'activité en cours */
.pulse-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #69f0ae;
  box-shadow: 0 0 0 0 rgba(105, 240, 174, 0.7);
  animation: pulse 1.5s infinite;
  flex-shrink: 0;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(105, 240, 174, 0.7);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(105, 240, 174, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(105, 240, 174, 0);
  }
}

/* Transition fade pour le switch activité en cours / aucune activité */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
