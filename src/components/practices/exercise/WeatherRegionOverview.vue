<script setup>
import { computed } from 'vue'

import { useTemperature } from '@/composables/useTemperature'

const props = defineProps({
  weather: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['show-details'])

const temperature = computed(() => props.weather.temp)
const feelsLike = computed(() => props.weather.feelsLike ?? props.weather.temp)
const { displayTemp, displayUnit } = useTemperature(temperature)
const { displayTemp: displayFeelsLike } = useTemperature(feelsLike)

const weatherIcon = computed(() => {
  const status = props.weather.status

  if (status.includes('비') || status.includes('소나기')) return '🌧️'
  if (status.includes('눈')) return '🌨️'
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

  const localTimestamp =
    (props.weather.observedAt + (props.weather.timezone ?? 0)) * 1000

  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(localTimestamp))
})

const visibility = computed(() => {
  return Number.isFinite(props.weather.visibility) ? `${props.weather.visibility} km` : '정보 없음'
})
</script>

<template>
  <section class="region-weather-overview" :aria-label="`${weather.name} 현재 날씨`">
    <article class="region-current-weather">
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
        </div>
      </div>
    </article>

    <div class="weather-highlight-heading">
      <h4>오늘의 하이라이트</h4>
      <button type="button" class="overview-detail-button" @click="emit('show-details')">
        상세 예보 보기 →
      </button>
    </div>

    <div class="weather-highlight-grid">
      <article class="highlight-card">
        <div class="highlight-card-heading">
          <span class="highlight-symbol" aria-hidden="true">⌁</span>
          <span>체감 온도</span>
        </div>
        <strong>{{ displayFeelsLike }}{{ displayUnit }}</strong>
        <p>현재 몸으로 느껴지는 온도</p>
      </article>

      <article class="highlight-card">
        <div class="highlight-card-heading">
          <span class="highlight-symbol" aria-hidden="true">◌</span>
          <span>습도</span>
        </div>
        <strong>{{ weather.humidity }}<small>%</small></strong>
        <p>현재 공기 중 수분량</p>
      </article>

      <article class="highlight-card">
        <div class="highlight-card-heading">
          <span class="highlight-symbol" aria-hidden="true">↗</span>
          <span>풍속</span>
        </div>
        <strong>{{ weather.wind }}<small>m/s</small></strong>
        <p>현재 관측된 바람의 속도</p>
      </article>

      <article class="highlight-card">
        <div class="highlight-card-heading">
          <span class="highlight-symbol" aria-hidden="true">◎</span>
          <span>가시거리</span>
        </div>
        <strong>{{ visibility }}</strong>
        <p>육안으로 확인 가능한 거리</p>
      </article>

      <article class="highlight-card sun-card">
        <div class="highlight-card-heading">
          <span class="highlight-symbol sun-symbol" aria-hidden="true">☼</span>
          <span>일출과 일몰</span>
        </div>
        <div class="sun-times">
          <div>
            <span>일출</span>
            <strong>{{ formatLocalTime(weather.sunrise) }}</strong>
          </div>
          <i aria-hidden="true"></i>
          <div>
            <span>일몰</span>
            <strong>{{ formatLocalTime(weather.sunset) }}</strong>
          </div>
        </div>
        <p>선택 지역의 현지 시각 기준</p>
      </article>
    </div>
  </section>
</template>
