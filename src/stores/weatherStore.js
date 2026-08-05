import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useWeatherStore = defineStore('weather', () => {
  // 검색어 기반 메모리 캐시: 조회 결과의 페이지 간 재사용
  // 새로고침 시 초기화되는 실습용 단순 구조
  const weatherCache = ref({})

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

  // 개선 포인트: 저장 시각 추가 및 오래된 날씨의 캐시 만료 적용
  return { weatherCache, getWeather, getWeatherById, saveWeather }
})
