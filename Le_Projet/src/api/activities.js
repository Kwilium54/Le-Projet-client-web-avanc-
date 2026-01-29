import { axiosInstance } from '@/plugins/axios'

// Récupérer toutes les activités avec filtres optionnels
export async function getActivities(filters = {}) {
  const response = await axiosInstance.get('/api/activities', { params: filters })
  return response.data
}

// Récupérer une activité par ID
export async function getActivityById(id) {
  const response = await axiosInstance.get(`/api/activities/${id}`)
  return response.data
}

// Créer une activité
export async function createActivity(activityData) {
  const response = await axiosInstance.post('/api/activities', activityData)
  return response.data
}

// Mettre à jour une activité
export async function updateActivity(id, activityData) {
  const response = await axiosInstance.put(`/api/activities/${id}`, activityData)
  return response.data
}

// Désactiver une activité
export async function disableActivity(id) {
  const response = await axiosInstance.patch(`/api/activities/${id}/disable`)
  return response.data
}

// Activer une activité
export async function enableActivity(id) {
  const response = await axiosInstance.patch(`/api/activities/${id}/enable`)
  return response.data
}
