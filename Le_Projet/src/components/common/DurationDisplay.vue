<template>
  <span :class="['duration-display', sizeClass]">
    <v-icon v-if="showIcon" :size="iconSize" class="mr-1">mdi-timer-outline</v-icon>
    {{ formatted }}
  </span>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'DurationDisplay',
  props: {
    // Durée en secondes OU date de début ISO
    seconds: {
      type: Number,
      default: null,
    },
    start: {
      type: String,
      default: null,
    },
    end: {
      type: String,
      default: null,
    },
    showIcon: {
      type: Boolean,
      default: false,
    },
    size: {
      type: String,
      default: 'md', // sm | md | lg
    },
  },
  setup(props) {
    const totalSeconds = computed(() => {
      if (props.seconds !== null) return props.seconds
      if (!props.start) return 0
      const start = new Date(props.start)
      const end = props.end ? new Date(props.end) : new Date()
      return Math.max(0, Math.floor((end - start) / 1000))
    })

    const formatted = computed(() => {
      const s = totalSeconds.value
      const h = Math.floor(s / 3600)
      const m = Math.floor((s % 3600) / 60)
      const sec = s % 60
      if (h > 0) return `${h}h ${String(m).padStart(2, '0')}m`
      if (m > 0) return `${String(m).padStart(2, '0')}m ${String(sec).padStart(2, '0')}s`
      return `${sec}s`
    })

    const sizeClass = computed(() => {
      const map = { sm: 'text-caption', md: 'text-body-2', lg: 'text-body-1' }
      return map[props.size] || 'text-body-2'
    })

    const iconSize = computed(() => {
      const map = { sm: 14, md: 16, lg: 18 }
      return map[props.size] || 16
    })

    return { formatted, sizeClass, iconSize }
  },
}
</script>
