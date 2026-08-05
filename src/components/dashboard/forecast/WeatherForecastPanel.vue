<script setup>
import { defineAsyncComponent } from 'vue'

import LoadingIndicator from '@/components/dashboard/common/LoadingIndicator.vue'
import WeatherDailyForecast from '@/components/dashboard/forecast/WeatherDailyForecast.vue'

const WeatherMapChart = defineAsyncComponent(
  () => import('@/components/dashboard/map/WeatherMapChart.vue'),
)
const WeatherForecastChart = defineAsyncComponent(
  () => import('@/components/dashboard/forecast/WeatherForecastChart.vue'),
)

defineProps({
  selectedWeather: {
    type: Object,
    default: null,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  isForecastLoading: {
    type: Boolean,
    default: false,
  },
  weatherList: {
    type: Array,
    required: true,
  },
  mapWeatherList: {
    type: Array,
    required: true,
  },
  forecastList: {
    type: Array,
    required: true,
  },
  hourlyForecastList: {
    type: Array,
    required: true,
  },
  forecastErrorMessage: {
    type: String,
    default: '',
  },
  selectedCityId: {
    type: [String, Number],
    default: null,
  },
  selectedCountryCode: {
    type: String,
    default: '',
  },
  selectedCountryName: {
    type: String,
    default: '',
  },
})

defineEmits(['select-map-area', 'select-map-country'])
</script>

<template>
  <div class="map-panel" :class="{ 'region-forecast-panel': selectedWeather }">
    <div v-if="isLoading && weatherList.length > 0" class="map-loading-overlay">
      <LoadingIndicator message="실시간 날씨 지도를 준비하는 중입니다." />
    </div>

    <LoadingIndicator
      v-if="selectedWeather && isForecastLoading"
      class="region-forecast-loading"
      message="선택한 지역의 날씨 예보를 불러오는 중입니다."
    />

    <div v-else-if="selectedWeather" class="region-forecast-layout">
      <div class="forecast-daily-slot">
        <p v-if="forecastErrorMessage" class="forecast-inline-error" role="alert">
          {{ forecastErrorMessage }}
        </p>
        <WeatherDailyForecast v-else-if="forecastList.length > 0" :forecast-list="forecastList" />
      </div>

      <WeatherMapChart
        key="forecast-map"
        compact
        :weather-list="mapWeatherList"
        :selected-city-id="selectedCityId"
        :selected-country-code="selectedCountryCode"
        :selected-country-name="selectedCountryName"
        @select-city="$emit('select-map-area', $event)"
        @select-country="$emit('select-map-country', $event)"
      />

      <div class="forecast-chart-slot">
        <WeatherForecastChart
          v-if="forecastList.length > 0"
          :forecast-list="hourlyForecastList"
          :height="200"
        />
      </div>
    </div>

    <WeatherMapChart
      v-else-if="weatherList.length > 0"
      key="main-map"
      :weather-list="mapWeatherList"
      :selected-city-id="selectedCityId"
      :selected-country-code="selectedCountryCode"
      :selected-country-name="selectedCountryName"
      @select-city="$emit('select-map-area', $event)"
      @select-country="$emit('select-map-country', $event)"
    />

    <LoadingIndicator
      v-if="weatherList.length === 0 && isLoading"
      message="실시간 날씨 지도를 준비하는 중입니다."
    />

    <div v-else-if="weatherList.length === 0" class="empty-map-state">
      <strong>검색 결과가 없습니다.</strong>
      <span>검색어를 지우면 기존 지도 목록으로 돌아갑니다.</span>
    </div>
  </div>
</template>

<style scoped>
.map-panel {
  position: relative;
  min-width: 0;
  min-height: 0;
  padding: 18px;
  border: 1px solid var(--dashboard-border);
  border-radius: 18px;
  background: var(--dashboard-deep-panel);
}

.map-loading-overlay {
  position: absolute;
  z-index: 3;
  inset: 0;
  display: grid;
  place-content: center;
  border-radius: inherit;
  background: rgba(6, 14, 27, 0.82);
  backdrop-filter: blur(3px);
}

.region-forecast-panel {
  display: flex;
  min-height: 0;
  padding: 0;
  flex-direction: column;
  border: 0;
  border-radius: 0;
  background: transparent;
}

.region-forecast-loading {
  box-sizing: border-box;
  width: 100%;
  min-height: 0;
  flex: 1;
  border: 1px solid var(--dashboard-border);
  border-radius: 18px;
  background: var(--dashboard-deep-panel);
  color: var(--dashboard-muted);
}

.map-panel > :deep(.loading-indicator:not(.region-forecast-loading)) {
  min-height: 100%;
  color: var(--dashboard-muted);
}

.region-forecast-layout {
  --forecast-content-background: var(--dashboard-deep-panel);
  --forecast-panel-background: var(--forecast-content-background);
  --forecast-panel-border: rgba(203, 225, 244, 0.17);
  --forecast-panel-radius: 18px;
  --forecast-panel-backdrop: none;
  --forecast-panel-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08), 0 16px 34px rgba(2, 8, 23, 0.22);

  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: minmax(250px, 1fr) minmax(230px, 1fr);
  gap: 14px;
}

.forecast-daily-slot,
.forecast-chart-slot,
.region-forecast-layout > :deep(.weather-map-chart) {
  min-width: 0;
  min-height: 0;
}

.region-forecast-layout > :deep(.weather-map-chart) {
  padding: 14px;
  overflow: hidden;
  border: 1px solid var(--forecast-panel-border);
  border-radius: var(--forecast-panel-radius);
  background: var(--forecast-panel-background);
  -webkit-backdrop-filter: var(--forecast-panel-backdrop);
  backdrop-filter: var(--forecast-panel-backdrop);
  box-shadow: var(--forecast-panel-shadow);
}

.forecast-chart-slot {
  grid-column: 1 / -1;
}

.forecast-chart-slot :deep(.forecast-chart-card) {
  height: 100%;
  padding: 14px 18px;
}

.forecast-inline-error {
  display: grid;
  height: 100%;
  margin: 0;
  padding: 18px;
  place-items: center;
  border: 1px solid rgba(251, 113, 133, 0.24);
  border-radius: 16px;
  background: rgba(159, 18, 57, 0.12);
  color: #fda4af;
  font-size: 12px;
  text-align: center;
}

.empty-map-state {
  display: grid;
  min-height: 520px;
  place-content: center;
  gap: 6px;
  color: var(--dashboard-muted);
  text-align: center;
}

.empty-map-state strong {
  color: var(--dashboard-text);
}

.empty-map-state span {
  font-size: 12px;
}

@media (max-width: 900px) {
  .map-panel {
    height: 610px;
    min-height: auto;
  }

  .region-forecast-panel {
    height: auto;
    min-height: 0;
  }

  .region-forecast-layout {
    grid-template-columns: 1fr;
    grid-template-rows: auto 420px auto;
  }

  .forecast-chart-slot {
    grid-column: auto;
  }
}
</style>
