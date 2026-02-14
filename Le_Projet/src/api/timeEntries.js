import { axiosInstance } from '@/plugins/axios'

// Récupérer toutes les time entries avec filtres optionnels
export async function getTimeEntries(filters = {}) {
  const response = await axiosInstance.get('/api/time-entries', { params: filters })
  return response.data
}

// Récupérer une time entry par ID
export async function getTimeEntryById(id) {
  const response = await axiosInstance.get(`/api/time-entries/${id}`)
  return response.data
}

// Créer une time entry
export async function createTimeEntry(entryData) {
  const response = await axiosInstance.post('/api/time-entries', entryData)
  return response.data
}

// Mettre à jour une time entry
export async function updateTimeEntry(id, entryData) {
  const response = await axiosInstance.put(`/api/time-entries/${id}`, entryData)
  return response.data
}

// Supprimer une time entry
export async function deleteTimeEntry(id) {
  const response = await axiosInstance.delete(`/api/time-entries/${id}`)
  return response.data
}

// Stopper une time entry
export async function stopTimeEntry(id) {
  const response = await axiosInstance.patch(`/api/time-entries/${id}/stop`)
  return response.data
}
