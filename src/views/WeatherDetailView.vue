<script setup>
import axios from 'axios'
import LoadingIndicator from '@/components/practices/exercise/LoadingIndicator.vue'
import { useTemperature } from '@/composables/useTemperature'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const route = useRoute()
const router = useRouter()
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

// 마운트할 때 리퀘스트 파람을 통해서 얻은 도시 ID를 mockDetail에서 찾은 후 selectedCity에 넣기
onMounted(async () => {
  const id = route.params.cityId

  if (mockDetails[id]) {
    selectedCity.value = mockDetails[id]
    return
  }

  const { lat, lon, name, country } = route.query

  if (!lat || !lon || !API_KEY) {
    errorMessage.value = '해당 지역의 상세 정보를 불러올 수 없습니다.'
    return
  }

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

const { displayTemp, displayUnit } = useTemperature(temperature)
</script>

<template>
  <div class="detail-container">
    <h2>지역별 상세 기상 관측 정보</h2>
    <div v-if="selectedCity" class="info-card">
      <h4>지정 지역: {{ selectedCity.name }}</h4>
      <p>실시간 기온: {{ displayTemp }}{{ displayUnit }}</p>
      <p>기상 현황: {{ selectedCity.status }}</p>
      <p>대기 습도: {{ selectedCity.humidity }}</p>
      <p>현재 풍속: {{ selectedCity.wind }}</p>
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
