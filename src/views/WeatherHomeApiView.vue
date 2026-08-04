<script setup>
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

import BaseDashboardCard from '@/components/practices/exercise/BaseDashboardCard.vue'
import LoadingIndicator from '@/components/practices/exercise/LoadingIndicator.vue'
import SearchBar from '@/components/practices/exercise/SearchBar.vue'
import WeatherCard from '@/components/practices/exercise/WeatherCard.vue'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const router = useRouter()

const defaultCities = [
  {
    id: 'api_city_01',
    name: '서울',
    country: 'KR',
    temp: 28,
    status: '맑음',
    humidity: 55,
    wind: 2.5,
    lat: 37.5665,
    lon: 126.978,
  },
  {
    id: 'api_city_02',
    name: '수원',
    country: 'KR',
    temp: 24,
    status: '비',
    humidity: 85,
    wind: 4.1,
    lat: 37.2636,
    lon: 127.0286,
  },
  {
    id: 'api_city_03',
    name: '부산',
    country: 'KR',
    temp: 26,
    status: '구름',
    humidity: 65,
    wind: 5,
    lat: 35.1796,
    lon: 129.0756,
  },
  {
    id: 'api_city_04',
    name: '강릉',
    country: 'KR',
    temp: 18,
    status: '맑음',
    humidity: 60,
    wind: 2.8,
    lat: 37.7519,
    lon: 128.8761,
  },
]

const initialWeatherList = ref([])
const weatherList = ref([])
const cityName = ref('')
const selectedCityId = ref(null)
const selectedCityInfo = ref('카드를 클릭하거나 검색해보세요.')
const isLoading = ref(false)
const errorMessage = ref('')
const isConfigured = computed(() => Boolean(API_KEY))

const fetchWeatherByCoordinates = async (city) => {
  const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
    params: {
      lat: city.lat,
      lon: city.lon,
      units: 'metric',
      lang: 'kr',
      appid: API_KEY,
    },
  })

  const data = response.data

  return {
    ...city,
    temp: Math.round(data.main.temp),
    status: data.weather[0].description,
    humidity: data.main.humidity,
    wind: data.wind.speed,
  }
}

const fetchDefaultWeather = async () => {
  if (!API_KEY) {
    initialWeatherList.value = defaultCities.map((city) => ({ ...city }))
    weatherList.value = initialWeatherList.value.map((city) => ({ ...city }))
    errorMessage.value = '.env.local에 OpenWeather API 키를 설정하세요.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    const results = await Promise.allSettled(
      defaultCities.map((city) => fetchWeatherByCoordinates(city)),
    )
    const successCount = results.filter((result) => result.status === 'fulfilled').length

    initialWeatherList.value = results.map((result, index) =>
      result.status === 'fulfilled' ? result.value : { ...defaultCities[index] },
    )
    weatherList.value = initialWeatherList.value.map((city) => ({ ...city }))

    if (successCount === 0) {
      initialWeatherList.value = defaultCities.map((city) => ({ ...city }))
      weatherList.value = initialWeatherList.value.map((city) => ({ ...city }))
      errorMessage.value = '실시간 날씨를 불러오지 못해 기본 데이터를 표시합니다.'
    }
  } finally {
    isLoading.value = false
  }
}

const handleSearch = async () => {
  const query = cityName.value.trim()

  if (!query) {
    errorMessage.value = '검색할 도시 이름을 입력하세요.'
    return
  }

  if (!API_KEY) {
    errorMessage.value = '.env.local에 OpenWeather API 키를 설정하세요.'
    return
  }

  if (isLoading.value) {
    return
  }

  isLoading.value = true
  errorMessage.value = ''
  selectedCityId.value = null
  selectedCityInfo.value = '날씨 정보를 검색하고 있습니다.'

  try {
    const locationResponse = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
      params: {
        q: query,
        limit: 1,
        appid: API_KEY,
      },
    })
    const location = locationResponse.data[0]

    if (!location) {
      weatherList.value = []
      errorMessage.value = '검색 결과와 일치하는 도시가 없습니다.'
      selectedCityInfo.value = '도시를 검색해보세요.'
      return
    }

    const searchedWeather = await fetchWeatherByCoordinates({
      id: `api-${location.lat}-${location.lon}`,
      name: location.local_names?.ko ?? location.name,
      country: location.country,
      lat: location.lat,
      lon: location.lon,
    })

    weatherList.value = [searchedWeather]
    selectedCityInfo.value = '검색한 도시의 실시간 날씨입니다.'
  } catch (error) {
    const status = error.response?.status

    if (status === 401) {
      errorMessage.value = 'API 키가 유효하지 않거나 아직 활성화되지 않았습니다.'
    } else if (status === 429) {
      errorMessage.value = 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도하세요.'
    } else {
      errorMessage.value = '날씨 정보를 가져오지 못했습니다. 잠시 후 다시 시도하세요.'
    }

    selectedCityInfo.value = '도시를 검색해보세요.'
  } finally {
    isLoading.value = false
  }
}

const selectCity = (item) => {
  selectedCityId.value = item.id
  selectedCityInfo.value = `${item.name}이 선택되었습니다.`
}

const showDetails = (item) => {
  router.push({
    name: 'WeatherDetail',
    params: { cityId: item.id },
    query: {
      lat: item.lat,
      lon: item.lon,
      name: item.name,
      country: item.country,
    },
  })
}

watch(cityName, (query) => {
  if (query.trim()) {
    return
  }

  weatherList.value = initialWeatherList.value.map((city) => ({ ...city }))
  selectedCityId.value = null
  selectedCityInfo.value = '카드를 클릭하거나 검색해보세요.'
  errorMessage.value = ''
})

onMounted(fetchDefaultWeather)
</script>

<template>
  <div>
    <BaseDashboardCard>
      <SearchBar
        :current-query="cityName"
        :search-results="weatherList"
        :show-result-message="false"
        @update-query="cityName = $event"
        @search="handleSearch"
      />

      <p v-if="!isConfigured" class="setup-message">
        `.env.local`에 `VITE_OPENWEATHER_API_KEY`를 설정해야 합니다.
      </p>
      <p v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </p>
    </BaseDashboardCard>

    <BaseDashboardCard>
      <h3>🏙️ 지역별 날씨 현황</h3>

      <LoadingIndicator v-if="isLoading" message="실시간 날씨 정보를 불러오는 중입니다." />

      <template v-else>
        <WeatherCard
          v-for="item in weatherList"
          :key="item.id"
          :city-item="item"
          :is-selected="selectedCityId === item.id"
          @select-card="selectCity(item)"
          @click-detail="showDetails(item)"
        />
      </template>
    </BaseDashboardCard>

    <div class="status-bar">
      {{ selectedCityInfo }}
    </div>
  </div>
</template>

<style scoped>
.setup-message,
.error-message {
  margin-top: 12px;
  color: #d63031;
}
</style>
