<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import UnitToggle from '@/components/practices/exercise/UnitToggle.vue'
import WeatherComposition from '@/components/practices/exercise/WeatherComposition.vue'
import WeatherMockup from '@/components/practices/exercise/WeatherMockup.vue'
import WeatherParent from '@/components/practices/exercise/WeatherParent.vue'
import WeatherHomeApiView from './WeatherHomeApiView.vue'

const route = useRoute()
const router = useRouter()
// 상세 이동 시 전달한 task 값을 활용한 과제 5 탭 복원
const selectedTask = ref(route.query.task === '5' ? 5 : route.path === '/weather' ? 1 : 4)
</script>

<template>
  <el-container class="weather-page">
    <el-header class="weather-header" height="auto">
      <el-card shadow="never" class="weather-navigation-card">
        <el-page-header title="메인" content="날씨 과제" @back="router.push('/')" />

        <el-radio-group v-model="selectedTask" class="task-navigation" aria-label="날씨 과제 선택">
          <el-radio-button
            v-for="task in 5"
            :key="task"
            :value="task"
          >
            과제 {{ task }}
          </el-radio-button>
        </el-radio-group>
      </el-card>
    </el-header>

    <el-main class="weather-content">
      <div class="weather-exercises">
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

            <el-menu
              :default-active="route.path"
              mode="horizontal"
              router
              :ellipsis="false"
              class="weather-route-menu"
              aria-label="날씨 페이지 메뉴"
            >
              <el-menu-item index="/weather">날씨 대시보드</el-menu-item>
              <el-menu-item index="/weather/about">서비스 소개</el-menu-item>
            </el-menu>

            <RouterView />
          </div>
        </section>

        <section v-else class="app-container">
          <div class="dashboard-wrapper">
            <h2>과제 5: 스토어 적용</h2>

            <div class="navigation-bar">
              <el-menu
                :default-active="route.path"
                mode="horizontal"
                router
                :ellipsis="false"
                class="weather-route-menu"
                aria-label="날씨 페이지 메뉴"
              >
                <el-menu-item index="/weather">날씨 대시보드</el-menu-item>
                <el-menu-item index="/weather/about">서비스 소개</el-menu-item>
              </el-menu>
              <UnitToggle />
            </div>

            <!-- 상세 화면 이동 전 검색 결과와 선택 상태 유지 -->
            <KeepAlive>
              <WeatherHomeApiView v-if="route.name === 'WeatherHome'" />
            </KeepAlive>
            <RouterView v-if="route.name !== 'WeatherHome'" />
          </div>
        </section>
      </div>
    </el-main>
  </el-container>
</template>

<style>
@import '@/assets/exercise.css';
</style>

<style scoped>
.weather-page {
  width: 100%;
  min-height: 100vh;
  padding: 24px 20px 60px;
  background: #f5f7fa;
}

:global(body:has(#app > .weather-page)) {
  background: #f5f7fa;
}

:global(#app:has(> .weather-page)) {
  max-width: none;
}

.weather-header {
  width: min(1100px, 100%);
  padding: 0;
  margin: 0 auto 20px;
}

.weather-navigation-card {
  border-radius: 12px;
}

.weather-navigation-card :deep(.el-card__body) {
  padding-bottom: 20px;
}

.weather-exercises {
  width: min(1100px, 100%);
  margin: 0 auto;
}

.weather-content {
  padding: 0;
}

.weather-content .app-container {
  box-sizing: border-box;
  width: 100%;
  max-width: none;
  margin: 0;
  padding: clamp(24px, 3vw, 40px);
}

.weather-content :deep(.dashboard-wrapper) {
  width: 100%;
}

.task-navigation {
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  margin-top: 18px;
}

.task-navigation :deep(.el-radio-button) {
  min-width: 0;
  flex: 1;
}

.task-navigation :deep(.el-radio-button__inner) {
  width: 100%;
  min-width: 0;
  font-weight: 650;
}

.weather-route-menu {
  flex: 1;
  justify-content: center;
  border-bottom: 0;
}

.navigation-bar .weather-route-menu {
  box-shadow: none;
  margin-bottom: 0;
}

@media (max-width: 700px) {
  .weather-page {
    padding: 16px 12px 40px;
  }

  .weather-navigation-card :deep(.el-card__body) {
    padding: 16px 12px;
  }

  .weather-content .app-container {
    padding: 20px 14px;
  }

  .task-navigation {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    width: 100%;
  }

  .task-navigation :deep(.el-radio-button:last-child) {
    grid-column: 1 / -1;
  }

  .task-navigation :deep(.el-radio-button__inner) {
    width: 100%;
    min-width: 0;
    border: 1px solid var(--el-border-color);
    border-radius: 6px;
  }

  .navigation-bar {
    align-items: stretch;
    flex-direction: column;
    gap: 10px;
  }
}
</style>
