import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getActivities, createActivity, updateActivity, enableActivity, disableActivity } from '@/api/activities'

export const useActivitiesStore = defineStore('activities', () => {
  const activities = ref([])
  const loading = ref(false)
  const currentActivity = ref(null)

  async function fetchActivities(filters = {}) {
    loading.value = true
    try {
      const data = await getActivities(filters)
      activities.value = data
      return data
    } catch (error) {
      console.error('Erreur lors du chargement des activités:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function addActivity(activityData) {
    loading.value = true
    try {
      const newActivity = await createActivity(activityData)
      activities.value.push(newActivity)
      return newActivity
    } catch (error) {
      console.error('Erreur lors de la création de l\'activité:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function editActivity(id, activityData) {
    loading.value = true
    try {
      const updatedActivity = await updateActivity(id, activityData)
      const index = activities.value.findIndex((a) => a.id === id)
      if (index !== -1) {
        activities.value[index] = updatedActivity
      }
      return updatedActivity
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'activité:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function disableActivityById(id) {
    loading.value = true
    try {
      await disableActivity(id)
      const activity = activities.value.find((a) => a.id === id)
      if (activity) {
        activity.disabled = true
      }
    } catch (error) {
      console.error('Erreur lors de la désactivation de l\'activité:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function enableActivityById(id) {
    loading.value = true
    try {
      await enableActivity(id)
      const activity = activities.value.find((a) => a.id === id)
      if (activity) {
        activity.disabled = false
      }
    } catch (error) {
      console.error('Erreur lors de l\'activation de l\'activité:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  function getActiveActivities() {
    return activities.value.filter((a) => !a.disabled)
  }

  return {
    activities,
    loading,
    currentActivity,
    fetchActivities,
    addActivity,
    editActivity,
    disableActivityById,
    enableActivityById,
    getActiveActivities,
  }
})
