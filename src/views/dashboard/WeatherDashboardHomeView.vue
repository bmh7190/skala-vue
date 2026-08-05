<script setup>
import axios from 'axios'
import { computed, onMounted, ref, watch } from 'vue'

import {
  fetchForecastByCoordinates,
  isOpenWeatherConfigured,
} from '@/api/dashboard/openWeather'
import SearchBar from '@/components/dashboard/common/SearchBar.vue'
import WeatherForecastPanel from '@/components/dashboard/forecast/WeatherForecastPanel.vue'
import WeatherLocationPanel from '@/components/dashboard/weather/WeatherLocationPanel.vue'
import { countryRegions, defaultCountries } from '@/data/dashboard/weatherLocations'
import { useWeatherDashboardStore } from '@/stores/dashboard/weatherDashboardStore'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const weatherStore = useWeatherDashboardStore()
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
const mapWeatherList = computed(() => {
  const cachedWeatherList = Object.values(weatherStore.weatherCache)
  const scopedCache = selectedCountry.value
    ? cachedWeatherList.filter(
        (weather) =>
          (weather.country === selectedCountry.value.country ||
            weather.countryCode === selectedCountry.value.countryCode) &&
          weather.mapKey &&
          weather.mapKey !== selectedCountry.value.mapKey,
      )
    : cachedWeatherList.filter(
        (weather) => weather.mapKey && !weather.mapKey.includes('-'),
      )
  const uniqueWeather = new Map()
  const combinedWeatherList = [...scopedCache, ...weatherList.value]

  combinedWeatherList.forEach((weather) => {
    const hasCoordinates =
      Number.isFinite(Number(weather.lat)) && Number.isFinite(Number(weather.lon))
    const key = hasCoordinates
      ? `${Number(weather.lat).toFixed(3)},${Number(weather.lon).toFixed(3)}`
      : String(weather.id)

    uniqueWeather.set(key, weather)
  })

  return [...uniqueWeather.values()]
})
const hourlyForecastList = computed(() => forecastList.value.slice(0, 8))
const locationListTitle = computed(() => {
  if (isSearchView.value) return '검색 결과'
  if (selectedCountry.value) return `${selectedCountry.value.name} 주요 지역`
  return '기본 국가'
})
const overviewBackLabel = computed(() => {
  if (isSearchView.value) return '세계 지도'
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
    selectedCityInfo.value = '지역을 선택해 상세 날씨와 예보를 확인해보세요.'

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

const getMapWeatherCacheKey = (location) =>
  `map:${location.countryCode || 'world'}:${location.mapKey}`

const resolveMapLocation = (area) => {
  const knownLocations = selectedCountryCode.value
    ? countryRegions[selectedCountryCode.value] ?? []
    : defaultCountries

  return knownLocations.find((location) => location.mapKey === area.mapKey) ?? area
}

const addMapWeather = (weather) => {
  const isSameWeather = (item) =>
    item.id === weather.id || (weather.mapKey && item.mapKey === weather.mapKey)

  weatherList.value = [
    ...weatherList.value.filter((item) => !isSameWeather(item)),
    weather,
  ]

  if (isCountryView.value) {
    countryWeatherList.value = [
      ...countryWeatherList.value.filter((item) => !isSameWeather(item)),
      weather,
    ]
  }

  selectCity(weather)
}

// 지도 영역 선택: 현재 목록, Pinia 캐시, API 순서로 날씨 조회
const handleMapAreaSelect = async (area) => {
  if (Number.isFinite(area.temp)) {
    const isCurrentWeather = weatherList.value.some((weather) => weather.id === area.id)

    if (isCurrentWeather) {
      selectCity(area)
    } else {
      addMapWeather(area)
    }
    return
  }

  if (isLoading.value) return

  const location = resolveMapLocation(area)
  const cacheKey = getMapWeatherCacheKey(location)
  const cachedWeather = weatherStore.getWeather(cacheKey)

  if (cachedWeather) {
    addMapWeather(cachedWeather)
    return
  }

  if (!API_KEY) {
    errorMessage.value = '.env.local에 OpenWeather API 키를 설정하세요.'
    return
  }

  console.log(`[Weather API] 지도에서 새로 불러오기: ${location.name}`)
  isLoading.value = true
  errorMessage.value = ''

  try {
    const weather = await fetchWeatherByCoordinates(location)

    weatherStore.saveWeather(cacheKey, weather)
    weatherStore.saveWeather(location.name, weather)
    addMapWeather(weather)
  } catch (error) {
    const status = error.response?.status

    if (status === 401) {
      errorMessage.value = 'API 키가 유효하지 않거나 아직 활성화되지 않았습니다.'
    } else if (status === 429) {
      errorMessage.value = 'API 요청 한도를 초과했습니다. 잠시 후 다시 시도하세요.'
    } else {
      errorMessage.value = '선택한 영역의 날씨를 불러오지 못했습니다.'
    }
  } finally {
    isLoading.value = false
  }
}

const closeSelectedWeather = () => {
  if (isSearchView.value) {
    returnToWorld()
    return
  }

  selectedCityId.value = null
  selectedCityInfo.value = isCountryView.value
    ? '지역을 선택해 상세 날씨와 예보를 확인해보세요.'
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

const handleMapCountrySelect = (area) => {
  const country = defaultCountries.find((item) => item.mapKey === area.mapKey) ?? area

  if (hasCountryRegions(country)) {
    enterCountry(country)
    return
  }

  handleMapAreaSelect(country)
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
    ? '지역을 선택해 상세 날씨와 예보를 확인해보세요.'
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
      <WeatherLocationPanel
        :selected-weather="selectedWeather"
        :is-country-view="isCountryView"
        :overview-back-label="overviewBackLabel"
        :location-list-title="locationListTitle"
        :weather-list="weatherList"
        :selected-city-info="selectedCityInfo"
        :is-loading="isLoading"
        :selected-city-id="selectedCityId"
        @close-selected-weather="closeSelectedWeather"
        @return-to-world="returnToWorld"
        @select-item="handleListSelect"
      />

      <WeatherForecastPanel
        :selected-weather="selectedWeather"
        :is-loading="isLoading"
        :is-forecast-loading="isForecastLoading"
        :weather-list="weatherList"
        :map-weather-list="mapWeatherList"
        :forecast-list="forecastList"
        :hourly-forecast-list="hourlyForecastList"
        :forecast-error-message="forecastErrorMessage"
        :selected-city-id="selectedCityId"
        :selected-country-code="selectedCountryCode"
        :selected-country-name="selectedCountry?.name"
        @select-map-area="handleMapAreaSelect"
        @select-map-country="handleMapCountrySelect"
      />
    </div>
  </div>
</template>

<style scoped>
.weather-api-dashboard {
  display: flex;
  height: 100%;
  min-height: 0;
  padding: clamp(24px, 2.5vw, 40px);
  overflow: hidden;
  flex-direction: column;
}

.dashboard-search-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(330px, 440px);
  align-items: end;
  flex: 0 0 auto;
  gap: 32px;
  margin-bottom: 22px;
}

.dashboard-intro h2 {
  margin: 4px 0 4px;
  padding-bottom: 0;
  border-bottom: 0;
  color: var(--dashboard-text);
  font-size: clamp(24px, 3vw, 34px);
  font-weight: 760;
  letter-spacing: -0.04em;
}

.dashboard-intro p {
  color: var(--dashboard-muted);
  font-size: 13px;
}

.dashboard-alert {
  margin: -8px 0 18px;
  padding: 10px 13px;
  border: 1px solid rgba(251, 113, 133, 0.24);
  border-radius: 10px;
  background: rgba(159, 18, 57, 0.13);
  color: #fda4af;
  font-size: 12px;
}

.weather-dashboard-grid {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: minmax(340px, 390px) minmax(0, 1fr);
  align-items: stretch;
  gap: 18px;
}

.weather-dashboard-grid.has-region-overview :deep(.locations-panel) {
  min-height: 0;
  overflow: hidden;
}

/* 낮은 데스크톱에서도 지역 상세 전체를 스크롤 없이 한 화면에 배치 */
@media (min-width: 901px) and (max-height: 800px) {
  .weather-api-dashboard {
    padding: 20px clamp(24px, 2.5vw, 36px);
  }

  .dashboard-search-row {
    gap: 24px;
    margin-bottom: 14px;
  }

  .dashboard-intro h2 {
    font-size: 30px;
  }
}

@media (min-width: 901px) and (max-height: 680px) {
  .weather-api-dashboard {
    padding-top: 14px;
    padding-bottom: 14px;
  }

  .dashboard-search-row {
    margin-bottom: 10px;
  }

  .dashboard-intro h2 {
    font-size: 26px;
  }
}

@media (max-width: 900px) {
  .weather-api-dashboard {
    display: block;
    height: auto;
    overflow: visible;
  }

  .dashboard-search-row,
  .weather-dashboard-grid,
  .weather-dashboard-grid.has-region-overview {
    grid-template-columns: 1fr;
  }

  .weather-dashboard-grid,
  .weather-dashboard-grid.has-region-overview {
    min-height: 0;
    flex: none;
    height: auto;
  }

  .weather-dashboard-grid.has-region-overview :deep(.locations-panel) {
    min-height: auto;
    overflow: visible;
  }
}

@media (max-width: 600px) {
  .weather-api-dashboard {
    padding: 18px;
  }

  .dashboard-search-row {
    gap: 20px;
  }
}
</style>
