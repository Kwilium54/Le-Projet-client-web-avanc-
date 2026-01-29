import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getTimeEntries, createTimeEntry, updateTimeEntry, deleteTimeEntry, stopTimeEntry } from '@/api/timeEntries'

export const useTimeEntriesStore = defineStore('timeEntries', () => {
  const timeEntries = ref([])
  const loading = ref(false)
  const currentEntry = ref(null)

  async function fetchTimeEntries(filters = {}) {
    loading.value = true
    try {
      const data = await getTimeEntries(filters)
      timeEntries.value = data
      return data
    } catch (error) {
      console.error('Erreur lors du chargement des time entries:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function addTimeEntry(entryData) {
    loading.value = true
    try {
      const newEntry = await createTimeEntry(entryData)
      timeEntries.value.unshift(newEntry)
      if (!newEntry.end) {
        currentEntry.value = newEntry
      }
      return newEntry
    } catch (error) {
      console.error('Erreur lors de la création de l\'entrée:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function editTimeEntry(id, entryData) {
    loading.value = true
    try {
      const updatedEntry = await updateTimeEntry(id, entryData)
      const index = timeEntries.value.findIndex((e) => e.id === id)
      if (index !== -1) {
        timeEntries.value[index] = updatedEntry
      }
      if (currentEntry.value?.id === id) {
        currentEntry.value = updatedEntry
      }
      return updatedEntry
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'entrée:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function removeTimeEntry(id) {
    loading.value = true
    try {
      await deleteTimeEntry(id)
      const index = timeEntries.value.findIndex((e) => e.id === id)
      if (index !== -1) {
        timeEntries.value.splice(index, 1)
      }
      if (currentEntry.value?.id === id) {
        currentEntry.value = null
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'entrée:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function stopCurrentEntry() {
    if (!currentEntry.value) return
    loading.value = true
    try {
      const stoppedEntry = await stopTimeEntry(currentEntry.value.id)
      const index = timeEntries.value.findIndex((e) => e.id === stoppedEntry.id)
      if (index !== -1) {
        timeEntries.value[index] = stoppedEntry
      }
      currentEntry.value = null
      return stoppedEntry
    } catch (error) {
      console.error('Erreur lors de l\'arrêt de l\'entrée:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const todayTotalHours = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    const todayEntries = timeEntries.value.filter(entry => {
      const entryDate = entry.start?.split(' ')[0]
      return entryDate === today
    })

    let totalSeconds = 0
    todayEntries.forEach(entry => {
      if (entry.start && entry.end) {
        const start = new Date(entry.start)
        const end = new Date(entry.end)
        totalSeconds += (end - start) / 1000
      }
    })

    if (currentEntry.value && currentEntry.value.start) {
      const start = new Date(currentEntry.value.start)
      const now = new Date()
      totalSeconds += (now - start) / 1000
    }

    return (totalSeconds / 3600).toFixed(2)
  })

  return {
    timeEntries,
    loading,
    currentEntry,
    todayTotalHours,
    fetchTimeEntries,
    addTimeEntry,
    editTimeEntry,
    removeTimeEntry,
    stopCurrentEntry,
  }
}, {
  persist: {
    paths: ['currentEntry'],
  }
})
