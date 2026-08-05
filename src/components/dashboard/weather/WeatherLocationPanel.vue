<script setup>
import LoadingIndicator from '@/components/dashboard/common/LoadingIndicator.vue'
import WeatherCard from '@/components/dashboard/weather/WeatherCard.vue'
import WeatherRegionOverview from '@/components/dashboard/weather/WeatherRegionOverview.vue'

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

<style scoped>
.locations-panel {
  display: flex;
  min-width: 0;
  min-height: 0;
  padding: 18px;
  overflow: hidden;
  flex-direction: column;
  border: 1px solid var(--dashboard-border);
  border-radius: 18px;
  background: var(--dashboard-deep-panel);
}

.world-back-button {
  margin-bottom: 14px;
  padding: 6px 10px;
  border: 1px solid var(--dashboard-border);
  border-radius: 9px;
  background: rgba(56, 189, 248, 0.08);
  color: #7dd3fc;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.world-back-button:hover {
  border-color: rgba(56, 189, 248, 0.4);
  background: rgba(56, 189, 248, 0.14);
}

.locations-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.locations-heading h3 {
  margin: 2px 0 0;
  color: var(--dashboard-text);
  font-size: 17px;
  font-weight: 720;
}

.location-count {
  display: grid;
  width: 30px;
  height: 30px;
  place-items: center;
  border: 1px solid rgba(56, 189, 248, 0.2);
  border-radius: 10px;
  background: rgba(56, 189, 248, 0.1);
  color: #7dd3fc;
  font-size: 12px;
  font-weight: 750;
}

.selection-message {
  min-height: 21px;
  margin: 8px 0 14px;
  color: var(--dashboard-muted);
  font-size: 13px;
}

.location-list {
  display: grid;
  min-height: 0;
  flex: 1;
  gap: 9px;
  padding: 2px 6px 18px 2px;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-color: rgba(125, 211, 252, 0.35) transparent;
  scrollbar-width: thin;
}

.location-list::-webkit-scrollbar {
  width: 6px;
}

.location-list::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(125, 211, 252, 0.28);
}

.locations-panel > :deep(.loading-indicator) {
  width: 100%;
  min-height: 0;
  flex: 1;
  color: var(--dashboard-muted);
}

.empty-location-state {
  display: grid;
  min-height: 240px;
  place-content: center;
  gap: 6px;
  color: var(--dashboard-muted);
  text-align: center;
}

.empty-location-state span {
  color: var(--dashboard-accent);
  font-size: 36px;
}

@media (max-width: 900px) {
  .locations-panel {
    max-height: none;
  }
}
</style>
