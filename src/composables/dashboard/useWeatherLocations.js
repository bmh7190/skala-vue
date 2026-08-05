import { computed, ref } from 'vue'

import {
  fetchCurrentWeatherByCoordinates,
  isOpenWeatherConfigured,
} from '@/api/dashboard/openWeather'
import { countryRegions, defaultCountries } from '@/data/dashboard/weatherLocations'

export const useWeatherLocations = (weatherStore) => {
  const worldWeatherList = ref([])
  const countryWeatherList = ref([])
  const weatherList = ref([])
  const selectedCityId = ref(null)
  const selectedCountryCode = ref('')
  const selectedCityInfo = ref('국가를 선택해 지역 날씨를 확인해보세요.')
  const isLoading = ref(false)
  const errorMessage = ref('')
  const isSearchResultActive = ref(false)

  const isConfigured = computed(() => isOpenWeatherConfigured())
  const selectedCountry = computed(() =>
    defaultCountries.find((country) => country.countryCode === selectedCountryCode.value),
  )
  const isCountryView = computed(() => Boolean(selectedCountry.value))
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

  const hasCountryRegions = (country) => Boolean(countryRegions[country.countryCode]?.length)

  const showSearchResult = (weather, message) => {
    const country = defaultCountries.find((item) => item.country === weather.country)

    selectedCountryCode.value = country?.countryCode ?? ''
    weatherList.value = [{ ...weather }]
    selectedCityId.value = weather.id
    selectedCityInfo.value = message
    isSearchResultActive.value = true
    errorMessage.value = ''
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

        const weather = await fetchCurrentWeatherByCoordinates(location)
        weatherStore.saveWeather(location.name, weather)
        return weather
      }),
    )

    return results.filter((result) => result.status === 'fulfilled').map((result) => result.value)
  }

  // 첫 화면의 기본 국가 병렬 조회 및 세계 지도 데이터 구성
  const fetchDefaultWeather = async () => {
    if (!isConfigured.value) {
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

    if (!regions || isLoading.value) return

    if (!isConfigured.value) {
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
    selectedCountryCode.value = ''
    selectedCityId.value = null
    countryWeatherList.value = []
    weatherList.value = worldWeatherList.value.map((country) => ({ ...country }))
    selectedCityInfo.value = '국가를 선택해 지역 날씨를 확인해보세요.'
    errorMessage.value = ''
    isSearchResultActive.value = false
  }

  const selectCity = (item) => {
    selectedCityId.value = item.id
    selectedCityInfo.value = `${item.name}이 선택되었습니다.`
  }

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
    const cacheKey = `map:${location.countryCode || 'world'}:${location.mapKey}`
    const cachedWeather = weatherStore.getWeather(cacheKey)

    if (cachedWeather) {
      addMapWeather(cachedWeather)
      return
    }

    if (!isConfigured.value) {
      errorMessage.value = '.env.local에 OpenWeather API 키를 설정하세요.'
      return
    }

    console.log(`[Weather API] 지도에서 새로 불러오기: ${location.name}`)
    isLoading.value = true
    errorMessage.value = ''

    try {
      const weather = await fetchCurrentWeatherByCoordinates(location)

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

  const closeSelectedWeather = (isSearchView) => {
    if (isSearchView) {
      returnToWorld()
      return
    }

    selectedCityId.value = null
    selectedCityInfo.value = isCountryView.value
      ? '지역을 선택해 상세 날씨와 예보를 확인해보세요.'
      : '국가를 선택해 지역 날씨를 확인해보세요.'
  }

  const handleListSelect = (item, isSearchView) => {
    if (!isCountryView.value && !isSearchView) {
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

  // 검색어가 지워지면 현재 지도 단계의 기존 목록 복원
  const restoreListAfterSearch = () => {
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
  }

  return {
    errorMessage,
    fetchDefaultWeather,
    handleListSelect,
    handleMapAreaSelect,
    handleMapCountrySelect,
    isConfigured,
    isCountryView,
    isLoading,
    mapWeatherList,
    restoreListAfterSearch,
    returnToWorld,
    selectedCityId,
    selectedCityInfo,
    selectedCountry,
    selectedCountryCode,
    selectedWeather,
    showSearchResult,
    closeSelectedWeather,
    weatherList,
  }
}
