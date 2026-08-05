<script setup>
import axios from 'axios'
import LoadingIndicator from '@/components/practices/exercise/LoadingIndicator.vue'
import { useTemperature } from '@/composables/useTemperature'
import { useWeatherStore } from '@/stores/weatherStore'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
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
</script>

<template>
  <div class="detail-container">
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

    <br />
    <button class="back-btn" @click="router.push('/weather')">← 날씨 대시보드로 돌아가기</button>
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

</style>
