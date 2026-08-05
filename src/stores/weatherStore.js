import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useWeatherStore = defineStore('weather', () => {
  const weatherCache = ref({})

  const getWeather = (query) => {
    return weatherCache.value[query.trim().toLowerCase()]
  }

  const saveWeather = (query, weather) => {
    weatherCache.value[query.trim().toLowerCase()] = weather
  }

  return { weatherCache, getWeather, saveWeather }
})
