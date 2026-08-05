<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

import UnitToggle from '@/components/practices/exercise/UnitToggle.vue'
import WeatherComposition from '@/components/practices/exercise/WeatherComposition.vue'
import WeatherMockup from '@/components/practices/exercise/WeatherMockup.vue'
import WeatherParent from '@/components/practices/exercise/WeatherParent.vue'
import WeatherHomeApiView from './WeatherHomeApiView.vue'

const route = useRoute()
const selectedTask = ref(route.path === '/weather' ? 1 : 4)
</script>

<template>
  <main class="weather-page">
    <div class="weather-exercises">
      <RouterLink to="/" class="home-link">← 메인</RouterLink>

      <nav class="task-navigation" aria-label="날씨 과제 선택">
        <button
          v-for="task in 5"
          :key="task"
          type="button"
          class="task-button"
          :class="{ active: selectedTask === task }"
          @click="selectedTask = task"
        >
          과제 {{ task }}
        </button>
      </nav>

      <section v-if="selectedTask === 1" class="app-container">
        <WeatherMockup />
      </section>

      <section v-else-if="selectedTask === 2" class="app-container">
        <WeatherComposition />
      </section>

      <section v-else-if="selectedTask === 3" class="app-container">
        <WeatherParent />
      </section>

      <section v-else-if="selectedTask === 4" class="app-container">
        <div class="dashboard-wrapper">
          <h2>과제 4: 날씨 (라우터)</h2>

          <nav class="navigation-bar" aria-label="날씨 페이지 메뉴">
            <RouterLink to="/weather" class="nav-item">날씨 대시보드</RouterLink>
            <span class="divider">|</span>
            <RouterLink to="/weather/about" class="nav-item">서비스 소개</RouterLink>
          </nav>

          <RouterView />
        </div>
      </section>

      <section v-else class="app-container">
        <div class="dashboard-wrapper">
          <h2>과제 5: 스토어 적용</h2>

          <nav class="navigation-bar" aria-label="날씨 페이지 메뉴">
            <RouterLink to="/weather" class="nav-item">날씨 대시보드</RouterLink>
            <span class="divider">|</span>
            <RouterLink to="/weather/about" class="nav-item">서비스 소개</RouterLink>
            <UnitToggle />
          </nav>

          <KeepAlive>
            <WeatherHomeApiView v-if="route.name === 'WeatherHome'" />
          </KeepAlive>
          <RouterView v-if="route.name !== 'WeatherHome'" />
        </div>
      </section>
    </div>
  </main>
</template>

<style>
@import '@/assets/exercise.css';
</style>

<style scoped>
.weather-page {
  width: 100%;
  padding: 24px 20px 60px;
}

.weather-exercises {
  width: min(900px, 100%);
  margin: 0 auto;
}

.home-link {
  display: inline-block;
  margin: 0 0 12px 10px;
}

.task-navigation {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 10px 20px;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  background: #ffffff;
}

.task-button {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #64748b;
  font-weight: 600;
  cursor: pointer;
}

.task-button:hover {
  background: #f1f5f9;
}

.task-button.active {
  background: #e4f1ff;
  color: #2878b5;
}
</style>
