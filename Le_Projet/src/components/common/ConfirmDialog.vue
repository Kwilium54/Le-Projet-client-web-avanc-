<template>
  <v-dialog
    :model-value="modelValue"
    max-width="420"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="xl" elevation="4">
      <v-card-title class="pa-5 d-flex align-center ga-2">
        <v-icon :color="color" size="24">{{ icon }}</v-icon>
        <span class="text-subtitle-1 font-weight-bold">{{ title }}</span>
      </v-card-title>

      <v-card-text class="px-5 pb-2 text-body-2 text-medium-emphasis">
        {{ message }}
      </v-card-text>

      <v-card-actions class="pa-4 pt-3 ga-2 justify-end">
        <v-btn variant="text" rounded="lg" @click="$emit('update:modelValue', false)">
          {{ cancelLabel }}
        </v-btn>
        <v-btn :color="color" variant="elevated" rounded="lg" @click="confirm">
          {{ confirmLabel }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'ConfirmDialog',
  props: {
    modelValue: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: 'Confirmer',
    },
    message: {
      type: String,
      default: 'Êtes-vous sûr de vouloir continuer ?',
    },
    confirmLabel: {
      type: String,
      default: 'Confirmer',
    },
    cancelLabel: {
      type: String,
      default: 'Annuler',
    },
    color: {
      type: String,
      default: 'error',
    },
    icon: {
      type: String,
      default: 'mdi-alert-circle-outline',
    },
  },
  emits: ['update:modelValue', 'confirm'],
  setup(props, { emit }) {
    const confirm = () => {
      emit('confirm')
      emit('update:modelValue', false)
    }
    return { confirm }
  },
}
</script>
