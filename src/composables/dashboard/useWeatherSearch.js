import { computed, ref, watch } from 'vue'

import {
  fetchCurrentWeatherByCoordinates,
  fetchLocationByName,
} from '@/api/dashboard/openWeather'

export const useWeatherSearch = (weatherStore, weatherLocations) => {
  const cityName = ref('')
  const isSearchView = computed(() => Boolean(cityName.value.trim()))

  const {
    closeSelectedWeather: closeLocationWeather,
    errorMessage,
    handleListSelect: selectLocation,
    isConfigured,
    isLoading,
    restoreListAfterSearch,
    returnToWorld: resetToWorld,
    selectedCityId,
    selectedCityInfo,
    selectedCountryCode,
    showSearchResult,
    weatherList,
  } = weatherLocations

  // 캐시 우선 검색 및 캐시 미존재 시에만 위치·날씨 API 호출
  const handleSearch = async () => {
    const query = cityName.value.trim()

    if (!query) {
      errorMessage.value = '검색할 도시 이름을 입력하세요.'
      return
    }

    if (isLoading.value) return

    const cachedWeather = weatherStore.getWeather(query)

    if (cachedWeather) {
      showSearchResult(cachedWeather, '저장된 날씨 정보를 불러왔습니다.')
      return
    }

    selectedCountryCode.value = ''
    selectedCityId.value = null

    if (!isConfigured.value) {
      errorMessage.value = '.env.local에 OpenWeather API 키를 설정하세요.'
      return
    }

    console.log(`[Weather API] 새로 불러오기: ${query}`)

    isLoading.value = true
    errorMessage.value = ''
    selectedCityInfo.value = '날씨 정보를 검색하고 있습니다.'

    try {
      const location = await fetchLocationByName(query)

      if (!location) {
        weatherList.value = []
        errorMessage.value = '검색 결과와 일치하는 도시가 없습니다.'
        selectedCityInfo.value = '도시를 검색해보세요.'
        return
      }

      const searchedWeather = await fetchCurrentWeatherByCoordinates(location)

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

  const closeSelectedWeather = () => {
    const wasSearchView = isSearchView.value

    if (wasSearchView) {
      cityName.value = ''
    }

    closeLocationWeather(wasSearchView)
  }

  const returnToWorld = () => {
    cityName.value = ''
    resetToWorld()
  }

  const handleListSelect = (item) => selectLocation(item, isSearchView.value)

  // 검색어 초기화 시 현재 지도 단계의 기존 목록 복원
  watch(cityName, (query) => {
    if (!query.trim()) restoreListAfterSearch()
  })

  return {
    cityName,
    closeSelectedWeather,
    handleListSelect,
    handleSearch,
    isSearchView,
    returnToWorld,
  }
}
