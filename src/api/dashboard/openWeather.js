import axios from 'axios'

const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY
const FORECAST_URL = 'https://api.openweathermap.org/data/2.5/forecast'

export const isOpenWeatherConfigured = () => Boolean(API_KEY)

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
