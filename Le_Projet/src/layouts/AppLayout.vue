<template>
  <v-app>
    <app-header />

    <v-main class="bg-grey-lighten-5">
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import AppHeader from '@/components/AppHeader.vue'

export default {
  name: 'AppLayout',
  components: { AppHeader },
}
</script>
