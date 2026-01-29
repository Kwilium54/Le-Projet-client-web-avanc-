import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'

// Plugins
import axiosPlugin from './plugins/axios'
import vuetify from './plugins/vuetify'

// Directives
import { vDateFormat, vAutoFocus, vTruncate } from './directives'

// Styles Toastify
import 'vue3-toastify/dist/index.css'

const app = createApp(App)

// Configuration Pinia avec persistedstate
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(router)
app.use(axiosPlugin)
app.use(vuetify)

app.directive('date-format', vDateFormat)
app.directive('auto-focus', vAutoFocus)
app.directive('truncate', vTruncate)

import { useAuthStore } from './stores/authStore'
const authStore = useAuthStore()
authStore.initialize()

app.mount('#app')
