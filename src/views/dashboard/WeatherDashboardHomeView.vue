<script setup>
import { computed, onMounted, watch } from 'vue'

import SearchBar from '@/components/dashboard/common/SearchBar.vue'
import WeatherForecastPanel from '@/components/dashboard/forecast/WeatherForecastPanel.vue'
import WeatherLocationPanel from '@/components/dashboard/weather/WeatherLocationPanel.vue'
import { useWeatherForecast } from '@/composables/dashboard/useWeatherForecast'
import { useWeatherLocations } from '@/composables/dashboard/useWeatherLocations'
import { useWeatherSearch } from '@/composables/dashboard/useWeatherSearch'
import { useWeatherDashboardStore } from '@/stores/dashboard/weatherDashboardStore'

const weatherStore = useWeatherDashboardStore()
const weatherLocations = useWeatherLocations(weatherStore)
const {
  errorMessage,
  fetchDefaultWeather,
  handleMapAreaSelect,
  handleMapCountrySelect,
  isConfigured,
  isCountryView,
  isLoading,
  mapWeatherList,
  selectedCityId,
  selectedCityInfo,
  selectedCountry,
  selectedCountryCode,
  selectedWeather,
  weatherList,
} = weatherLocations
const {
  cityName,
  closeSelectedWeather,
  handleListSelect,
  handleSearch,
  isSearchView,
  returnToWorld,
} = useWeatherSearch(weatherStore, weatherLocations)
const {
  forecastList,
  forecastErrorMessage,
  hourlyForecastList,
  isForecastLoading,
  loadForecast,
} = useWeatherForecast(weatherStore)

const locationListTitle = computed(() => {
  if (isSearchView.value) return '검색 결과'
  if (selectedCountry.value) return `${selectedCountry.value.name} 주요 지역`
  return '기본 국가'
})
const overviewBackLabel = computed(() => {
  if (isSearchView.value) return '세계 지도'
  return isCountryView.value ? '지역 목록' : '국가 목록'
})

watch(selectedWeather, loadForecast)

onMounted(fetchDefaultWeather)
</script>

<template>
  <div class="weather-api-dashboard">
    <header class="dashboard-search-row">
      <div class="dashboard-intro">
        <h2>오늘의 전 세계 날씨</h2>
        <p>국가를 선택해 지역으로 들어가거나 도시를 바로 검색해보세요.</p>
      </div>

      <SearchBar
        dashboard
        :current-query="cityName"
        :search-results="weatherList"
        :show-result-message="false"
        @update-query="cityName = $event"
        @search="handleSearch"
      />
    </header>

    <p v-if="!isConfigured" class="dashboard-alert">
      `.env.local`에 `VITE_OPENWEATHER_API_KEY`를 설정해야 합니다.
    </p>
    <p v-if="errorMessage" class="dashboard-alert">
      {{ errorMessage }}
    </p>

    <div class="weather-dashboard-grid" :class="{ 'has-region-overview': selectedWeather }">
      <WeatherLocationPanel
        :selected-weather="selectedWeather"
        :is-country-view="isCountryView"
        :overview-back-label="overviewBackLabel"
        :location-list-title="locationListTitle"
        :weather-list="weatherList"
        :selected-city-info="selectedCityInfo"
        :is-loading="isLoading"
        :selected-city-id="selectedCityId"
        @close-selected-weather="closeSelectedWeather"
        @return-to-world="returnToWorld"
        @select-item="handleListSelect"
      />

      <WeatherForecastPanel
        :selected-weather="selectedWeather"
        :is-loading="isLoading"
        :is-forecast-loading="isForecastLoading"
        :weather-list="weatherList"
        :map-weather-list="mapWeatherList"
        :forecast-list="forecastList"
        :hourly-forecast-list="hourlyForecastList"
        :forecast-error-message="forecastErrorMessage"
        :selected-city-id="selectedCityId"
        :selected-country-code="selectedCountryCode"
        :selected-country-name="selectedCountry?.name"
        @select-map-area="handleMapAreaSelect"
        @select-map-country="handleMapCountrySelect"
      />
    </div>
  </div>
</template>

<style scoped>
.weather-api-dashboard {
  display: flex;
  height: 100%;
  min-height: 0;
  padding: clamp(24px, 2.5vw, 40px);
  overflow: hidden;
  flex-direction: column;
}

.dashboard-search-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(330px, 440px);
  align-items: end;
  flex: 0 0 auto;
  gap: 32px;
  margin-bottom: 22px;
}

.dashboard-intro h2 {
  margin: 4px 0 4px;
  padding-bottom: 0;
  border-bottom: 0;
  color: var(--dashboard-text);
  font-size: clamp(24px, 3vw, 34px);
  font-weight: 760;
  letter-spacing: -0.04em;
}

.dashboard-intro p {
  color: var(--dashboard-muted);
  font-size: 13px;
}

.dashboard-alert {
  margin: -8px 0 18px;
  padding: 10px 13px;
  border: 1px solid rgba(251, 113, 133, 0.24);
  border-radius: 10px;
  background: rgba(159, 18, 57, 0.13);
  color: #fda4af;
  font-size: 12px;
}

.weather-dashboard-grid {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: minmax(340px, 390px) minmax(0, 1fr);
  align-items: stretch;
  gap: 18px;
}

.weather-dashboard-grid.has-region-overview :deep(.locations-panel) {
  min-height: 0;
  overflow: hidden;
}

/* 낮은 데스크톱에서도 지역 상세 전체를 스크롤 없이 한 화면에 배치 */
@media (min-width: 901px) and (max-height: 800px) {
  .weather-api-dashboard {
    padding: 20px clamp(24px, 2.5vw, 36px);
  }

  .dashboard-search-row {
    gap: 24px;
    margin-bottom: 14px;
  }

  .dashboard-intro h2 {
    font-size: 30px;
  }
}

@media (min-width: 901px) and (max-height: 680px) {
  .weather-api-dashboard {
    padding-top: 14px;
    padding-bottom: 14px;
  }

  .dashboard-search-row {
    margin-bottom: 10px;
  }

  .dashboard-intro h2 {
    font-size: 26px;
  }
}

@media (max-width: 900px) {
  .weather-api-dashboard {
    display: block;
    height: auto;
    overflow: visible;
  }

  .dashboard-search-row,
  .weather-dashboard-grid,
  .weather-dashboard-grid.has-region-overview {
    grid-template-columns: 1fr;
  }

  .weather-dashboard-grid,
  .weather-dashboard-grid.has-region-overview {
    min-height: 0;
    flex: none;
    height: auto;
  }

  .weather-dashboard-grid.has-region-overview :deep(.locations-panel) {
    min-height: auto;
    overflow: visible;
  }
}

@media (max-width: 600px) {
  .weather-api-dashboard {
    padding: 18px;
  }

  .dashboard-search-row {
    gap: 20px;
  }
}
</style>
