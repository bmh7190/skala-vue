<script setup>
import { computed } from 'vue'

import { useTemperature } from '@/composables/useTemperature'

const props = defineProps({
  cityItem: {
    type: Object,
    required: true,
  },

  isSelected: {
    type: Boolean,
    default: false,
  },

  dashboard: {
    type: Boolean,
    default: false,
  },

  actionLabel: {
    type: String,
    default: '상세보기',
  },

  isRegion: {
    type: Boolean,
    default: false,
  },

  showAction: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['select-card', 'click-detail'])

const temperature = computed(() => props.cityItem.temp)
const { displayTemp, displayUnit } = useTemperature(temperature)
const weatherIcon = computed(() => {
  const status = props.cityItem.status

  if (status.includes('비') || status.includes('소나기')) return '🌧️'
  if (status.includes('눈')) return '🌨️'
  if (status.includes('구름')) return '🌥️'
  if (status.includes('흐림')) return '☁️'
  return '☀️'
})

const observedTime = computed(() => {
  if (!props.cityItem.observedAt) return '실시간 관측'

  const localTimestamp =
    (props.cityItem.observedAt + (props.cityItem.timezone ?? 0)) * 1000

  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'UTC',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(localTimestamp))
})
</script>

<template>
  <div
    v-if="dashboard"
    class="weather-card dashboard-mode"
    :class="{ selected: isSelected, 'region-card': isRegion }"
    @click="emit('select-card')"
  >
    <div class="city-weather-header">
      <div class="city-location-copy">
        <span>{{ cityItem.country }}</span>
        <strong>{{ cityItem.name }}</strong>
      </div>
      <span class="weather-icon" aria-hidden="true">{{ weatherIcon }}</span>
    </div>

    <div class="city-temperature-row">
      <strong class="city-temperature">{{ displayTemp }}{{ displayUnit }}</strong>
      <div class="city-condition-copy">
        <strong>{{ cityItem.status }}</strong>
        <span>{{ observedTime }}</span>
      </div>
    </div>

    <div class="city-weather-meta">
      <span>습도 {{ cityItem.humidity }}%</span>
      <span>풍속 {{ cityItem.wind }}m/s</span>
      <button
        v-if="showAction"
        class="btn-detail"
        @click.stop="emit('click-detail', cityItem.name, cityItem.status)"
      >
        {{ actionLabel }}
      </button>
    </div>
  </div>

  <div v-else class="weather-card" :class="{ selected: isSelected }" @click="emit('select-card')">
    <h4>{{ cityItem.name }} ({{ cityItem.status }})</h4>

    <p>현재 기온: {{ displayTemp }}{{ displayUnit }}</p>

    <span v-if="cityItem.temp >= 30" class="badge hot"> 🔥 더움 </span>

    <span v-else-if="cityItem.temp >= 25" class="badge common"> 🍃 보통 </span>

    <span v-else class="badge cool"> ❄️ 선선함 </span>

    <button class="btn-detail" @click.stop="emit('click-detail', cityItem.name, cityItem.status)">
      상세보기
    </button>
  </div>
</template>

<style scoped>
.weather-card {
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
  transition: 0.2s;
}

.weather-card.selected {
  border-color: #3498db;
  background-color: #eaf4ff;
}
</style>
