import { createRouter, createWebHistory } from 'vue-router'

import NotFoundView from '@/views/NotFoundView.vue'
import PracticeDay1View from '@/views/PracticeDay1View.vue'
import PracticeDay2View from '@/views/PracticeDay2View.vue'
import PracticeView from '@/views/PracticeView.vue'
import WeatherAboutView from '@/views/WeatherAboutView.vue'
import WeatherDashboardView from '@/views/dashboard/WeatherDashboardView.vue'
import WeatherDetailView from '@/views/WeatherDetailView.vue'
import WeatherDashboardHomeView from '@/views/dashboard/WeatherDashboardHomeView.vue'
import WeatherHomeView from '@/views/WeatherHomeView.vue'
import WeatherView from '@/views/WeatherView.vue'
import PracticeDay3View from '@/views/PracticeDay3View.vue'
import PracticeDay4View from '@/views/PracticeDay4View.vue'
import WeatherDashboardAboutView from '@/views/dashboard/WeatherDashboardAboutView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: WeatherDashboardView,
      children: [
        {
          path: '',
          name: 'WeatherDashboard',
          component: WeatherDashboardHomeView,
          meta: { keepAlive: true },
        },
        {
          path: 'about',
          name: 'WeatherDashboardAbout',
          component: WeatherDashboardAboutView,
        },
      ],
    },
    {
      path: '/practice',
      component: PracticeView,
      redirect: '/practice/day-1',
      children: [
        {
          path: 'day-1',
          name: 'PracticeDay1',
          component: PracticeDay1View,
        },
        {
          path: 'day-2',
          name: 'PracticeDay2',
          component: PracticeDay2View,
        },
        {
          path: 'day-3',
          name: 'PraticeDay3',
          component: PracticeDay3View,
        },
        {
          path: 'day-4',
          name: 'PraticeDay4',
          component: PracticeDay4View,
        },
      ],
    },
    {
      path: '/weather',
      component: WeatherView,
      children: [
        {
          path: '',
          name: 'WeatherHome',
          component: WeatherHomeView,
        },
        {
          path: 'about',
          name: 'WeatherAbout',
          component: WeatherAboutView,
        },
        {
          path: ':cityId',
          name: 'WeatherDetail',
          component: WeatherDetailView,
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundView,
    },
  ],
})

export default router
