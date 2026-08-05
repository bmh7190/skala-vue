<script setup>
import { computed } from 'vue'

import { useTemperature } from '@/composables/useTemperature'

const props = defineProps({
  weather: {
    type: Object,
    required: true,
  },
})

const temperature = computed(() => props.weather.temp)
const { displayTemp, displayUnit } = useTemperature(temperature)

const weatherTheme = computed(() => {
  const status = String(props.weather.status ?? '')

  if (status.includes('천둥') || status.includes('번개') || status.includes('뇌우')) {
    return 'weather-storm'
  }
  if (status.includes('눈') || status.includes('진눈깨비')) return 'weather-snow'
  if (status.includes('비') || status.includes('소나기') || status.includes('이슬비')) {
    return 'weather-rain'
  }
  if (
    status.includes('안개') ||
    status.includes('박무') ||
    status.includes('연무') ||
    status.includes('황사')
  ) {
    return 'weather-mist'
  }
  if (status.includes('구름') || status.includes('흐림')) return 'weather-clouds'
  return 'weather-clear'
})

const weatherIcon = computed(() => {
  const status = String(props.weather.status ?? '')

  if (status.includes('천둥') || status.includes('번개') || status.includes('뇌우')) return '⛈️'
  if (status.includes('눈')) return '🌨️'
  if (status.includes('비') || status.includes('소나기')) return '🌧️'
  if (status.includes('안개') || status.includes('박무') || status.includes('연무')) return '🌫️'
  if (status.includes('구름')) return '🌥️'
  if (status.includes('흐림')) return '☁️'
  return '☀️'
})

const formatLocalTime = (timestamp) => {
  if (!timestamp) return '--:--'

  const localTimestamp = (timestamp + (props.weather.timezone ?? 0)) * 1000

  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(localTimestamp))
}

const observedTime = computed(() => {
  if (!props.weather.observedAt) return '실시간 관측 정보'

  const localTimestamp = (props.weather.observedAt + (props.weather.timezone ?? 0)) * 1000

  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(localTimestamp))
})
</script>

<template>
  <article class="region-current-weather" :class="weatherTheme">
    <div class="current-weather-heading">
      <div>
        <span class="current-location-label">
          <i aria-hidden="true"></i>{{ weather.country }} · NOW
        </span>
        <h3>{{ weather.name }}</h3>
      </div>
      <span class="overview-weather-icon" aria-hidden="true">{{ weatherIcon }}</span>
    </div>

    <div class="current-temperature-row">
      <strong>{{ displayTemp }}{{ displayUnit }}</strong>
      <div>
        <p>{{ weather.status }}</p>
        <span>{{ observedTime }}</span>
        <div class="current-sun-summary">
          <span>일출 <strong>{{ formatLocalTime(weather.sunrise) }}</strong></span>
          <i aria-hidden="true"></i>
          <span>일몰 <strong>{{ formatLocalTime(weather.sunset) }}</strong></span>
        </div>
      </div>
    </div>
  </article>
</template>
