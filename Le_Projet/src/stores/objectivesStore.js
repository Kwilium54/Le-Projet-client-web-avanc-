import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getObjectives, createObjective, updateObjective, deleteObjective, markObjectiveDone, markObjectiveUndone } from '@/api/objectives'

export const useObjectivesStore = defineStore('objectives', () => {
  const objectives = ref([])
  const loading = ref(false)

  async function fetchObjectives(filters = {}) {
    loading.value = true
    try {
      const data = await getObjectives(filters)
      objectives.value = data
      return data
    } catch (error) {
      console.error('Erreur lors du chargement des objectifs:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function addObjective(objectiveData) {
    loading.value = true
    try {
      const newObjective = await createObjective(objectiveData)
      objectives.value.unshift(newObjective)
      return newObjective
    } catch (error) {
      console.error('Erreur lors de la création de l\'objectif:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function editObjective(id, objectiveData) {
    loading.value = true
    try {
      const updatedObjective = await updateObjective(id, objectiveData)
      const index = objectives.value.findIndex((o) => o.id === id)
      if (index !== -1) {
        objectives.value[index] = updatedObjective
      }
      return updatedObjective
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'objectif:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function removeObjective(id) {
    loading.value = true
    try {
      await deleteObjective(id)
      const index = objectives.value.findIndex((o) => o.id === id)
      if (index !== -1) {
        objectives.value.splice(index, 1)
      }
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'objectif:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function markAsDone(id) {
    loading.value = true
    try {
      await markObjectiveDone(id)
      const objective = objectives.value.find((o) => o.id === id)
      if (objective) {
        objective.done = true
      }
    } catch (error) {
      console.error('Erreur lors du marquage de l\'objectif:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function markAsUndone(id) {
    loading.value = true
    try {
      await markObjectiveUndone(id)
      const objective = objectives.value.find((o) => o.id === id)
      if (objective) {
        objective.done = false
      }
    } catch (error) {
      console.error('Erreur lors du dé-marquage de l\'objectif:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  const todayObjectivesCount = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    const todayObjectives = objectives.value.filter(obj => {
      const objDate = obj.date?.split(' ')[0]
      return objDate === today
    })
    
    const doneCount = todayObjectives.filter(obj => obj.done).length
    const totalCount = todayObjectives.length
    
    return { done: doneCount, total: totalCount }
  })

  return {
    objectives,
    loading,
    todayObjectivesCount,
    fetchObjectives,
    addObjective,
    editObjective,
    removeObjective,
    markAsDone,
    markAsUndone,
  }
})
