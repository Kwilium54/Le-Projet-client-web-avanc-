import { axiosInstance } from '@/plugins/axios'

// Récupérer tous les projets avec filtres optionnels
export async function getProjects(filters = {}) {
  const response = await axiosInstance.get('/api/projects', { params: filters })
  return response.data
}

// Récupérer un projet par ID
export async function getProjectById(id) {
  const response = await axiosInstance.get(`/api/projects/${id}`)
  return response.data
}

// Créer un projet
export async function createProject(projectData) {
  const response = await axiosInstance.post('/api/projects', projectData)
  return response.data
}

// Mettre à jour un projet
export async function updateProject(id, projectData) {
  const response = await axiosInstance.put(`/api/projects/${id}`, projectData)
  return response.data
}

// Désactiver un projet
export async function disableProject(id) {
  const response = await axiosInstance.patch(`/api/projects/${id}/disable`)
  return response.data
}

// Activer un projet
export async function enableProject(id) {
  const response = await axiosInstance.patch(`/api/projects/${id}/enable`)
  return response.data
}
