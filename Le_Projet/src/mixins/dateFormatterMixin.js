// Mixin pour formater les dates
export const dateFormatterMixin = {
  methods: {
    // Formater une date au format français
    formatDate(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    },

    // Formater une date avec l'heure
    formatDateTime(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    },

    // Formater uniquement l'heure
    formatTime(dateString) {
      if (!dateString) return ''
      const date = new Date(dateString)
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    },

    // Calculer la durée entre deux dates en heures/minutes
    calculateDuration(startString, endString) {
      if (!startString) return '0h 0m'
      
      const start = new Date(startString)
      const end = endString ? new Date(endString) : new Date()
      
      const diffMs = end - start
      const diffMinutes = Math.floor(diffMs / 60000)
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60
      
      return `${hours}h ${minutes}m`
    },

    // Obtenir la date du jour au format YYYY-MM-DD
    getTodayDate() {
      return new Date().toISOString().split('T')[0]
    },

    // Vérifier si une date est aujourd'hui
    isToday(dateString) {
      if (!dateString) return false
      const date = dateString.split(' ')[0]
      return date === this.getTodayDate()
    },
  },
}
