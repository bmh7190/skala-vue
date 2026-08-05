import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useWeatherStore = defineStore('weather', () => {
  const weatherCache = ref({})

  const getWeather = (query) => {
    return weatherCache.value[query.trim().toLowerCase()]
  }

  const getWeatherById = (cityId) => {
    return Object.values(weatherCache.value).find((weather) => weather.id === cityId)
  }

  const saveWeather = (query, weather) => {
    weatherCache.value[query.trim().toLowerCase()] = weather
  }

  return { weatherCache, getWeather, getWeatherById, saveWeather }
})
