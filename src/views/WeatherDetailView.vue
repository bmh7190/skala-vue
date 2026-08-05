<script setup>
import axios from 'axios'
import WeatherDailyForecast from '@/components/practices/exercise/WeatherDailyForecast.vue'
import LoadingIndicator from '@/components/practices/exercise/LoadingIndicator.vue'
import { useTemperature } from '@/composables/useTemperature'
import {
  fetchForecastByCoordinates,
  isOpenWeatherConfigured,
} from '@/api/openWeather'
import { useWeatherStore } from '@/stores/weatherStore'
import { computed, defineAsyncComponent, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const WeatherForecastChart = defineAsyncComponent(
  () => import('@/components/practices/exercise/WeatherForecastChart.vue'),
)
const route = useRoute()
const router = useRouter()
const weatherStore = useWeatherStore()
const mockDetails = {
  city_01: {
    name: '대한민국 서울특별시',
    temp: 28,
    status: '맑음',
    humidity: '55%',
    wind: '2.5m/s',
  },
  city_02: {
    name: '경기도 수원시 영통구',
    temp: 24,
    status: '비',
    humidity: '85%',
    wind: '4.1m/s',
  },
  city_03: {
    name: '부산광역시 해운대구',
    temp: 26,
    status: '구름',
    humidity: '65%',
    wind: '5.0m/s',
  },
}

const selectedCity = ref(null)
const errorMessage = ref('')
const forecastList = ref([])
const forecastErrorMessage = ref('')
const isForecastLoading = ref(false)
const isTaskFive = computed(() => route.query.task === '5')
const hourlyForecastList = computed(() => forecastList.value.slice(0, 8))

// 조회 우선순위: 과제 4 목업 → 과제 5 Pinia 캐시 → 좌표 기반 API fallback
// 새로고침·URL 직접 접근 시 비어 있는 메모리 캐시 보완
onMounted(async () => {
  const id = route.params.cityId

  if (mockDetails[id]) {
    selectedCity.value = mockDetails[id]
    return
  }

  const cachedWeather = weatherStore.getWeatherById(id)

  if (cachedWeather) {
    selectedCity.value = cachedWeather
    return
  }

  const { lat, lon, name, country } = route.query

  if (!lat || !lon || !API_KEY) {
    errorMessage.value = '해당 지역의 상세 정보를 불러올 수 없습니다.'
    return
  }

  console.log(`[Weather API] 상세 날씨 새로 불러오기: ${name}`)

  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        lat,
        lon,
        units: 'metric',
        lang: 'kr',
        appid: API_KEY,
      },
    })
    const data = response.data

    selectedCity.value = {
      name: country ? `${name}, ${country}` : name,
      temp: Math.round(data.main.temp),
      status: data.weather[0].description,
      humidity: `${data.main.humidity}%`,
      wind: `${data.wind.speed}m/s`,
    }
  } catch {
    errorMessage.value = '해당 지역의 상세 정보를 불러오지 못했습니다.'
  }
})

// 상세 화면 재방문은 예보 캐시 우선, 캐시 만료 시에만 Forecast API 호출
const loadForecast = async () => {
  if (!isTaskFive.value) return

  const { lat, lon, name } = route.query

  if (!lat || !lon || !isOpenWeatherConfigured()) {
    forecastErrorMessage.value = '날씨 예보를 불러올 좌표 또는 API 키가 없습니다.'
    return
  }

  const cachedForecast = weatherStore.getForecast(lat, lon)

  if (cachedForecast) {
    forecastList.value = cachedForecast
    return
  }

  isForecastLoading.value = true
  forecastErrorMessage.value = ''
  console.log(`[Weather API] 상세 예보 새로 불러오기: ${name}`)

  try {
    const forecast = await fetchForecastByCoordinates(lat, lon)

    weatherStore.saveForecast(lat, lon, forecast)
    forecastList.value = forecast
  } catch (error) {
    const status = error.response?.status

    if (status === 401) {
      forecastErrorMessage.value = 'API 키가 유효하지 않거나 아직 활성화되지 않았습니다.'
    } else if (status === 429) {
      forecastErrorMessage.value = '예보 API 요청 한도를 초과했습니다. 잠시 후 다시 시도하세요.'
    } else {
      forecastErrorMessage.value = '날씨 예보를 불러오지 못했습니다.'
    }
  } finally {
    isForecastLoading.value = false
  }
}

onMounted(loadForecast)

const temperature = computed(() => selectedCity.value?.temp ?? 0)
// 목업 문자열과 API 숫자 데이터의 상세 화면 표시 단위 통일
const humidity = computed(() => {
  const value = selectedCity.value?.humidity
  return typeof value === 'number' ? `${value}%` : value
})
const wind = computed(() => {
  const value = selectedCity.value?.wind
  return typeof value === 'number' ? `${value}m/s` : value
})

const { displayTemp, displayUnit } = useTemperature(temperature)

const returnToDashboard = () => {
  router.push(isTaskFive.value ? { name: 'WeatherDashboard' } : '/weather')
}
</script>

<template>
  <div class="detail-container" :class="{ 'task-five-detail': isTaskFive }">
    <h2>지역별 상세 기상 관측 정보</h2>
    <div v-if="selectedCity" class="info-card">
      <h4>지정 지역: {{ selectedCity.name }}</h4>
      <p>실시간 기온: {{ displayTemp }}{{ displayUnit }}</p>
      <p>기상 현황: {{ selectedCity.status }}</p>
      <p>대기 습도: {{ humidity }}</p>
      <p>현재 풍속: {{ wind }}</p>
    </div>
    <p v-else-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    <LoadingIndicator v-else message="상세 날씨 정보를 불러오는 중입니다." />

    <section v-if="isTaskFive" class="forecast-section">
      <LoadingIndicator
        v-if="isForecastLoading"
        message="날씨 예보를 불러오는 중입니다."
      />
      <p v-else-if="forecastErrorMessage" class="forecast-error" role="alert">
        {{ forecastErrorMessage }}
      </p>
      <div v-else-if="forecastList.length > 0" class="forecast-content">
        <WeatherForecastChart :forecast-list="hourlyForecastList" />
        <WeatherDailyForecast :forecast-list="forecastList" />
      </div>
    </section>

    <button class="back-btn" @click="returnToDashboard">← 날씨 대시보드로 돌아가기</button>
  </div>
</template>

<style scoped>
.detail-container {
  margin: 0 auto;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}
.info-card {
  background: #f1f2f6;
  padding: 15px;
  border-radius: 6px;
  margin: 15px 0;
}
.error-message {
  color: #d63031;
}
.back-btn {
  padding: 8px 12px;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.forecast-section {
  margin: 20px 0;
}

.forecast-content {
  display: grid;
  gap: 16px;
}

.forecast-error {
  padding: 16px;
  border: 1px solid rgba(251, 113, 133, 0.26);
  border-radius: 12px;
  background: rgba(159, 18, 57, 0.14);
  color: #fda4af;
}

.detail-container.task-five-detail {
  padding: 26px;
  border-radius: 0;
  background: transparent;
  color: #f8fafc;
  box-shadow: none;
}

.task-five-detail > h2 {
  margin: 0 0 18px;
  color: #f8fafc;
}

.task-five-detail .info-card {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 16px;
  padding: 20px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  border-radius: 18px;
  background: linear-gradient(155deg, rgba(20, 35, 58, 0.94), rgba(12, 23, 40, 0.96));
}

.task-five-detail .info-card h4 {
  grid-column: 1 / -1;
  margin: 0 0 8px;
  color: #7dd3fc;
}

.task-five-detail .info-card p {
  margin: 0;
  color: #cbd5e1;
}

.task-five-detail .back-btn {
  border: 1px solid rgba(56, 189, 248, 0.28);
  border-radius: 9px;
  background: rgba(56, 189, 248, 0.1);
  color: #7dd3fc;
}

@media (max-width: 600px) {
  .detail-container.task-five-detail {
    padding: 18px;
  }

  .task-five-detail .info-card {
    grid-template-columns: 1fr;
  }

  .task-five-detail .info-card h4 {
    grid-column: auto;
  }
}
</style>
