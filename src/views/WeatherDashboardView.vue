<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'

import UnitToggle from '@/components/practices/exercise/UnitToggle.vue'
import '@/assets/exercise.css'
import '@/assets/weather-dashboard.css'

const isHeaderInitiallyVisible = ref(true)
const route = useRoute()
const isDashboardHome = computed(() => route.name === 'WeatherDashboard')
let headerTimer

onMounted(() => {
  headerTimer = window.setTimeout(() => {
    isHeaderInitiallyVisible.value = false
  }, 1800)
})

onBeforeUnmount(() => {
  window.clearTimeout(headerTimer)
})
</script>

<template>
  <main
    class="weather-dashboard-page"
    :class="{ 'dashboard-home-page': isDashboardHome }"
  >
    <section class="app-container task-five-container full-page-dashboard">
      <div class="dashboard-wrapper task-five-dashboard">
        <header
          class="task-five-topbar"
          :class="{ 'initially-visible': isHeaderInitiallyVisible }"
        >
          <div class="dashboard-leading">
            <RouterLink
              to="/weather"
              class="dashboard-back-button"
              aria-label="날씨 실습으로 돌아가기"
            >
              ←
            </RouterLink>

            <RouterLink to="/weather/dashboard" class="dashboard-brand">
              <span class="brand-mark" aria-hidden="true">✦</span>
              <strong>Weatherly</strong>
            </RouterLink>
          </div>

          <nav class="task-five-navigation" aria-label="날씨 대시보드 메뉴">
            <RouterLink to="/weather/dashboard" class="nav-item">대시보드</RouterLink>
            <RouterLink to="/weather/about" class="nav-item">서비스 소개</RouterLink>
          </nav>

          <UnitToggle />
        </header>

        <RouterView v-slot="{ Component, route }">
          <KeepAlive>
            <component :is="Component" v-if="route.meta.keepAlive" />
          </KeepAlive>
          <component :is="Component" v-if="!route.meta.keepAlive" />
        </RouterView>
      </div>
    </section>
  </main>
</template>

<style scoped>
.weather-dashboard-page {
  min-height: 100vh;
  overflow-x: hidden;
  background: #08111f;
}

.weather-dashboard-page.dashboard-home-page {
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
}

.dashboard-leading {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dashboard-back-button {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  place-items: center;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 11px;
  background: rgba(20, 35, 58, 0.72);
  color: #91a1b8;
  text-decoration: none;
}

.dashboard-back-button:hover {
  border-color: rgba(56, 189, 248, 0.4);
  color: #7dd3fc;
}

.full-page-dashboard {
  width: 100%;
  max-width: none;
  min-height: 100vh;
  margin: 0;
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.dashboard-home-page .full-page-dashboard,
.dashboard-home-page .task-five-dashboard {
  height: 100%;
  min-height: 0;
  overflow: hidden;
}

.dashboard-brand {
  text-decoration: none;
}

@media (max-width: 600px) {
  .dashboard-leading {
    gap: 8px;
  }
}

@media (max-width: 900px) {
  .weather-dashboard-page.dashboard-home-page {
    height: auto;
    min-height: 100dvh;
    overflow-y: auto;
  }

  .dashboard-home-page .full-page-dashboard,
  .dashboard-home-page .task-five-dashboard {
    height: auto;
    min-height: 100dvh;
    overflow: visible;
  }
}
</style>
