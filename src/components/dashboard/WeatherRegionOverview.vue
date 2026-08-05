<script setup>
import { computed } from 'vue'

import WeatherCurrentSummary from '@/components/dashboard/WeatherCurrentSummary.vue'
import { useTemperature } from '@/composables/useTemperature'

const props = defineProps({
  weather: {
    type: Object,
    required: true,
  },
})

const feelsLike = computed(() => props.weather.feelsLike ?? props.weather.temp)
const { displayTemp: displayFeelsLike, displayUnit } = useTemperature(feelsLike)

const visibility = computed(() => {
  return Number.isFinite(props.weather.visibility) ? props.weather.visibility : null
})

const clampProgress = (value) => Math.min(100, Math.max(0, value))

// 서로 다른 단위의 날씨 값을 0~100 범위로 변환해 시각 요소의 채움 정도를 통일
const feelsLikeProgress = computed(() => {
  const value = Number(feelsLike.value)
  return Number.isFinite(value) ? clampProgress(((value + 20) / 70) * 100) : 0
})

const humidityProgress = computed(() => {
  const value = Number(props.weather.humidity)
  return Number.isFinite(value) ? clampProgress(value) : 0
})

const windProgress = computed(() => {
  const value = Number(props.weather.wind)
  return Number.isFinite(value) ? clampProgress((value / 20) * 100) : 0
})

const visibilityProgress = computed(() => {
  const value = Number(props.weather.visibility)
  return Number.isFinite(value) ? clampProgress((value / 10) * 100) : 0
})

const windAnimationDuration = computed(() => {
  return `${Math.max(0.8, 3.2 - windProgress.value * 0.022)}s`
})
</script>

<template>
  <section class="region-weather-overview" :aria-label="`${weather.name} 현재 날씨`">
    <WeatherCurrentSummary :weather="weather" />

    <div class="weather-highlight-heading">
      <h4>오늘의 하이라이트</h4>
    </div>

    <div class="weather-highlight-grid">
      <article class="highlight-card">
        <div class="highlight-card-heading">
          <span>체감 온도</span>
        </div>
        <strong>{{ displayFeelsLike }}{{ displayUnit }}</strong>
        <div
          class="highlight-visual thermometer-visual"
          :style="{ '--metric-progress': `${feelsLikeProgress}%` }"
          aria-hidden="true"
        >
          <span class="thermometer-scale"></span>
          <span class="thermometer-tube"><i></i></span>
          <span class="thermometer-bulb"></span>
        </div>
      </article>

      <article class="highlight-card">
        <div class="highlight-card-heading">
          <span>습도</span>
        </div>
        <strong>{{ weather.humidity }}<small>%</small></strong>
        <div class="highlight-visual humidity-visual" aria-hidden="true">
          <svg viewBox="0 0 64 64">
            <circle class="metric-ring-track" cx="32" cy="32" r="25" pathLength="100" />
            <circle
              class="metric-ring-progress"
              cx="32"
              cy="32"
              r="25"
              pathLength="100"
              :stroke-dasharray="`${humidityProgress} 100`"
            />
            <path
              class="humidity-drop"
              d="M32 19C26 27 23 31 23 37a9 9 0 0 0 18 0c0-6-3-10-9-18Z"
            />
          </svg>
        </div>
      </article>

      <article class="highlight-card">
        <div class="highlight-card-heading">
          <span>풍속</span>
        </div>
        <strong>{{ weather.wind }}<small>m/s</small></strong>
        <div
          class="highlight-visual wind-visual"
          :style="{ '--wind-duration': windAnimationDuration }"
          aria-hidden="true"
        >
          <svg viewBox="0 0 72 64">
            <path class="wind-line wind-line-top" d="M8 20h31c9 0 9-11 1-11-5 0-7 3-7 6" />
            <path class="wind-line wind-line-middle" d="M5 32h49c12 0 12 15 1 15-6 0-9-4-9-8" />
            <path class="wind-line wind-line-bottom" d="M13 44h22" />
          </svg>
        </div>
      </article>

      <article class="highlight-card">
        <div class="highlight-card-heading">
          <span>가시거리</span>
        </div>
        <strong v-if="visibility !== null">{{ visibility }}<small>km</small></strong>
        <strong v-else>정보 없음</strong>
        <div
          class="highlight-visual visibility-visual"
          :style="{ '--visibility-level': visibilityProgress / 100 }"
          aria-hidden="true"
        >
          <svg viewBox="0 0 72 64">
            <path
              class="visibility-eye"
              d="M7 32c8-12 18-18 29-18s21 6 29 18c-8 12-18 18-29 18S15 44 7 32Z"
            />
            <circle class="visibility-iris" cx="36" cy="32" r="9" />
            <circle class="visibility-pupil" cx="36" cy="32" r="3" />
            <path class="visibility-haze" d="M9 49h23M40 49h23" />
          </svg>
        </div>
      </article>
    </div>
  </section>
</template>
