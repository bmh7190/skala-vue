import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const CURRENT_WEATHER_URL = 'https://api.openweathermap.org/data/2.5/weather'
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast'
const GEOCODING_URL = 'https://api.openweathermap.org/geo/1.0/direct'

export const isOpenWeatherConfigured = () => Boolean(API_KEY)

// 도시명을 좌표와 국가 정보가 포함된 대시보드 위치 형태로 변환
export const fetchLocationByName = async (query) => {
  const response = await axios.get(GEOCODING_URL, {
    params: {
      q: query,
      limit: 1,
      appid: API_KEY,
    },
  })
  const location = response.data[0]

  if (!location) return null

  return {
    id: `api-${location.lat}-${location.lon}`,
    name: location.local_names?.ko ?? location.name,
    country: location.country,
    lat: location.lat,
    lon: location.lon,
  }
}

// 좌표 기반 현재 날씨를 대시보드에서 사용하는 형태로 변환
export const fetchCurrentWeatherByCoordinates = async (location) => {
  const response = await axios.get(CURRENT_WEATHER_URL, {
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

// 5일·3시간 간격 예보를 그래프에서 재사용하기 쉬운 형태로 변환
export const fetchForecastByCoordinates = async (lat, lon) => {
  const response = await axios.get(FORECAST_URL, {
    params: {
      lat,
      lon,
      units: 'metric',
      lang: 'kr',
      appid: API_KEY,
    },
  })

  const timezoneOffset = response.data.city?.timezone ?? 0

  return response.data.list.map((item) => ({
    timestamp: item.dt * 1000,
    localTimestamp: (item.dt + timezoneOffset) * 1000,
    temp: Math.round(item.main.temp),
    feelsLike: Math.round(item.main.feels_like),
    humidity: item.main.humidity,
    precipitation: Math.round((item.pop ?? 0) * 100),
    status: item.weather[0].description,
  }))
}
