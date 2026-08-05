<script setup>
import { computed } from 'vue'

import { useDashboardTemperature } from '@/composables/dashboard/useDashboardTemperature'

const props = defineProps({
  weather: {
    type: Object,
    required: true,
  },
})

const temperature = computed(() => props.weather.temp)
const { displayTemp, displayUnit } = useDashboardTemperature(temperature)

const weatherTheme = computed(() => {
  const status = String(props.weather.status ?? '')

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
  const status = String(props.weather.status ?? '')

  if (status.includes('천둥') || status.includes('번개') || status.includes('뇌우')) return '⛈️'
  if (status.includes('눈')) return '🌨️'
  if (status.includes('비') || status.includes('소나기')) return '🌧️'
  if (status.includes('안개') || status.includes('박무') || status.includes('연무')) return '🌫️'
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

  const localTimestamp = (props.weather.observedAt + (props.weather.timezone ?? 0)) * 1000

  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(localTimestamp))
})
</script>

<template>
  <article class="region-current-weather" :class="weatherTheme">
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
        <div class="current-sun-summary">
          <span>일출 <strong>{{ formatLocalTime(weather.sunrise) }}</strong></span>
          <i aria-hidden="true"></i>
          <span>일몰 <strong>{{ formatLocalTime(weather.sunset) }}</strong></span>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.current-weather-heading,
.current-temperature-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.region-current-weather {
  position: relative;
  box-sizing: border-box;
  min-height: 210px;
  padding: 18px;
  overflow: hidden;
  border: 1px solid rgba(125, 211, 252, 0.2);
  border-radius: 18px;
  background:
    radial-gradient(circle at 84% 24%, rgba(56, 189, 248, 0.3), transparent 34%),
    radial-gradient(circle at 12% 100%, rgba(37, 99, 235, 0.2), transparent 38%),
    linear-gradient(145deg, rgba(27, 60, 96, 0.96), rgba(9, 24, 42, 0.96));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 18px 38px rgba(0, 0, 0, 0.2);
}

.region-current-weather::after {
  position: absolute;
  right: -38px;
  bottom: -58px;
  width: 170px;
  height: 170px;
  border: 1px solid rgba(125, 211, 252, 0.08);
  border-radius: 50%;
  box-shadow:
    0 0 0 28px rgba(125, 211, 252, 0.025),
    0 0 0 58px rgba(125, 211, 252, 0.018);
  content: '';
}

.region-current-weather.weather-clear {
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

.region-current-weather.weather-clouds {
  background-image:
    linear-gradient(90deg, rgba(8, 23, 40, 0.78), rgba(26, 43, 61, 0.48)),
    url('../../../assets/dashboard/weather-scenes/clouds.jpg');
  background-position: center;
  background-size: cover;
}

.region-current-weather.weather-rain {
  background-image:
    linear-gradient(90deg, rgba(4, 16, 29, 0.78), rgba(8, 26, 44, 0.48)),
    url('../../../assets/dashboard/weather-scenes/rain.jpg');
  background-position: center;
  background-size: cover;
}

.region-current-weather.weather-snow {
  background-image:
    linear-gradient(90deg, rgba(8, 29, 50, 0.8), rgba(26, 57, 83, 0.52)),
    url('../../../assets/dashboard/weather-scenes/snow.jpg');
  background-position: center;
  background-size: cover;
}

.region-current-weather.weather-storm {
  background-image:
    linear-gradient(90deg, rgba(5, 12, 29, 0.75), rgba(28, 26, 57, 0.4)),
    url('../../../assets/dashboard/weather-scenes/storm.jpg');
  background-position: center;
  background-size: cover;
}

.region-current-weather.weather-mist {
  background-image:
    linear-gradient(90deg, rgba(20, 40, 56, 0.82), rgba(54, 73, 86, 0.54)),
    url('../../../assets/dashboard/weather-scenes/mist.jpg');
  background-position: center;
  background-size: cover;
}

.current-location-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #7dd3fc;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.15em;
}

.current-location-label i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 10px #38bdf8;
}

.current-weather-heading h3 {
  margin: 6px 0 0;
  color: var(--dashboard-text);
  font-size: 28px;
  letter-spacing: -0.04em;
}

.overview-weather-icon {
  display: grid;
  z-index: 1;
  width: 60px;
  height: 60px;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(7, 20, 36, 0.5);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  font-size: 32px;
}

.current-temperature-row {
  position: relative;
  z-index: 1;
  align-items: flex-end;
  justify-content: flex-start;
  gap: 24px;
  margin-top: 20px;
}

.current-temperature-row > strong {
  color: var(--dashboard-text);
  font-size: clamp(54px, 4.8vw, 64px);
  font-weight: 500;
  letter-spacing: -0.08em;
  line-height: 0.95;
}

.current-temperature-row p {
  margin: 0 0 7px;
  color: var(--dashboard-text);
  font-size: 16px;
  font-weight: 650;
}

.current-temperature-row span {
  color: var(--dashboard-muted);
  font-size: 12px;
}

.current-sun-summary {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  color: var(--dashboard-muted);
  font-size: 8px;
  white-space: nowrap;
}

.current-sun-summary strong {
  margin-left: 2px;
  color: var(--dashboard-text);
  font-size: 11px;
  font-weight: 650;
}

.current-sun-summary i {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(250, 204, 21, 0.7);
}

@media (min-width: 901px) and (max-height: 800px) {
  .region-current-weather {
    min-height: 170px;
    padding: 14px;
  }

  .current-location-label {
    font-size: 8px;
  }

  .current-weather-heading h3 {
    margin-top: 3px;
    font-size: 24px;
  }

  .overview-weather-icon {
    width: 50px;
    height: 50px;
    font-size: 28px;
  }

  .current-temperature-row {
    gap: 18px;
    margin-top: 10px;
  }

  .current-temperature-row > strong {
    font-size: 52px;
  }

  .current-temperature-row p {
    margin-bottom: 4px;
    font-size: 14px;
  }

  .current-temperature-row span {
    font-size: 10px;
  }

  .current-sun-summary {
    margin-top: 5px;
  }

  .current-sun-summary strong {
    font-size: 10px;
  }
}

@media (min-width: 901px) and (max-height: 680px) {
  .region-current-weather {
    min-height: 154px;
    padding: 10px;
  }

  .current-weather-heading h3 {
    font-size: 22px;
  }

  .overview-weather-icon {
    width: 44px;
    height: 44px;
    font-size: 24px;
  }

  .current-temperature-row {
    gap: 12px;
    margin-top: 6px;
  }

  .current-temperature-row > strong {
    font-size: 46px;
  }
}

@media (max-width: 900px) {
  .region-current-weather {
    min-height: 220px;
    padding: 20px;
  }

  .current-weather-heading h3 {
    margin-top: 6px;
    font-size: 30px;
  }

  .overview-weather-icon {
    width: 64px;
    height: 64px;
    font-size: 34px;
  }

  .current-temperature-row {
    align-items: flex-end;
    gap: 28px;
    margin-top: 22px;
  }

  .current-temperature-row > strong {
    font-size: clamp(56px, 10vw, 72px);
  }

  .current-temperature-row p {
    margin-bottom: 8px;
    font-size: 17px;
  }

  .current-temperature-row span {
    font-size: 13px;
  }

  .current-sun-summary {
    gap: 8px;
    margin-top: 10px;
  }

  .current-sun-summary strong {
    font-size: 12px;
  }
}

@media (max-width: 600px) {
  .region-current-weather {
    min-height: 240px;
    padding: 18px;
  }

  .current-temperature-row {
    align-items: flex-start;
    flex-direction: column;
    gap: 14px;
  }
}
</style>
