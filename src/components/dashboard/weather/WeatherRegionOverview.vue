<script setup>
import { computed } from 'vue'

import WeatherCurrentSummary from '@/components/dashboard/weather/WeatherCurrentSummary.vue'
import WeatherMetricCard from '@/components/dashboard/weather/WeatherMetricCard.vue'
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
      <WeatherMetricCard
        title="체감 온도"
        :value="displayFeelsLike"
        :unit="displayUnit"
        :small-unit="false"
        variant="temperature"
        :progress="feelsLikeProgress"
      />
      <WeatherMetricCard
        title="습도"
        :value="weather.humidity"
        unit="%"
        variant="humidity"
        :progress="humidityProgress"
      />
      <WeatherMetricCard
        title="풍속"
        :value="weather.wind"
        unit="m/s"
        variant="wind"
        :progress="windProgress"
        :animation-duration="windAnimationDuration"
      />
      <WeatherMetricCard
        title="가시거리"
        :value="visibility"
        unit="km"
        variant="visibility"
        :progress="visibilityProgress"
      />
    </div>
  </section>
</template>
