import { computed, ref } from 'vue'

import {
  fetchForecastByCoordinates,
  isOpenWeatherConfigured,
} from '@/api/dashboard/openWeather'

export const useWeatherForecast = (weatherStore) => {
  const forecastList = ref([])
  const forecastErrorMessage = ref('')
  const isForecastLoading = ref(false)
  let forecastRequestId = 0

  const hourlyForecastList = computed(() => forecastList.value.slice(0, 8))

  // 지역 선택 시에만 예보 조회, 재선택은 Pinia 캐시 우선 사용
  const loadForecast = async (weather) => {
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

  return {
    forecastList,
    forecastErrorMessage,
    hourlyForecastList,
    isForecastLoading,
    loadForecast,
  }
}
