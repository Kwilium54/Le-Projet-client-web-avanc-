// Utilitaire pour accéder aux variables d'environnement

export const env = {
  // URL de l'API
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://timely.edu.netlor.fr',
  
  // API Key pré-configurée (si définie dans .env)
  apiKey: import.meta.env.VITE_API_KEY || null,
  
  // Informations utilisateur pré-configurées
  userName: import.meta.env.VITE_USER_NAME || null,
  userEmail: import.meta.env.VITE_USER_EMAIL || null,
  userId: import.meta.env.VITE_USER_ID || null,
  
  // Mode de développement
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
}
