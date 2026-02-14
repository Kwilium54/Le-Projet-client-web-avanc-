import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTimeEntriesStore } from '@/stores/timeEntriesStore'
import { useProjectsStore } from '@/stores/projectsStore'
import { useActivitiesStore } from '@/stores/activitiesStore'
import { formatDateForApi } from '@/utils/helpers'
import { toast } from 'vue3-toastify'
import { TOAST_OPTIONS } from '@/utils/constants'

export function useTimeTracker() {
  const timeEntriesStore = useTimeEntriesStore()
  const projectsStore = useProjectsStore()
  const activitiesStore = useActivitiesStore()

  //Démarrage
  const selectedProjectId = ref(null)
  const selectedActivityId = ref(null)
  const starting = ref(false)
  const stopping = ref(false)
  const loadingEntries = ref(false)

  //Timer live
  const ticker = ref(0)
  let timerInterval = null

  //Commentaire en cours
  const currentComment = ref('')
  const savingComment = ref(false)

  //Filtres liste
  const filterProjectId = ref(null)
  const filterActivityId = ref(null)
  const filterKeywords = ref('')

  //Dialogs
  const entryDialog = ref(false)
  const deleteDialog = ref(false)
  const editingEntry = ref(null)
  const entryToDelete = ref(null)
  const savingEntry = ref(false)
  const entryForm = ref({ project_id: null, activity_id: null, start: '', end: '', comment: '' })

  //Computed
  const currentEntry = computed(() => timeEntriesStore.currentEntry)
  const activeProjects = computed(() => projectsStore.projects.filter((p) => !p.disabled))
  const activeActivities = computed(() => activitiesStore.activities.filter((a) => !a.disabled))

  const currentProjectName = computed(() => {
    return projectsStore.projects.find((p) => p.id === currentEntry.value?.project_id)?.name || '—'
  })
  const currentActivityName = computed(() => {
    return (
      activitiesStore.activities.find((a) => a.id === currentEntry.value?.activity_id)?.name || '—'
    )
  })
  const currentActivityColor = computed(() => {
    return (
      activitiesStore.activities.find((a) => a.id === currentEntry.value?.activity_id)?.color ||
      null
    )
  })

  const liveDuration = computed(() => {
    void ticker.value
    if (!currentEntry.value?.start) return '00m 00s'
    const diff = Math.floor((new Date() - new Date(currentEntry.value.start)) / 1000)
    const h = Math.floor(diff / 3600)
    const m = Math.floor((diff % 3600) / 60)
    const s = diff % 60
    if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
    return `${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`
  })

  const filteredEntries = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return timeEntriesStore.timeEntries
      .filter((e) => e.start?.split(' ')[0] === today || e.start?.split('T')[0] === today)
      .filter((e) => !filterProjectId.value || e.project_id === filterProjectId.value)
      .filter((e) => !filterActivityId.value || e.activity_id === filterActivityId.value)
      .filter((e) => {
        if (!filterKeywords.value) return true
        return e.comment?.toLowerCase().includes(filterKeywords.value.toLowerCase())
      })
  })

  //Helpers
  const toDatetimeLocal = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    const pad = (n) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  const reloadToday = () => {
    const today = new Date().toISOString().split('T')[0]
    return timeEntriesStore.fetchTimeEntries({ from: today, to: today })
  }

  //Chargement initial
  const loadData = async () => {
    loadingEntries.value = true
    try {
      await Promise.all([
        reloadToday(),
        projectsStore.projects.length === 0 ? projectsStore.fetchProjects() : Promise.resolve(),
        activitiesStore.activities.length === 0
          ? activitiesStore.fetchActivities()
          : Promise.resolve(),
      ])
      const open = timeEntriesStore.timeEntries.find((e) => !e.end)
      if (open) {
        timeEntriesStore.currentEntry = open
        currentComment.value = open.comment || ''
      }
    } finally {
      loadingEntries.value = false
    }
  }

  //Démarrer
  const handleStart = async () => {
    if (!selectedProjectId.value || !selectedActivityId.value) return
    starting.value = true
    try {
      await timeEntriesStore.addTimeEntry({
        project_id: selectedProjectId.value,
        activity_id: selectedActivityId.value,
      })
      currentComment.value = ''
      toast.success('Activité démarrée !', TOAST_OPTIONS)
    } finally {
      starting.value = false
    }
  }

  //Sauvegarder le commentaire
  const saveComment = async () => {
    if (!currentEntry.value || savingComment.value) return
    savingComment.value = true
    try {
      await timeEntriesStore.editTimeEntry(currentEntry.value.id, {
        project_id: currentEntry.value.project_id,
        activity_id: currentEntry.value.activity_id,
        start: currentEntry.value.start,
        comment: currentComment.value,
      })
    } catch {
      // géré par l'intercepteur
    } finally {
      savingComment.value = false
    }
  }

  //Stopper
  const handleStop = async () => {
    if (!currentEntry.value) return
    stopping.value = true
    try {
      if (currentComment.value) {
        await timeEntriesStore.editTimeEntry(currentEntry.value.id, {
          project_id: currentEntry.value.project_id,
          activity_id: currentEntry.value.activity_id,
          start: currentEntry.value.start,
          comment: currentComment.value,
        })
      }
      await timeEntriesStore.stopCurrentEntry()
      currentComment.value = ''
      await reloadToday()
      toast.success('Activité stoppée', TOAST_OPTIONS)
    } finally {
      stopping.value = false
    }
  }

  //Dialogs entrée
  const openCreateDialog = () => {
    editingEntry.value = null
    const now = toDatetimeLocal(new Date())
    entryForm.value = { project_id: null, activity_id: null, start: now, end: now, comment: '' }
    entryDialog.value = true
  }

  const openEditDialog = (entry) => {
    editingEntry.value = entry
    entryForm.value = {
      project_id: entry.project_id,
      activity_id: entry.activity_id,
      start: toDatetimeLocal(entry.start),
      end: toDatetimeLocal(entry.end),
      comment: entry.comment || '',
    }
    entryDialog.value = true
  }

  const openDeleteDialog = (entry) => {
    entryToDelete.value = entry
    deleteDialog.value = true
  }

  const saveEntry = async () => {
    if (!entryForm.value.project_id || !entryForm.value.activity_id) return
    savingEntry.value = true
    try {
      const payload = {
        project_id: entryForm.value.project_id,
        activity_id: entryForm.value.activity_id,
        comment: entryForm.value.comment || undefined,
      }
      if (entryForm.value.start) payload.start = formatDateForApi(entryForm.value.start)
      if (entryForm.value.end) payload.end = formatDateForApi(entryForm.value.end)

      if (editingEntry.value) {
        await timeEntriesStore.editTimeEntry(editingEntry.value.id, payload)
        toast.success('Entrée modifiée', TOAST_OPTIONS)
      } else {
        await timeEntriesStore.addTimeEntry(payload)
        toast.success('Entrée ajoutée', TOAST_OPTIONS)
      }
      entryDialog.value = false
      await reloadToday()
    } finally {
      savingEntry.value = false
    }
  }

  const confirmDelete = async () => {
    if (!entryToDelete.value) return
    try {
      await timeEntriesStore.removeTimeEntry(entryToDelete.value.id)
      toast.success('Entrée supprimée', TOAST_OPTIONS)
      await reloadToday()
    } finally {
      entryToDelete.value = null
    }
  }

  //Lifecycle
  onMounted(async () => {
    await loadData()
    timerInterval = setInterval(() => {
      ticker.value++
    }, 1000)
  })

  onUnmounted(() => {
    if (timerInterval) clearInterval(timerInterval)
  })

  return {
    // state
    selectedProjectId,
    selectedActivityId,
    starting,
    stopping,
    loadingEntries,
    currentComment,
    filterProjectId,
    filterActivityId,
    filterKeywords,
    entryDialog,
    deleteDialog,
    editingEntry,
    entryForm,
    savingEntry,
    // computed
    currentEntry,
    activeProjects,
    activeActivities,
    currentProjectName,
    currentActivityName,
    currentActivityColor,
    liveDuration,
    filteredEntries,
    // methods
    handleStart,
    handleStop,
    saveComment,
    openCreateDialog,
    openEditDialog,
    openDeleteDialog,
    saveEntry,
    confirmDelete,
  }
}
