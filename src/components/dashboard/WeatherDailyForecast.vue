<script setup>
import { computed } from 'vue'

import { useConfigStore } from '@/stores/configStore'

const props = defineProps({
  forecastList: {
    type: Array,
    required: true,
  },
})

const configStore = useConfigStore()

const convertTemperature = (temperature) => {
  return configStore.unit === 'fahrenheit'
    ? Math.round((temperature * 9) / 5 + 32)
    : temperature
}

const getDateKey = (timestamp) => {
  const date = new Date(timestamp)
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const formatDate = (timestamp) => {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
  }).format(new Date(timestamp))
}

const formatDay = (timestamp, index) => {
  if (index === 0) return '오늘'
  if (index === 1) return '내일'

  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'UTC',
    weekday: 'short',
  }).format(new Date(timestamp))
}

const getRepresentativeStatus = (items) => {
  const wettestForecast = items.reduce((current, item) => {
    return item.precipitation > current.precipitation ? item : current
  })

  if (wettestForecast.precipitation >= 30) {
    return wettestForecast.status
  }

  const statusCount = items.reduce((count, item) => {
    count[item.status] = (count[item.status] ?? 0) + 1
    return count
  }, {})

  return Object.entries(statusCount).sort((first, second) => second[1] - first[1])[0][0]
}

const weatherIcon = (status) => {
  if (status.includes('비') || status.includes('소나기')) return '🌧️'
  if (status.includes('눈')) return '🌨️'
  if (status.includes('구름')) return '🌥️'
  if (status.includes('흐림')) return '☁️'
  return '☀️'
}

// 3시간 간격 데이터를 날짜별로 묶어 5일 요약 정보 생성
const dailyForecastList = computed(() => {
  const groupedForecast = new Map()

  props.forecastList.forEach((item) => {
    const key = getDateKey(item.localTimestamp)
    const items = groupedForecast.get(key) ?? []

    items.push(item)
    groupedForecast.set(key, items)
  })

  return Array.from(groupedForecast.values())
    .slice(0, 5)
    .map((items, index) => {
      const status = getRepresentativeStatus(items)

      return {
        id: getDateKey(items[0].localTimestamp),
        day: formatDay(items[0].localTimestamp, index),
        date: formatDate(items[0].localTimestamp),
        status,
        icon: weatherIcon(status),
        minTemp: Math.min(...items.map((item) => item.temp)),
        maxTemp: Math.max(...items.map((item) => item.temp)),
        precipitation: Math.max(...items.map((item) => item.precipitation)),
      }
    })
})
</script>

<template>
  <section class="daily-forecast-card" aria-labelledby="daily-forecast-title">
    <header class="daily-forecast-heading">
      <h3 id="daily-forecast-title">5일 날씨 예보</h3>
      <p>날짜별 최고·최저 기온</p>
    </header>

    <div class="daily-forecast-grid">
      <article v-for="item in dailyForecastList" :key="item.id" class="daily-weather-item">
        <div class="daily-date">
          <strong>{{ item.day }}</strong>
          <span>{{ item.date }}</span>
        </div>

        <span class="daily-weather-icon" aria-hidden="true">{{ item.icon }}</span>
        <div class="daily-condition">
          <p class="daily-status">{{ item.status }}</p>
          <p class="daily-rain">강수 {{ item.precipitation }}%</p>
        </div>

        <div class="daily-temperature">
          <strong>{{ convertTemperature(item.maxTemp) }}{{ configStore.unitSymbol }}</strong>
          <span>{{ convertTemperature(item.minTemp) }}{{ configStore.unitSymbol }}</span>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.daily-forecast-card {
  display: flex;
  min-height: 0;
  height: 100%;
  flex-direction: column;
  padding: 14px;
  overflow: hidden;
  border: 1px solid var(--forecast-panel-border, rgba(148, 163, 184, 0.16));
  border-radius: var(--forecast-panel-radius, 18px);
  background: var(
    --forecast-panel-background,
    linear-gradient(155deg, rgba(20, 35, 58, 0.94), rgba(12, 23, 40, 0.96))
  );
  -webkit-backdrop-filter: var(--forecast-panel-backdrop, none);
  backdrop-filter: var(--forecast-panel-backdrop, none);
  box-shadow: var(--forecast-panel-shadow, none);
}

.daily-forecast-heading {
  display: flex;
  flex: 0 0 auto;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 10px;
}

.daily-forecast-heading h3 {
  margin: 0;
  color: #f8fafc;
  font-size: 16px;
}

.daily-forecast-heading p {
  margin: 5px 0 0;
  color: #8291a8;
  font-size: 10px;
}

.daily-forecast-grid {
  display: grid;
  min-height: 0;
  flex: 1;
  gap: 0;
  padding: 0 10px;
  overflow-y: auto;
  background: transparent;
  scrollbar-color: rgba(125, 211, 252, 0.32) transparent;
  scrollbar-gutter: stable;
  scrollbar-width: thin;
}

.daily-forecast-grid::-webkit-scrollbar {
  width: 5px;
}

.daily-forecast-grid::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(125, 211, 252, 0.28);
}

.daily-weather-item {
  display: grid;
  grid-template-columns: minmax(78px, 0.9fr) 24px minmax(68px, 1fr) auto;
  align-items: center;
  gap: 8px;
  min-width: 0;
  min-height: 76px;
  padding: 14px 4px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
}

.daily-date {
  display: flex;
  align-items: baseline;
  gap: 5px;
}

.daily-date strong {
  color: #f8fafc;
  font-size: 13px;
}

.daily-date span,
.daily-status,
.daily-rain {
  color: #8291a8;
  font-size: 10px;
}

.daily-weather-icon {
  font-size: 18px;
}

.daily-status {
  margin: 0;
}

.daily-temperature {
  display: flex;
  align-items: baseline;
  justify-items: end;
  gap: 5px;
}

.daily-temperature strong {
  color: #f8fafc;
  font-size: 16px;
}

.daily-temperature span {
  color: #64748b;
  font-size: 12px;
}

.daily-rain {
  margin: 2px 0 0;
  color: #7dd3fc;
}

@media (max-width: 600px) {
  .daily-forecast-card {
    padding: 14px;
  }

  .daily-forecast-heading p {
    display: none;
  }
}
</style>
