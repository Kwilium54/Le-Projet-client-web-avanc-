<template>
  <v-text-field
    :model-value="modelValue"
    :placeholder="placeholder"
    prepend-inner-icon="mdi-magnify"
    variant="outlined"
    density="compact"
    rounded="lg"
    clearable
    hide-details
    @update:model-value="$emit('update:modelValue', $event)"
    @click:clear="$emit('update:modelValue', '')"
  />
</template>

<script>
export default {
  name: 'SearchBar',
  props: {
    modelValue: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: 'Rechercher…',
    },
  },
  emits: ['update:modelValue'],
}
</script>
