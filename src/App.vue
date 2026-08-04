<script setup>
import WeatherComposition from './components/practices/exercise/WeatherComposition.vue'
import WeatherMockup from './components/practices/exercise/WeatherMockup.vue'
import WeatherParent from './components/practices/exercise/WeatherParent.vue'
</script>

<template>
  <div class="app-container">
    <WeatherMockup />
  </div>

  <div class="app-container">
    <WeatherComposition />
  </div>

  <div class="app-container">
    <WeatherParent />
  </div>

  <div class="app-container">
    <div class="dashboard-wrapper">
      <h2>과제 4: 날씨 (라우터))</h2>

      <nav class="navigation-bar">
        <RouterLink to="/" class="nav-item">날씨 대시보드</RouterLink>
        <span class="divider">|</span>
        <RouterLink to="/about" class="nav-item">서비스 소개</RouterLink>
      </nav>
      <main>
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style>
@import '@/assets/practice.css';
@import '@/assets/exercise.css';
</style>
