import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import LoginView from '@/views/auth/LoginView.vue'
import AppLayout from '@/layouts/AppLayout.vue'
import ActivityView from '@/views/ActivityView.vue'
import StatisticsView from '@/views/StatisticsView.vue'
import SettingsLayout from '@/views/settings/SettingsLayout.vue'
import ProfileView from '@/views/settings/ProfileView.vue'
import ProjectsView from '@/views/settings/ProjectsView.vue'
import ActivitiesView from '@/views/settings/ActivitiesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/app/activity',
    },
    {
      path: '/login',
      name: 'Login',
      component: LoginView,
      meta: { requiresGuest: true },
    },
    {
      path: '/app',
      component: AppLayout,
      redirect: '/app/activity',
      meta: { requiresAuth: true },
      children: [
        {
          path: 'activity',
          name: 'Activity',
          component: ActivityView,
          meta: { requiresAuth: true },
        },
        {
          path: 'stats',
          name: 'Statistics',
          component: StatisticsView,
          meta: { requiresAuth: true },
        },
        {
          path: 'settings',
          component: SettingsLayout,
          meta: { requiresAuth: true },
          redirect: '/app/settings/profile',
          children: [
            {
              path: 'profile',
              name: 'Profile',
              component: ProfileView,
              meta: { requiresAuth: true },
            },
            {
              path: 'projects',
              name: 'Projects',
              component: ProjectsView,
              meta: { requiresAuth: true },
            },
            {
              path: 'activities',
              name: 'ActivitiesSettings',
              component: ActivitiesView,
              meta: { requiresAuth: true },
            },
          ],
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/app/activity',
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    return next({ name: 'Login' })
  }

  if (to.meta.requiresGuest && isAuthenticated) {
    return next({ name: 'Activity' })
  }

  next()
})

export default router
