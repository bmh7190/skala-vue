import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useWeatherDashboardStore = defineStore('weatherDashboard', () => {
  // 검색어 기반 메모리 캐시: 조회 결과의 페이지 간 재사용
  // 새로고침 시 초기화되는 실습용 단순 구조
  const weatherCache = ref({})
  const forecastCache = ref({})
  const forecastCacheDuration = 10 * 60 * 1000

  // 검색어 정규화: 앞뒤 공백·영문 대소문자로 인한 중복 호출 방지
  const getWeather = (query) => {
    return weatherCache.value[query.trim().toLowerCase()]
  }

  // 상세 페이지의 URL 파라미터 대응을 위한 cityId 기준 조회
  const getWeatherById = (cityId) => {
    return Object.values(weatherCache.value).find((weather) => weather.id === cityId)
  }

  const saveWeather = (query, weather) => {
    weatherCache.value[query.trim().toLowerCase()] = weather
  }

  // 좌표 소수점 차이로 같은 지역의 예보 캐시가 중복되지 않도록 키 정규화
  const getForecastCacheKey = (lat, lon) => {
    return `${Number(lat).toFixed(3)},${Number(lon).toFixed(3)}`
  }

  const getForecast = (lat, lon) => {
    const key = getForecastCacheKey(lat, lon)
    const cachedForecast = forecastCache.value[key]

    if (!cachedForecast) return null

    if (Date.now() - cachedForecast.savedAt >= forecastCacheDuration) {
      delete forecastCache.value[key]
      return null
    }

    return cachedForecast.data
  }

  const saveForecast = (lat, lon, forecast) => {
    const key = getForecastCacheKey(lat, lon)

    forecastCache.value[key] = {
      data: forecast,
      savedAt: Date.now(),
    }
  }

  // 개선 포인트: 저장 시각 추가 및 오래된 날씨의 캐시 만료 적용
  return {
    weatherCache,
    forecastCache,
    getWeather,
    getWeatherById,
    saveWeather,
    getForecast,
    saveForecast,
  }
})
