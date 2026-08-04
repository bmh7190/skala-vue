import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import PracticeView from '@/views/PracticeView.vue'
import WeatherAboutView from '@/views/WeatherAboutView.vue'
import WeatherDetailView from '@/views/WeatherDetailView.vue'
import WeatherHomeView from '@/views/WeatherHomeView.vue'
import WeatherView from '@/views/WeatherView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      component: HomeView,
    },
    {
      path: '/practice',
      name: 'Practice',
      component: PracticeView,
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
