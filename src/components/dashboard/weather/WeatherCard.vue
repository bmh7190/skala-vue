<script setup>
import { computed } from 'vue'

import { useDashboardTemperature } from '@/composables/dashboard/useDashboardTemperature'

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
const { displayTemp, displayUnit } = useDashboardTemperature(temperature)
const weatherTheme = computed(() => {
  const status = String(props.cityItem.status ?? '')

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
  const status = String(props.cityItem.status ?? '')

  if (status.includes('천둥') || status.includes('번개') || status.includes('뇌우')) return '⛈️'
  if (status.includes('눈')) return '🌨️'
  if (status.includes('비') || status.includes('소나기')) return '🌧️'
  if (status.includes('안개') || status.includes('박무') || status.includes('연무')) return '🌫️'
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
    :class="[weatherTheme, { selected: isSelected, 'region-card': isRegion }]"
    @click="emit('select-card')"
  >
    <span class="weather-scene" aria-hidden="true"></span>

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

.weather-card.dashboard-mode {
  position: relative;
  display: flex;
  margin: 0;
  min-height: 156px;
  padding: 15px;
  overflow: hidden;
  flex-direction: column;
  border: 1px solid rgba(125, 211, 252, 0.12);
  border-radius: 15px;
  background: linear-gradient(135deg, rgba(25, 50, 82, 0.96), rgba(8, 20, 36, 0.98));
  color: var(--dashboard-text);
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    transform 0.2s ease;
}

.weather-card.dashboard-mode.region-card {
  border-color: rgba(125, 211, 252, 0.24);
}

.weather-card.dashboard-mode.region-card:hover {
  border-color: rgba(125, 211, 252, 0.46);
}

.weather-card.dashboard-mode:hover {
  border-color: rgba(125, 211, 252, 0.32);
  box-shadow:
    inset 0 0 0 1px rgba(125, 211, 252, 0.08),
    0 8px 20px rgba(2, 8, 23, 0.16);
}

.weather-card.dashboard-mode.selected {
  border-color: rgba(56, 189, 248, 0.68);
  box-shadow:
    inset 3px 0 0 #38bdf8,
    0 8px 22px rgba(2, 8, 23, 0.22);
}

.weather-card.dashboard-mode > :not(.weather-scene) {
  position: relative;
  z-index: 1;
}

.weather-scene {
  position: absolute;
  z-index: 0;
  inset: 0;
  overflow: hidden;
  border-radius: inherit;
  pointer-events: none;
}

.weather-scene::before,
.weather-scene::after {
  position: absolute;
  content: '';
  pointer-events: none;
}

.weather-card.weather-clear {
  background-image:
    linear-gradient(
      90deg,
      rgba(5, 20, 38, 0.68) 0%,
      rgba(10, 38, 65, 0.28) 58%,
      rgba(10, 38, 65, 0.08) 100%
    ),
    url('../../../assets/dashboard/weather-scenes/clear.jpg');
  background-position: center;
  background-size: cover;
}

.weather-card.weather-clouds {
  background-image:
    linear-gradient(90deg, rgba(8, 23, 40, 0.78), rgba(26, 43, 61, 0.48)),
    url('../../../assets/dashboard/weather-scenes/clouds.jpg');
  background-position: center;
  background-size: cover;
}

.weather-card.weather-rain {
  background-image:
    linear-gradient(90deg, rgba(4, 16, 29, 0.78), rgba(8, 26, 44, 0.48)),
    url('../../../assets/dashboard/weather-scenes/rain.jpg');
  background-position: center;
  background-size: cover;
}

.weather-card.weather-snow {
  background-image:
    linear-gradient(90deg, rgba(8, 29, 50, 0.8), rgba(26, 57, 83, 0.52)),
    url('../../../assets/dashboard/weather-scenes/snow.jpg');
  background-position: center;
  background-size: cover;
}

.weather-card.weather-storm {
  background-image:
    linear-gradient(90deg, rgba(5, 12, 29, 0.75), rgba(28, 26, 57, 0.4)),
    url('../../../assets/dashboard/weather-scenes/storm.jpg');
  background-position: center;
  background-size: cover;
}

.weather-card.weather-mist {
  background-image:
    linear-gradient(90deg, rgba(20, 40, 56, 0.82), rgba(54, 73, 86, 0.54)),
    url('../../../assets/dashboard/weather-scenes/mist.jpg');
  background-position: center;
  background-size: cover;
}

.weather-snow .weather-scene::before,
.weather-snow .weather-scene::after {
  inset: -18% 0 0;
  background-image:
    radial-gradient(circle, rgba(255, 255, 255, 0.8) 0 1px, transparent 2px),
    radial-gradient(circle, rgba(224, 242, 254, 0.55) 0 1.5px, transparent 2.5px);
  background-position:
    4px 7px,
    18px 24px;
  background-size:
    27px 31px,
    43px 47px;
  animation: dashboard-snow 5s linear infinite;
}

.weather-snow .weather-scene::after {
  opacity: 0.45;
  animation-duration: 8s;
  transform: translateX(12px);
}

.city-weather-header,
.city-temperature-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.city-location-copy,
.city-condition-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.city-location-copy > span {
  color: #7dd3fc;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.16em;
}

.city-location-copy > strong {
  margin-top: 2px;
  color: var(--dashboard-text);
  font-size: 15px;
  font-weight: 750;
}

.weather-icon {
  display: grid;
  width: 42px;
  height: 42px;
  flex: 0 0 42px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 13px;
  background: rgba(8, 17, 31, 0.34);
  font-size: 24px;
}

.city-temperature-row {
  justify-content: flex-start;
  margin-top: 8px;
}

.city-temperature {
  color: var(--dashboard-text);
  font-size: 35px;
  font-weight: 550;
  letter-spacing: -0.07em;
  line-height: 1;
}

.city-condition-copy strong {
  overflow: hidden;
  color: var(--dashboard-text);
  font-size: 11px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.city-condition-copy {
  flex: 1;
}

.city-condition-copy span {
  margin-top: 3px;
  color: var(--dashboard-muted);
  font-size: 9px;
}

.city-weather-meta {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: auto;
  padding-top: 9px;
  border-top: 1px solid rgba(148, 163, 184, 0.1);
  color: #8292aa;
  font-size: 10px;
  white-space: nowrap;
}

.weather-card.dashboard-mode .btn-detail {
  position: static;
  margin-left: auto;
  padding: 4px 8px;
  border: 1px solid var(--dashboard-border);
  border-radius: 7px;
  background: rgba(148, 163, 184, 0.08);
  color: #cbd5e1;
  font-size: 10px;
  flex-shrink: 0;
  cursor: pointer;
}

.weather-card.dashboard-mode .btn-detail:hover {
  border-color: rgba(56, 189, 248, 0.38);
  color: #7dd3fc;
}

@keyframes dashboard-snow {
  from {
    transform: translate3d(0, -24px, 0);
  }
  to {
    transform: translate3d(8px, 36px, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .weather-snow .weather-scene::before,
  .weather-snow .weather-scene::after {
    animation: none;
  }
}

@media (max-width: 600px) {
  .city-weather-meta {
    flex-wrap: wrap;
  }
}
</style>
