<script setup>
import axios from 'axios'
import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'

import {
  fetchForecastByCoordinates,
  isOpenWeatherConfigured,
} from '@/api/openWeather'
import LoadingIndicator from '@/components/practices/exercise/LoadingIndicator.vue'
import SearchBar from '@/components/practices/exercise/SearchBar.vue'
import WeatherDailyForecast from '@/components/practices/exercise/WeatherDailyForecast.vue'
import WeatherCard from '@/components/practices/exercise/WeatherCard.vue'
import WeatherRegionOverview from '@/components/practices/exercise/WeatherRegionOverview.vue'
import { countryRegions, defaultCountries } from '@/data/weatherLocations'
import { useWeatherStore } from '@/stores/weatherStore'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const weatherStore = useWeatherStore()
const WeatherMapChart = defineAsyncComponent(
  () => import('@/components/practices/exercise/WeatherMapChart.vue'),
)
const WeatherForecastChart = defineAsyncComponent(
  () => import('@/components/practices/exercise/WeatherForecastChart.vue'),
)

// 역할 분리: API·화면 상태는 View, 페이지 간 재사용 결과는 Pinia에서 관리
const worldWeatherList = ref([]) // 검색 초기화용 국가 날씨 목록
const countryWeatherList = ref([]) // 선택 국가의 대표 지역 날씨 목록
const weatherList = ref([]) // 현재 왼쪽 목록과 지도에 출력할 데이터

const cityName = ref('')
const selectedCityId = ref(null)
const selectedCountryCode = ref('')
const selectedCityInfo = ref('국가를 선택해 지역 날씨를 확인해보세요.')
const isLoading = ref(false)
const errorMessage = ref('')
const isSearchResultActive = ref(false)
const forecastList = ref([])
const forecastErrorMessage = ref('')
const isForecastLoading = ref(false)
let forecastRequestId = 0

const isConfigured = computed(() => Boolean(API_KEY))
const selectedCountry = computed(() =>
  defaultCountries.find((country) => country.countryCode === selectedCountryCode.value),
)
const isCountryView = computed(() => Boolean(selectedCountry.value))
const isSearchView = computed(() => Boolean(cityName.value.trim()))
const selectedWeather = computed(() =>
  weatherList.value.find((item) => item.id === selectedCityId.value),
)
const hourlyForecastList = computed(() => forecastList.value.slice(0, 8))
const locationListTitle = computed(() => {
  if (isSearchView.value) return '검색 결과'
  if (selectedCountry.value) return `${selectedCountry.value.name} 주요 지역`
  return '기본 국가'
})
const overviewBackLabel = computed(() => {
  if (isSearchView.value) return '검색 결과'
  return isCountryView.value ? '지역 목록' : '국가 목록'
})

const findSearchCountry = (weather) =>
  defaultCountries.find((country) => country.country === weather.country)

const hasCountryRegions = (country) => Boolean(countryRegions[country.countryCode]?.length)

// 검색 결과는 국가 지도로 전환한 뒤 선택 지역 상세 패널을 바로 노출
const showSearchResult = (weather, message) => {
  const country = findSearchCountry(weather)

  selectedCountryCode.value = country?.countryCode ?? ''
  weatherList.value = [{ ...weather }]
  selectedCityId.value = weather.id
  selectedCityInfo.value = message
  isSearchResultActive.value = true
  errorMessage.value = ''
}

// 좌표 기반 OpenWeather 조회 및 화면용 데이터 형태 변환
const fetchWeatherByCoordinates = async (location) => {
  const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
    params: {
      lat: location.lat,
      lon: location.lon,
      units: 'metric',
      lang: 'kr',
      appid: API_KEY,
    },
  })

  const data = response.data

  return {
    ...location,
    temp: Math.round(data.main.temp),
    status: data.weather[0].description,
    humidity: data.main.humidity,
    wind: data.wind.speed,
    feelsLike: Math.round(data.main.feels_like),
    visibility: Math.round((data.visibility ?? 0) / 100) / 10,
    sunrise: data.sys?.sunrise,
    sunset: data.sys?.sunset,
    timezone: data.timezone,
    observedAt: data.dt,
  }
}

// 동일 위치 캐시 우선 사용 및 미조회 위치만 API 호출
const loadWeatherLocations = async (locations, logNewRequest = false) => {
  const results = await Promise.allSettled(
    locations.map(async (location) => {
      const cachedWeather = weatherStore.getWeather(location.name)

      if (cachedWeather?.id === location.id) {
        return cachedWeather
      }

      if (logNewRequest) {
        console.log(`[Weather API] 새로 불러오기: ${location.name}`)
      }

      const weather = await fetchWeatherByCoordinates(location)
      weatherStore.saveWeather(location.name, weather)
      return weather
    }),
  )

  return results.filter((result) => result.status === 'fulfilled').map((result) => result.value)
}

// 첫 화면의 기본 국가 병렬 조회 및 세계 지도 데이터 구성
const fetchDefaultWeather = async () => {
  if (!API_KEY) {
    errorMessage.value = '.env.local에 OpenWeather API 키를 설정하세요.'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    worldWeatherList.value = await loadWeatherLocations(defaultCountries)
    weatherList.value = worldWeatherList.value.map((country) => ({ ...country }))

    if (weatherList.value.length === 0) {
      errorMessage.value = '실시간 날씨를 불러오지 못했습니다.'
    } else if (weatherList.value.length < defaultCountries.length) {
      errorMessage.value = '일부 국가의 날씨를 불러오지 못했습니다.'
    }
  } finally {
    isLoading.value = false
  }
}

// 세계 지도에서 선택한 국가의 대표 지역 조회 및 행정구역 지도 전환
const enterCountry = async (country) => {
  const regions = countryRegions[country.countryCode]

  if (!regions || isLoading.value) {
    return
  }

  if (!API_KEY) {
    errorMessage.value = '.env.local에 OpenWeather API 키를 설정하세요.'
    return
  }

  selectedCityId.value = null
  selectedCountryCode.value = country.countryCode
  isSearchResultActive.value = false
  countryWeatherList.value = []
  isLoading.value = true
  errorMessage.value = ''

  try {
    countryWeatherList.value = await loadWeatherLocations(regions, true)

    if (countryWeatherList.value.length === 0) {
      selectedCountryCode.value = ''
      weatherList.value = worldWeatherList.value.map((item) => ({ ...item }))
      errorMessage.value = `${country.name} 지역 날씨를 불러오지 못했습니다.`
      return
    }

    weatherList.value = countryWeatherList.value.map((region) => ({ ...region }))
    selectedCityInfo.value = `${country.name}의 주요 지역 날씨입니다.`

    if (weatherList.value.length < regions.length) {
      errorMessage.value = '일부 지역의 날씨를 불러오지 못했습니다.'
    }
  } finally {
    isLoading.value = false
  }
}

const returnToWorld = () => {
  cityName.value = ''
  selectedCountryCode.value = ''
  selectedCityId.value = null
  countryWeatherList.value = []
  weatherList.value = worldWeatherList.value.map((country) => ({ ...country }))
  selectedCityInfo.value = '국가를 선택해 지역 날씨를 확인해보세요.'
  errorMessage.value = ''
  isSearchResultActive.value = false
}

// 캐시 우선 검색 및 캐시 미존재 시에만 위치·날씨 API 호출
const handleSearch = async () => {
  const query = cityName.value.trim()

  if (!query) {
    errorMessage.value = '검색할 도시 이름을 입력하세요.'
    return
  }

  if (isLoading.value) {
    return
  }

  const cachedWeather = weatherStore.getWeather(query)

  if (cachedWeather) {
    showSearchResult(cachedWeather, '저장된 날씨 정보를 불러왔습니다.')
    return
  }

  selectedCountryCode.value = ''
  selectedCityId.value = null

  if (!API_KEY) {
    errorMessage.value = '.env.local에 OpenWeather API 키를 설정하세요.'
    return
  }

  console.log(`[Weather API] 새로 불러오기: ${query}`)

  isLoading.value = true
  errorMessage.value = ''
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

    weatherStore.saveWeather(query, searchedWeather)
    showSearchResult(searchedWeather, '검색한 도시의 실시간 날씨입니다.')
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

const closeSelectedWeather = () => {
  selectedCityId.value = null
  selectedCityInfo.value = isSearchView.value
    ? '검색한 도시의 실시간 날씨입니다.'
    : isCountryView.value
    ? `${selectedCountry.value.name}의 주요 지역 날씨입니다.`
    : '국가를 선택해 지역 날씨를 확인해보세요.'
}

const handleListSelect = (item) => {
  if (!isCountryView.value && !isSearchView.value) {
    if (hasCountryRegions(item)) {
      enterCountry(item)
    } else {
      selectCity(item)
    }
    return
  }

  selectCity(item)
}

const handleMapCountrySelect = (country) => {
  if (hasCountryRegions(country)) {
    enterCountry(country)
    return
  }

  selectCity(country)
}


// 지역 선택 시에만 예보 조회, 재선택은 Pinia 캐시 우선 사용
const loadSelectedForecast = async (weather) => {
  const currentRequestId = ++forecastRequestId

  forecastList.value = []
  forecastErrorMessage.value = ''

  if (!weather) {
    isForecastLoading.value = false
    return
  }

  if (
    !Number.isFinite(Number(weather.lat)) ||
    !Number.isFinite(Number(weather.lon)) ||
    !isOpenWeatherConfigured()
  ) {
    forecastErrorMessage.value = '날씨 예보를 불러올 좌표 또는 API 키가 없습니다.'
    return
  }

  const cachedForecast = weatherStore.getForecast(weather.lat, weather.lon)

  if (cachedForecast) {
    forecastList.value = cachedForecast
    return
  }

  isForecastLoading.value = true
  console.log(`[Weather API] 상세 예보 새로 불러오기: ${weather.name}`)

  try {
    const forecast = await fetchForecastByCoordinates(weather.lat, weather.lon)

    if (currentRequestId !== forecastRequestId) return

    weatherStore.saveForecast(weather.lat, weather.lon, forecast)
    forecastList.value = forecast
  } catch (error) {
    if (currentRequestId !== forecastRequestId) return

    const status = error.response?.status

    if (status === 401) {
      forecastErrorMessage.value = 'API 키가 유효하지 않거나 아직 활성화되지 않았습니다.'
    } else if (status === 429) {
      forecastErrorMessage.value = '예보 API 요청 한도를 초과했습니다. 잠시 후 다시 시도하세요.'
    } else {
      forecastErrorMessage.value = '날씨 예보를 불러오지 못했습니다.'
    }
  } finally {
    if (currentRequestId === forecastRequestId) {
      isForecastLoading.value = false
    }
  }
}

// 검색어 초기화 시 현재 지도 단계의 기존 목록 복원
watch(cityName, (query) => {
  if (query.trim()) {
    return
  }

  if (isSearchResultActive.value) {
    isSearchResultActive.value = false
    selectedCountryCode.value = ''
    selectedCityId.value = null
    weatherList.value = worldWeatherList.value.map((country) => ({ ...country }))
    selectedCityInfo.value = '국가를 선택해 지역 날씨를 확인해보세요.'
    errorMessage.value = ''
    return
  }

  weatherList.value = isCountryView.value
    ? countryWeatherList.value.map((region) => ({ ...region }))
    : worldWeatherList.value.map((country) => ({ ...country }))
  selectedCityId.value = null
  selectedCityInfo.value = isCountryView.value
    ? `${selectedCountry.value.name}의 주요 지역 날씨입니다.`
    : '국가를 선택해 지역 날씨를 확인해보세요.'
  errorMessage.value = ''
})

watch(selectedWeather, loadSelectedForecast)

onMounted(fetchDefaultWeather)
</script>

<template>
  <div class="weather-api-dashboard">
    <header class="dashboard-search-row">
      <div class="dashboard-intro">
        <h2>오늘의 전 세계 날씨</h2>
        <p>국가를 선택해 지역으로 들어가거나 도시를 바로 검색해보세요.</p>
      </div>

      <SearchBar
        dashboard
        :current-query="cityName"
        :search-results="weatherList"
        :show-result-message="false"
        @update-query="cityName = $event"
        @search="handleSearch"
      />
    </header>

    <p v-if="!isConfigured" class="dashboard-alert">
      `.env.local`에 `VITE_OPENWEATHER_API_KEY`를 설정해야 합니다.
    </p>
    <p v-if="errorMessage" class="dashboard-alert">
      {{ errorMessage }}
    </p>

    <div class="weather-dashboard-grid" :class="{ 'has-region-overview': selectedWeather }">
      <aside class="locations-panel">
        <button
          v-if="selectedWeather"
          class="world-back-button"
          type="button"
          @click="closeSelectedWeather"
        >
          ← {{ overviewBackLabel }}
        </button>

        <button
          v-else-if="isCountryView"
          class="world-back-button"
          type="button"
          @click="returnToWorld"
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
              @select-card="handleListSelect(item)"
            />
          </div>

          <div v-else class="empty-location-state">
            <span>⌕</span>
            <p>표시할 지역이 없습니다.</p>
          </div>
        </template>

        <WeatherRegionOverview
          v-else
          :weather="selectedWeather"
        />
      </aside>

      <div class="map-panel" :class="{ 'region-forecast-panel': selectedWeather }">
        <div v-if="isLoading && weatherList.length > 0" class="map-loading-overlay">
          <LoadingIndicator message="실시간 날씨 지도를 준비하는 중입니다." />
        </div>

        <LoadingIndicator
          v-if="selectedWeather && isForecastLoading"
          class="region-forecast-loading"
          message="선택한 지역의 날씨 예보를 불러오는 중입니다."
        />

        <div v-else-if="selectedWeather" class="region-forecast-layout">
          <div class="forecast-daily-slot">
            <p v-if="forecastErrorMessage" class="forecast-inline-error" role="alert">
              {{ forecastErrorMessage }}
            </p>
            <WeatherDailyForecast
              v-else-if="forecastList.length > 0"
              :forecast-list="forecastList"
            />
          </div>

          <WeatherMapChart
            key="forecast-map"
            :weather-list="weatherList"
            :selected-city-id="selectedCityId"
            :selected-country-code="selectedCountryCode"
            :selected-country-name="selectedCountry?.name"
            @select-city="selectCity"
            @select-country="handleMapCountrySelect"
          />

          <div class="forecast-chart-slot">
            <WeatherForecastChart
              v-if="forecastList.length > 0"
              :forecast-list="hourlyForecastList"
              :height="200"
            />
          </div>
        </div>

        <WeatherMapChart
          v-else-if="weatherList.length > 0"
          key="main-map"
          :weather-list="weatherList"
          :selected-city-id="selectedCityId"
          :selected-country-code="selectedCountryCode"
          :selected-country-name="selectedCountry?.name"
          @select-city="selectCity"
          @select-country="handleMapCountrySelect"
        />

        <LoadingIndicator
          v-if="weatherList.length === 0 && isLoading"
          message="실시간 날씨 지도를 준비하는 중입니다."
        />

        <div v-else-if="weatherList.length === 0" class="empty-map-state">
          <strong>검색 결과가 없습니다.</strong>
          <span>검색어를 지우면 기존 지도 목록으로 돌아갑니다.</span>
        </div>
      </div>
    </div>
  </div>
</template>
