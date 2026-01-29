import { axiosInstance } from '@/plugins/axios'

// Récupérer tous les objectifs avec filtres optionnels
export async function getObjectives(filters = {}) {
  const response = await axiosInstance.get('/api/daily-objectives', { params: filters })
  return response.data
}

// Récupérer un objectif par ID
export async function getObjectiveById(id) {
  const response = await axiosInstance.get(`/api/daily-objectives/${id}`)
  return response.data
}

// Créer un objectif
export async function createObjective(objectiveData) {
  const response = await axiosInstance.post('/api/daily-objectives', objectiveData)
  return response.data
}

// Mettre à jour un objectif
export async function updateObjective(id, objectiveData) {
  const response = await axiosInstance.put(`/api/daily-objectives/${id}`, objectiveData)
  return response.data
}

// Supprimer un objectif
export async function deleteObjective(id) {
  const response = await axiosInstance.delete(`/api/daily-objectives/${id}`)
  return response.data
}

// Marquer un objectif comme accompli
export async function markObjectiveDone(id) {
  const response = await axiosInstance.patch(`/api/daily-objectives/${id}/done`)
  return response.data
}

// Marquer un objectif comme non accompli
export async function markObjectiveUndone(id) {
  const response = await axiosInstance.patch(`/api/daily-objectives/${id}/undone`)
  return response.data
}
