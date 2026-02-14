<template>
  <v-container class="py-6">
    <h1 class="text-h5 font-weight-bold mb-6">
      <v-icon class="mr-2">mdi-cog-outline</v-icon>
      Paramètres
    </h1>

    <v-row>
      <!-- Menu latéral -->
      <v-col cols="12" md="3">
        <v-card elevation="1" rounded="lg">
          <v-list nav density="compact">
            <v-list-item
              prepend-icon="mdi-account-outline"
              title="Mon profil"
              to="/app/settings/profile"
              rounded="lg"
              active-color="primary"
            />
            <v-list-item
              prepend-icon="mdi-folder-multiple-outline"
              title="Mes projets"
              to="/app/settings/projects"
              rounded="lg"
              active-color="primary"
            />
            <v-list-item
              prepend-icon="mdi-tag-multiple-outline"
              title="Mes activités"
              to="/app/settings/activities"
              rounded="lg"
              active-color="primary"
            />
          </v-list>
        </v-card>
      </v-col>

      <!-- Contenu de la sous-route -->
      <v-col cols="12" md="9">
        <router-view />
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'SettingsLayout',
}
</script>
