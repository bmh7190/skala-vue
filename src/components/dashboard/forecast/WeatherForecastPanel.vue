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
