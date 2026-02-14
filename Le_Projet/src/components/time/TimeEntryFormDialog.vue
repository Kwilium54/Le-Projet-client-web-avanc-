<template>
  <v-dialog
    :model-value="modelValue"
    max-width="520"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <v-card rounded="xl" elevation="4">
      <v-card-title class="pa-5 text-subtitle-1 font-weight-bold d-flex align-center ga-2">
        <v-icon color="primary">{{
          isEditing ? 'mdi-pencil-outline' : 'mdi-plus-circle-outline'
        }}</v-icon>
        {{ isEditing ? "Modifier l'entrée" : 'Ajouter une entrée' }}
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-5">
        <v-row dense>
          <v-col cols="12" sm="6">
            <v-select
              :model-value="form.project_id"
              :items="activeProjects"
              item-title="name"
              item-value="id"
              label="Projet *"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              prepend-inner-icon="mdi-folder-outline"
              :rules="[(v) => !!v || 'Requis']"
              @update:model-value="update('project_id', $event)"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              :model-value="form.activity_id"
              :items="activeActivities"
              item-title="name"
              item-value="id"
              label="Type d'activité *"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              prepend-inner-icon="mdi-tag-outline"
              :rules="[(v) => !!v || 'Requis']"
              @update:model-value="update('activity_id', $event)"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              :model-value="form.start"
              v-auto-focus
              :label="isEditing ? 'Début' : 'Début *'"
              type="datetime-local"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              prepend-inner-icon="mdi-clock-start"
              :rules="!isEditing ? [(v) => !!v || 'Requis'] : []"
              @update:model-value="update('start', $event)"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              :model-value="form.end"
              :label="isEditing ? 'Fin' : 'Fin *'"
              type="datetime-local"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              prepend-inner-icon="mdi-clock-end"
              :rules="!isEditing ? [(v) => !!v || 'Requis'] : []"
              @update:model-value="update('end', $event)"
            />
          </v-col>
          <v-col cols="12">
            <v-textarea
              :model-value="form.comment"
              label="Commentaire (optionnel)"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              rows="2"
              auto-grow
              prepend-inner-icon="mdi-comment-text-outline"
              hide-details
              @update:model-value="update('comment', $event)"
            />
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions class="pa-4 pt-0 justify-end ga-2">
        <v-btn variant="text" rounded="lg" @click="$emit('update:modelValue', false)"
          >Annuler</v-btn
        >
        <v-btn
          color="primary"
          variant="elevated"
          rounded="lg"
          :loading="saving"
          :disabled="!form.project_id || !form.activity_id"
          @click="$emit('save')"
        >
          {{ isEditing ? 'Enregistrer' : 'Ajouter' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  name: 'TimeEntryFormDialog',
  props: {
    modelValue: { type: Boolean, default: false },
    form: { type: Object, required: true },
    activeProjects: { type: Array, default: () => [] },
    activeActivities: { type: Array, default: () => [] },
    isEditing: { type: Boolean, default: false },
    saving: { type: Boolean, default: false },
  },
  emits: ['update:modelValue', 'update:form', 'save'],
  setup(props, { emit }) {
    const update = (field, value) => {
      emit('update:form', { ...props.form, [field]: value })
    }
    return { update }
  },
}
</script>
