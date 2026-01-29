// Calculer la durée entre deux dates en secondes
export function calculateDurationInSeconds(startString, endString) {
  if (!startString) return 0
  
  const start = new Date(startString)
  const end = endString ? new Date(endString) : new Date()
  
  return Math.floor((end - start) / 1000)
}

// Convertir des secondes en format lisible (heures et minutes)
export function secondsToHoursMinutes(seconds) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

// Convertir des secondes en heures décimales
export function secondsToDecimalHours(seconds) {
  return (seconds / 3600).toFixed(2)
}

// Formater une date au format API (YYYY-MM-DD HH:MM:SS)
export function formatDateForApi(date) {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

// Obtenir la date du jour au format YYYY-MM-DD
export function getTodayDate() {
  return new Date().toISOString().split('T')[0]
}

// Filtrer un tableau par mots-clés
export function filterByKeywords(items, keywords, searchFields = []) {
  if (!keywords || keywords.trim() === '') {
    return items
  }

  const searchTerm = keywords.toLowerCase().trim()
  
  return items.filter(item => {
    // Rechercher dans tous les champs textuels si aucun champ spécifique n'est fourni
    if (searchFields.length === 0) {
      return Object.values(item).some(value => {
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm)
        }
        return false
      })
    }
    
    // Rechercher uniquement dans les champs spécifiés
    return searchFields.some(field => {
      const value = item[field]
      if (typeof value === 'string') {
        return value.toLowerCase().includes(searchTerm)
      }
      return false
    })
  })
}

// Générer une couleur aléatoire en hexadécimal
export function randomColor() {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}
