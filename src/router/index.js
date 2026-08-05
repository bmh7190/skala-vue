import { createRouter, createWebHistory } from 'vue-router'

const NotFoundView = () => import('@/views/NotFoundView.vue')
const PracticeDay1View = () => import('@/views/PracticeDay1View.vue')
const PracticeDay2View = () => import('@/views/PracticeDay2View.vue')
const PracticeDay3View = () => import('@/views/PracticeDay3View.vue')
const PracticeDay4View = () => import('@/views/PracticeDay4View.vue')
const PracticeView = () => import('@/views/PracticeView.vue')
const WeatherAboutView = () => import('@/views/WeatherAboutView.vue')
const WeatherDashboardAboutView = () => import('@/views/dashboard/WeatherDashboardAboutView.vue')
const WeatherDashboardHomeView = () => import('@/views/dashboard/WeatherDashboardHomeView.vue')
const WeatherDashboardView = () => import('@/views/dashboard/WeatherDashboardView.vue')
const WeatherDetailView = () => import('@/views/WeatherDetailView.vue')
const WeatherHomeView = () => import('@/views/WeatherHomeView.vue')
const WeatherView = () => import('@/views/WeatherView.vue')

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
