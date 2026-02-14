export const vDateFormat = {
  mounted(el, binding) {
    const dateString = binding.value
    if (!dateString) {
      el.textContent = ''
      return
    }

    const date = new Date(dateString)
    const format = binding.arg || 'date'

    switch (format) {
      case 'datetime':
        el.textContent = date.toLocaleString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
        break
      case 'time':
        el.textContent = date.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        })
        break
      case 'date':
      default:
        el.textContent = date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
        break
    }
  },
  updated(el, binding) {
    vDateFormat.mounted(el, binding)
  },
}

export const vAutoFocus = {
  mounted(el) {
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.focus()
    } else {
      const input = el.querySelector('input, textarea')
      if (input) {
        input.focus()
      }
    }
  },
}

export const vTruncate = {
  mounted(el, binding) {
    const maxLength = binding.value || 50
    const text = el.textContent
    
    if (text.length > maxLength) {
      el.textContent = text.substring(0, maxLength) + '...'
      el.title = text
    }
  },
}
