<script setup>
import LoadingIndicator from '@/components/dashboard/LoadingIndicator.vue'
import WeatherCard from '@/components/dashboard/WeatherCard.vue'
import WeatherRegionOverview from '@/components/dashboard/WeatherRegionOverview.vue'

defineProps({
  selectedWeather: {
    type: Object,
    default: null,
  },
  isCountryView: {
    type: Boolean,
    default: false,
  },
  overviewBackLabel: {
    type: String,
    required: true,
  },
  locationListTitle: {
    type: String,
    required: true,
  },
  weatherList: {
    type: Array,
    required: true,
  },
  selectedCityInfo: {
    type: String,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  selectedCityId: {
    type: [String, Number],
    default: null,
  },
})

defineEmits(['close-selected-weather', 'return-to-world', 'select-item'])
</script>

<template>
  <aside class="locations-panel">
    <button
      v-if="selectedWeather"
      class="world-back-button"
      type="button"
      @click="$emit('close-selected-weather')"
    >
      ← {{ overviewBackLabel }}
    </button>

    <button
      v-else-if="isCountryView"
      class="world-back-button"
      type="button"
      @click="$emit('return-to-world')"
    >
      ← 세계 지도
    </button>

    <div v-if="!selectedWeather" class="locations-heading">
      <h3>{{ locationListTitle }}</h3>
      <span class="location-count">{{ weatherList.length }}</span>
    </div>

    <template v-if="!selectedWeather">
      <p class="selection-message">{{ selectedCityInfo }}</p>

      <LoadingIndicator v-if="isLoading" message="날씨 정보를 불러오는 중입니다." />

      <div v-else-if="weatherList.length > 0" class="location-list">
        <WeatherCard
          v-for="item in weatherList"
          :key="item.id"
          dashboard
          :city-item="item"
          :is-region="isCountryView"
          :is-selected="selectedCityId === item.id"
          :show-action="false"
          @select-card="$emit('select-item', item)"
        />
      </div>

      <div v-else class="empty-location-state">
        <span>⌕</span>
        <p>표시할 지역이 없습니다.</p>
      </div>
    </template>

    <WeatherRegionOverview v-else :weather="selectedWeather" />
  </aside>
</template>
