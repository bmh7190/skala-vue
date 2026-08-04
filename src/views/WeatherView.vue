<script setup>
import WeatherComposition from '@/components/practices/exercise/WeatherComposition.vue'
import WeatherMockup from '@/components/practices/exercise/WeatherMockup.vue'
import WeatherParent from '@/components/practices/exercise/WeatherParent.vue'
</script>

<template>
  <main class="weather-page">
    <div class="weather-exercises">
      <RouterLink to="/" class="home-link">← 메인</RouterLink>

      <section class="app-container">
        <WeatherMockup />
      </section>

      <section class="app-container">
        <WeatherComposition />
      </section>

      <section class="app-container">
        <WeatherParent />
      </section>

      <section class="app-container">
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
</style>
