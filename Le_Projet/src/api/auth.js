import { axiosInstance } from '@/plugins/axios'

// Vérifier que l'API est accessible
export async function pingApi() {
  const response = await axiosInstance.get('/api/ping')
  return response.data
}

// Créer un compte et obtenir une API KEY
export async function createApiKey(name, email) {
  const response = await axiosInstance.post('/api/apikeys', { name, email })
  return response.data
}

// Récupérer le profil utilisateur
export async function getProfile() {
  const response = await axiosInstance.get('/api/profile')
  return response.data
}

// Mettre à jour le profil
export async function updateProfile(name, email) {
  const response = await axiosInstance.put('/api/profile', { name, email })
  return response.data
}
