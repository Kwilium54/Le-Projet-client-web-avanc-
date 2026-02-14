<template>
  <v-card
    rounded="lg"
    elevation="0"
    border
    :class="['objective-item', { 'objective-done': objective.done }]"
    class="pa-1"
  >
    <v-card-text class="pa-3">
      <div class="d-flex align-start ga-3">
        <!-- Checkbox -->
        <v-checkbox
          :model-value="objective.done"
          :color="objective.done ? 'success' : 'primary'"
          density="compact"
          hide-details
          class="flex-shrink-0 mt-0 pt-0"
          @update:model-value="$emit('toggle', objective)"
        />

        <!-- Contenu -->
        <div class="flex-grow-1 min-width-0">
          <div class="d-flex align-center ga-2 flex-wrap">
            <span
              :class="[
                'text-body-2 font-weight-medium',
                objective.done ? 'text-decoration-line-through text-disabled' : '',
              ]"
            >
              {{ objective.name }}
            </span>

            <!-- Date si différente d'aujourd'hui -->
            <v-chip
              v-if="!isToday"
              size="x-small"
              variant="tonal"
              color="grey"
              prepend-icon="mdi-calendar-outline"
            >
              <span v-date-format="objective.date" />
            </v-chip>

            <!-- Badge atteint -->
            <v-chip
              v-if="objective.done"
              size="x-small"
              color="success"
              variant="tonal"
              prepend-icon="mdi-check-circle-outline"
            >
              Atteint
            </v-chip>
          </div>

          <!-- Contenu descriptif -->
          <p
            v-if="objective.content"
            class="text-caption text-medium-emphasis mt-1 mb-0"
            :class="{ 'text-decoration-line-through': objective.done }"
          >
            {{ objective.content }}
          </p>
        </div>

        <!-- Actions -->
        <div class="d-flex flex-column ga-1 flex-shrink-0">
          <v-btn
            icon="mdi-pencil-outline"
            size="x-small"
            variant="text"
            color="primary"
            @click="$emit('edit', objective)"
          />
          <v-btn
            icon="mdi-delete-outline"
            size="x-small"
            variant="text"
            color="error"
            @click="$emit('delete', objective)"
          />
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import { computed } from 'vue'
import { dateFormatterMixin } from '@/mixins/dateFormatterMixin'

export default {
  name: 'ObjectiveItem',
  mixins: [dateFormatterMixin],
  props: {
    objective: {
      type: Object,
      required: true,
    },
  },
  emits: ['toggle', 'edit', 'delete'],
  setup(props) {
    const isToday = computed(() => {
      if (!props.objective.date) return false
      const objDate = props.objective.date.split(' ')[0]
      return objDate === new Date().toISOString().split('T')[0]
    })
    return { isToday }
  },
}
</script>

<style scoped>
.objective-item {
  transition:
    opacity 0.3s ease,
    box-shadow 0.2s ease;
}
.objective-done {
  opacity: 0.65;
}
.objective-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
}
</style>
