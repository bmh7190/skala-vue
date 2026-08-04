<script setup>
import { useConfigStore } from '@/stores/configStore'
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const configStore = useConfigStore()

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

// 마운트할 때 리퀘스트 파람을 통해서 얻은 도시 ID를 mockDetail에서 찾은 후 selectedCity에 넣기
onMounted(() => {
  const id = route.params.cityId
  if (mockDetails[id]) {
    selectedCity.value = mockDetails[id]
  }
})

const displayTemp = computed(() => {
  if (!selectedCity.value) return 0
  const rawTemp = selectedCity.value.temp
  if (configStore.unit === 'fahrenheit') {
    return Math.round((rawTemp * 9) / 5 + 32)
  }

  return rawTemp
})
</script>

<template>
  <div class="">
    <h2>지역별 상세 기상 관측 정보</h2>
    <div v-if="selectedCity" class="info-card">
      <h4>지정 지역: {{ selectedCity.name }}</h4>
      <p>실시간 기온: {{ displayTemp }}{{ configStore.unitSymbol }}</p>
      <p>기상 현황: {{ selectedCity.status }}</p>
      <p>대기 습도: {{ selectedCity.humidity }}%</p>
      <p>현재 풍속: {{ selectedCity.wind }}</p>
    </div>
    <div v-else>해당 지역의 상세 정보가 존재하지 않습니다.</div>
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
.back-btn {
  padding: 8px 12px;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
