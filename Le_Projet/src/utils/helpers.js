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
