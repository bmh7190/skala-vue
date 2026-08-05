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

<style scoped>
.region-weather-overview {
  min-height: 0;
  flex: 1;
  margin-top: 12px;
  padding: 12px 6px 6px 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  scroll-padding-bottom: 24px;
  border-top: 1px solid var(--dashboard-border);
  scrollbar-color: rgba(125, 211, 252, 0.35) transparent;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
}

.region-weather-overview::-webkit-scrollbar {
  width: 6px;
}

.region-weather-overview::-webkit-scrollbar-track {
  background: transparent;
}

.region-weather-overview::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(125, 211, 252, 0.28);
}

.weather-highlight-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 12px 2px 6px;
}

.weather-highlight-heading h4 {
  margin: 3px 0 0;
  color: var(--dashboard-text);
  font-size: 17px;
}

.weather-highlight-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

@media (min-width: 901px) {
  .region-weather-overview {
    box-sizing: border-box;
    width: 100%;
    padding: 12px 6px 18px 0;
    overflow-y: hidden;
    scrollbar-gutter: auto;
  }

  .weather-highlight-grid {
    grid-template-rows: repeat(2, minmax(132px, auto));
  }
}

@media (min-width: 901px) and (max-height: 800px) {
  .region-weather-overview {
    padding: 10px 0 8px;
  }

  .weather-highlight-heading {
    margin: 8px 2px 4px;
  }

  .weather-highlight-heading h4 {
    font-size: 15px;
  }

  .weather-highlight-grid {
    grid-template-rows: repeat(2, minmax(100px, auto));
    gap: 8px;
  }
}

@media (min-width: 901px) and (max-height: 680px) {
  .weather-highlight-heading {
    margin-top: 6px;
  }

  .weather-highlight-grid {
    grid-template-rows: repeat(2, minmax(90px, auto));
    gap: 6px;
  }
}

@media (max-width: 900px) {
  .region-weather-overview {
    overflow: visible;
  }
}

@media (max-width: 600px) {
  .weather-highlight-grid {
    grid-template-columns: 1fr;
  }

  .weather-highlight-heading {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
